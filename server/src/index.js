require('dotenv').config();
const express = require('express'), cors = require('cors'), mongoose = require('mongoose');
const bcrypt = require('bcrypt'), jwt = require('jsonwebtoken');
const { User, Company, Lead, Task } = require('./models');

const app = express();
app.use(cors({ origin: (process.env.CLIENT_URL || '*').split(',') }));
app.use(express.json());
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const same = (a, b) => a && b && String(a._id || a) === String(b._id || b);

// ---------- Auth middleware (JWT access token) ----------
const auth = wrap(async (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id);
  } catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
  if (!req.user) return res.status(401).json({ message: 'User no longer exists' });
  next();
});
const isAdmin = (u) => u.role === 'admin';

// ---------- Auth ----------
app.post('/api/auth/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid email or password' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}));
app.get('/api/auth/me', auth, (req, res) => res.json({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }));
app.get('/api/users', auth, wrap(async (req, res) => res.json(await User.find().select('name email role').sort('name'))));

// ---------- Dashboard (aggregation) ----------
app.get('/api/dashboard', auth, wrap(async (req, res) => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  const [leads, tasks] = await Promise.all([
    Lead.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: null, total: { $sum: 1 }, qualified: { $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] } } } }]),
    Task.aggregate([{ $group: { _id: null,
      dueToday: { $sum: { $cond: [{ $and: [{ $gte: ['$dueDate', start] }, { $lt: ['$dueDate', end] }, { $ne: ['$status', 'Done'] }] }, 1, 0] } },
      completed: { $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] } } } }]),
  ]);
  res.json({ totalLeads: leads[0]?.total || 0, qualifiedLeads: leads[0]?.qualified || 0, tasksDueToday: tasks[0]?.dueToday || 0, completedTasks: tasks[0]?.completed || 0 });
}));

// ---------- Leads ----------
// Authorization: admin -> any lead; user -> only leads they created or are assigned to
const canModifyLead = (u, l) => isAdmin(u) || same(l.createdBy, u._id) || same(l.assignedTo, u._id);
const leadPop = [{ path: 'assignedTo', select: 'name' }, { path: 'company', select: 'name' }];
const leadFields = ({ name, email, phone, status, assignedTo, company }) => ({ name, email, phone, status, assignedTo: assignedTo || null, company: company || null });

app.get('/api/leads', auth, wrap(async (req, res) => {
  const page = Math.max(+req.query.page || 1, 1), limit = Math.min(+req.query.limit || 10, 100);
  const q = {};
  if (req.query.status) q.status = req.query.status;
  if (req.query.company) q.company = req.query.company;
  if (req.query.search) { const r = new RegExp(esc(req.query.search), 'i'); q.$or = [{ name: r }, { email: r }, { phone: r }]; }
  const [items, total] = await Promise.all([
    Lead.find(q).populate(leadPop).sort('-createdAt').skip((page - 1) * limit).limit(limit),
    Lead.countDocuments(q)]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));
app.get('/api/leads/:id', auth, wrap(async (req, res) => {
  const l = await Lead.findById(req.params.id);
  l ? res.json(l) : res.status(404).json({ message: 'Lead not found' });
}));
app.post('/api/leads', auth, wrap(async (req, res) => res.status(201).json(await Lead.create({ ...leadFields(req.body), createdBy: req.user._id }))));
app.put('/api/leads/:id', auth, wrap(async (req, res) => {
  const l = await Lead.findById(req.params.id);
  if (!l) return res.status(404).json({ message: 'Lead not found' });
  if (!canModifyLead(req.user, l)) return res.status(403).json({ message: 'You cannot edit this lead' });
  Object.assign(l, leadFields(req.body)); await l.save(); res.json(l);
}));
app.patch('/api/leads/:id/status', auth, wrap(async (req, res) => {
  const l = await Lead.findById(req.params.id);
  if (!l) return res.status(404).json({ message: 'Lead not found' });
  if (!canModifyLead(req.user, l)) return res.status(403).json({ message: 'You cannot update this lead' });
  l.status = req.body.status; await l.save(); res.json(l);
}));
app.delete('/api/leads/:id', auth, wrap(async (req, res) => { // soft delete
  const l = await Lead.findById(req.params.id);
  if (!l) return res.status(404).json({ message: 'Lead not found' });
  if (!canModifyLead(req.user, l)) return res.status(403).json({ message: 'You cannot delete this lead' });
  l.isDeleted = true; l.deletedAt = new Date(); await l.save(); res.json({ message: 'Lead deleted' });
}));

// ---------- Companies ----------
app.get('/api/companies', auth, wrap(async (req, res) => res.json(await Company.find().sort('name'))));
app.post('/api/companies', auth, wrap(async (req, res) => {
  const { name, industry, location } = req.body;
  res.status(201).json(await Company.create({ name, industry, location }));
}));
app.get('/api/companies/:id', auth, wrap(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ message: 'Company not found' });
  const leads = await Lead.find({ company: company._id }).populate('assignedTo', 'name'); // excludes soft-deleted
  res.json({ company, leads });
}));

// ---------- Tasks ----------
// Authorization: any user can create tasks; ONLY the assigned user can change status
const taskPop = [{ path: 'lead', select: 'name' }, { path: 'assignedTo', select: 'name' }];
app.get('/api/tasks', auth, wrap(async (req, res) => {
  const q = isAdmin(req.user) ? {} : { $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }] };
  res.json(await Task.find(q).populate(taskPop).sort('dueDate'));
}));
app.post('/api/tasks', auth, wrap(async (req, res) => {
  const { title, lead, assignedTo, dueDate } = req.body;
  if (!(await Lead.findById(lead))) return res.status(400).json({ message: 'Lead not found' });
  if (!(await User.findById(assignedTo))) return res.status(400).json({ message: 'Assignee not found' });
  res.status(201).json(await Task.create({ title, lead, assignedTo, dueDate, createdBy: req.user._id }));
}));
app.patch('/api/tasks/:id/status', auth, wrap(async (req, res) => {
  const t = await Task.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Task not found' });
  if (!same(t.assignedTo, req.user._id)) return res.status(403).json({ message: 'Only the assigned user can update this task' });
  t.status = req.body.status; await t.save(); res.json(t);
}));

app.use((err, req, res, next) => {
  console.error(err);
  const msg = err.code === 11000 ? 'Duplicate value' : err.message;
  res.status(err.name === 'ValidationError' || err.name === 'CastError' || err.code === 11000 ? 400 : 500).json({ message: msg });
});

mongoose.connect(process.env.MONGO_URI).then(() =>
  app.listen(process.env.PORT || 5000, () => console.log('API running'))).catch((e) => { console.error(e); process.exit(1); });

require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcrypt');
const { User, Company, Lead, Task } = require('./models');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Company.deleteMany(), Lead.deleteMany({}, { withDeleted: true }), Task.deleteMany()]);
  const pw = await bcrypt.hash('password123', 10);
  const [admin, john] = await User.create([
    { name: 'Admin', email: 'admin@crm.com', password: pw, role: 'admin' },
    { name: 'John', email: 'john@crm.com', password: pw }]);
  const abc = await Company.create({ name: 'ABC Corp', industry: 'IT', location: 'Chennai' });
  const [ravi] = await Lead.create([
    { name: 'Ravi', email: 'r@mail.com', phone: '9999999999', status: 'New', assignedTo: john._id, company: abc._id, createdBy: admin._id },
    { name: 'Meena', email: 'm@mail.com', status: 'Qualified', assignedTo: admin._id, company: abc._id, createdBy: admin._id }]);
  await Task.create({ title: 'Call', lead: ravi._id, assignedTo: john._id, createdBy: admin._id, dueDate: new Date() });
  console.log('Seeded. Logins: admin@crm.com / john@crm.com, password: password123');
  process.exit();
})();

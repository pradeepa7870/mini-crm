const mongoose = require('mongoose');
const { Schema } = mongoose;
const ref = (m) => ({ type: Schema.Types.ObjectId, ref: m });

const User = mongoose.model('User', new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, { timestamps: true }));

const Company = mongoose.model('Company', new Schema({
  name: { type: String, required: true, trim: true },
  industry: String, location: String,
}, { timestamps: true }));

const leadSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: String,
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Lost'], default: 'New' },
  assignedTo: ref('User'), company: ref('Company'), createdBy: ref('User'),
  isDeleted: { type: Boolean, default: false }, deletedAt: Date,
}, { timestamps: true });
// Soft delete: every normal query excludes deleted leads automatically
['find', 'findOne', 'findOneAndUpdate', 'countDocuments'].forEach((h) =>
  leadSchema.pre(h, function () { if (!this.getOptions().withDeleted) this.where({ isDeleted: false }); }));
const Lead = mongoose.model('Lead', leadSchema);

const Task = mongoose.model('Task', new Schema({
  title: { type: String, required: true, trim: true },
  lead: { ...ref('Lead'), required: true },
  assignedTo: { ...ref('User'), required: true },
  createdBy: ref('User'),
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Done'], default: 'Pending' },
}, { timestamps: true }));

module.exports = { User, Company, Lead, Task };

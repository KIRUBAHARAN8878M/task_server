import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  status: { type: String, enum: ['todo','inprogress','done'], default: 'todo' },
  dueDate: { type: Date },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // for manager visibility
}, { timestamps: true });

export default mongoose.model('Task', TaskSchema);

import User from '../models/User.js';

export const listUsers = async (req, res) => {
  const users = await User.find().select('_id name email role createdAt');
  res.json(users);
};

export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['admin','manager','user'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const u = await User.findByIdAndUpdate(id, { role }, { new: true }).select('_id name email role');
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json(u);
};

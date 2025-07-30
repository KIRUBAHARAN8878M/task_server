import Task from '../models/Task.js';

export const listTasks = async (req, res) => {
  const { status, sort = '-createdAt', page = 1, limit = 10 } = req.query;
  const q = {};
  if (status) q.status = status;

  const { role, sub } = req.user;

  if (role === 'user') {
    q.owner = sub;
  } else if (role === 'manager') {
    q.$or = [{ owner: sub }, { teamIds: { $in: [sub] } }];
  } // admin: no filter

  const skip = (Number(page) - 1) * Number(limit);
  const tasks = await Task.find(q).sort(sort).skip(skip).limit(Number(limit));
  const total = await Task.countDocuments(q);
  res.json({ data: tasks, total, page: Number(page), limit: Number(limit) });
};


// Get single: user -> own; manager -> own OR team; admin -> any
export const getTask = async (req, res) => {
  const t = await Task.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Task not found' });

  const { role, sub } = req.user;
  if (role === 'user' && !t.owner.equals(sub)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (role === 'manager') {
    const isOwner = t.owner.equals(sub);
    const isTeam = t.teamIds?.map(String).includes(sub);
    if (!isOwner && !isTeam) return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(t);
};

// Create: user -> owner=self; manager -> owner=self; admin -> owner override allowed
export const createTask = async (req, res) => {
  const { title, description, priority, dueDate, teamIds, owner: ownerFromBody } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  let owner = req.user.sub;
  if (req.user.role === 'admin' && ownerFromBody) {
    owner = ownerFromBody; // only admin may assign owner
  }

  const task = await Task.create({ title, description, priority, dueDate, owner, teamIds });
  res.status(201).json(task);
};

// Update: admin -> any field; manager -> own/team & no title/owner change; user -> own & status only
export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const { role, sub } = req.user;

  let allowedFields = [];
  if (role === 'admin') {
    allowedFields = ['title','description','priority','status','dueDate','owner','teamIds'];
  } else if (role === 'manager') {
    const isOwner = task.owner.equals(sub);
    const isTeam = task.teamIds?.map(String).includes(sub);
    if (!isOwner && !isTeam) return res.status(403).json({ message: 'Forbidden' });
    if (req.body.title !== undefined) return res.status(403).json({ message: 'Managers cannot change title' });
    if (req.body.owner !== undefined) return res.status(403).json({ message: 'Managers cannot change assignee' });
    allowedFields = ['description','priority','status','dueDate','teamIds'];
  } else if (role === 'user') {
    if (!task.owner.equals(sub)) return res.status(403).json({ message: 'Forbidden' });
    allowedFields = ['status'];
  } else {
    return res.status(403).json({ message: 'Forbidden' });
  }

  for (const f of allowedFields) {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  }

  await task.save();
  res.json(task);
};

// Delete: admin only
export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  await task.deleteOne();
  res.status(204).send();
};
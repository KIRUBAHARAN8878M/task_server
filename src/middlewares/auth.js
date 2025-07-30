import { verifyAccess } from '../config/jwt.js';

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing access token' });
  try {
    const payload = verifyAccess(token);
    req.user = payload; // { sub, role, email }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid/expired access token' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};

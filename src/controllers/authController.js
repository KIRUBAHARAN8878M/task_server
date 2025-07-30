import Joi from 'joi';
import User from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefresh } from '../config/jwt.js';

const cookieOpts = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export const register = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const exists = await User.findOne({ email: value.email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create(value);
  const accessToken = signAccessToken({ sub: user._id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user._id });

  res.cookie('rtk', refreshToken, cookieOpts);
  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken
  });
};

export const login = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const user = await User.findOne({ email: value.email }).select('+password');
  if (!user || !(await user.comparePassword(value.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = signAccessToken({ sub: user._id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user._id });

  res.cookie('rtk', refreshToken, cookieOpts);
  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken
  });
};

export const refresh = async (req, res) => {
  const token = req.cookies?.rtk;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const { sub } = verifyRefresh(token);
    const user = await User.findById(sub);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

    const accessToken = signAccessToken({ sub: user._id, role: user.role, email: user.email });
    res.json({ accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('rtk', { path: '/api/auth' });
  res.json({ message: 'Logged out' });
};

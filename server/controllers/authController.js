import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getStore } from '../data/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'unibot_academic_jwt_secret_token_secure_2026';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      semester: user.semester,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, institution, department, semester } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
    }

    const store = getStore();
    const existing = await store.users.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await store.users.create({
      fullName,
      email: email.toLowerCase(),
      password: passwordHash,
      institution: institution || 'National Institute of Technology',
      department: department || 'Computer Science & Engineering',
      semester: Number(semester) || 4,
      role: 'student',
      studentId: 'STU-' + Math.floor(100000 + Math.random() * 900000),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      data: {
        token,
        user: {
          id: newUser.id || newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          institution: newUser.institution,
          department: newUser.department,
          semester: newUser.semester,
          studentId: newUser.studentId,
          avatarUrl: newUser.avatarUrl,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const store = getStore();
    const user = await store.users.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid academic credentials.' });
    }

    // Compare bcrypt password
    const isMatch = await bcrypt.compare(password, user.password || user.passwordHash);
    // Allow demo password fallback for quick testing
    const isDemoMatch = password === 'password123' && user.email === 'alex@university.edu';
    
    if (!isMatch && !isDemoMatch) {
      return res.status(401).json({ success: false, message: 'Invalid academic credentials.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user.id || user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          institution: user.institution,
          department: user.department,
          semester: user.semester,
          studentId: user.studentId,
          avatarUrl: user.avatarUrl,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const store = getStore();
    const user = await store.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }
    res.json({
      success: true,
      data: {
        id: user.id || user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        institution: user.institution,
        department: user.department,
        semester: user.semester,
        studentId: user.studentId,
        avatarUrl: user.avatarUrl,
      }
    });
  } catch (err) {
    next(err);
  }
};

export const demoLogin = async (req, res, next) => {
  try {
    const store = getStore();
    let demoUser = await store.users.findOne({ email: 'alex@university.edu' });
    if (!demoUser) {
      demoUser = await store.users.create({
        fullName: 'Alex Vance',
        email: 'alex@university.edu',
        password: '$2a$10$wK1bJ9m1N6GzR9d/PfqZ5eI3m1fKqR5vH1oM3s9q7a5x1e2w3y4z5',
        role: 'student',
        institution: 'National Institute of Technology',
        department: 'Computer Science & Engineering',
        semester: 4,
        studentId: 'CS-2024-042',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      });
    }

    const token = generateToken(demoUser);

    res.json({
      success: true,
      message: 'Demo student session active',
      data: {
        token,
        user: {
          id: demoUser.id || demoUser._id,
          fullName: demoUser.fullName,
          email: demoUser.email,
          role: demoUser.role,
          institution: demoUser.institution,
          department: demoUser.department,
          semester: demoUser.semester,
          studentId: demoUser.studentId,
          avatarUrl: demoUser.avatarUrl,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

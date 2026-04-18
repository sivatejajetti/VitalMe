const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const session = require('express-session');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const analyticsRoutes = require('./routes/analytics');
const insightsRoutes = require('./routes/insights');
const scoreRoutes = require('./routes/score');
const achievementsRoutes = require('./routes/achievements');
const historyRoutes = require('./routes/history');
const goalsRoutes = require('./routes/goals');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:8080';

app.use(cors({
  origin: [frontendURL, 'http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:5173'],
  credentials: true
}));

const isProd = process.env.NODE_ENV === 'production';

// Custom Supabase Session Store
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const Store = session.Store;
class SupabaseStore extends Store {
  constructor() { super(); }
  async get(sid, cb) {
    try {
      const { data } = await supabase.from('session').select('sess').eq('sid', sid).maybeSingle();
      cb(null, data ? data.sess : null);
    } catch (e) { cb(e); }
  }
  async set(sid, sess, cb) {
    try {
      const expire = sess.cookie.expires ? new Date(sess.cookie.expires) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      await supabase.from('session').upsert({ sid, sess, expire });
      cb(null);
    } catch (e) { cb(e); }
  }
  async destroy(sid, cb) {
    try {
      await supabase.from('session').delete().eq('sid', sid);
      cb(null);
    } catch (e) { cb(e); }
  }
}

app.use(session({
  store: new SupabaseStore(),
  secret: process.env.SESSION_SECRET || 'vitalme_default_secret',
  resave: false,
  saveUninitialized: false,
  proxy: isProd,
  cookie: {
    secure: isProd, 
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Health Check
app.get('/health', (req, res) => res.json({ status: "OK", timestamp: new Date() }));

// API Routes
app.use('/auth', authRoutes);
app.use('/api/health', require('./routes/health'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/score', require('./routes/score'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/history', require('./routes/history'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/logs', require('./routes/logs')); // Added for pushups/water tracking
app.use('/api/goals', goalsRoutes);
app.use('/api/insights', require('./routes/insights'));
app.use('/api/user', userRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong! " + err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 VitalMe Backend running at http://localhost:${PORT}`);
});

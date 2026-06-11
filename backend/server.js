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
const frontendURL = process.env.FRONTEND_URL || 'https://vitalme.vercel.app';

app.use(cors({
  origin: [frontendURL, 'https://vitalme.vercel.app', 'http://localhost:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:5173'],
  credentials: true
}));

const isProd = process.env.NODE_ENV === 'production';

// Custom Supabase Session Store
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

class SupabaseStore extends session.Store {
  constructor() { super(); }
  async get(sid, cb) {
    try {
      console.log("SupabaseStore: Getting session for sid:", sid);
      const { data, error } = await supabase.from('session').select('sess').eq('sid', sid).maybeSingle();
      if (error) {
        console.error("SupabaseStore: Get database error:", error);
        return cb(null, null); // Fail-safe: treat as session not found instead of crashing
      }
      console.log("SupabaseStore: Get result:", data ? "Session Found" : "Session Not Found");
      cb(null, data ? data.sess : null);
    } catch (e) {
      console.error("SupabaseStore: Get exception:", e);
      cb(null, null); // Fail-safe
    }
  }
  async set(sid, sess, cb) {
    try {
      console.log("SupabaseStore: Setting session for sid:", sid);
      const expire = sess.cookie.expires ? new Date(sess.cookie.expires) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      const { error } = await supabase.from('session').upsert({ sid, sess, expire });
      if (error) {
        console.error("SupabaseStore: Set database error:", error);
        return cb(null); // Fail-safe
      }
      console.log("SupabaseStore: Set session successfully.");
      cb(null);
    } catch (e) {
      console.error("SupabaseStore: Set exception:", e);
      cb(null); // Fail-safe
    }
  }
  async destroy(sid, cb) {
    try {
      console.log("SupabaseStore: Destroying session for sid:", sid);
      const { error } = await supabase.from('session').delete().eq('sid', sid);
      if (error) {
        console.error("SupabaseStore: Destroy database error:", error);
        return cb(null); // Fail-safe
      }
      cb(null);
    } catch (e) {
      console.error("SupabaseStore: Destroy exception:", e);
      cb(null); // Fail-safe
    }
  }
}

// Header-to-Cookie Session Bridge Middleware (Bypasses third-party cookie restrictions)
app.use((req, res, next) => {
  let sid = req.headers['x-session-id'] || req.query.sid;
  
  if (!sid && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      sid = parts[1];
    }
  }

  if (sid) {
    const secret = process.env.SESSION_SECRET || 'vitalme_default_secret';
    const crypto = require('crypto');
    const signed = sid + '.' + crypto
      .createHmac('sha256', secret)
      .update(sid)
      .digest('base64')
      .replace(/\=+$/, '');
    
    const cookieName = 'connect.sid';
    const cookieValue = 's:' + signed;
    
    let cookies = req.headers.cookie || '';
    if (cookies.includes(cookieName)) {
      cookies = cookies.replace(new RegExp(`${cookieName}=[^;]+`), `${cookieName}=${encodeURIComponent(cookieValue)}`);
    } else {
      cookies = cookies ? `${cookies}; ${cookieName}=${encodeURIComponent(cookieValue)}` : `${cookieName}=${encodeURIComponent(cookieValue)}`;
    }
    req.headers.cookie = cookies;
  }
  next();
});

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

// Temporary Database/Session Diagnostics Route
app.get('/auth/diagnose-db', async (req, res) => {
  try {
    const results = {};
    results.url_configured = !!process.env.SUPABASE_URL;
    results.key_configured = !!process.env.SUPABASE_KEY;
    results.url_value = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 20) + '...' : null;
    
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      // Test 1: Simple SELECT limit 1
      const { data: selectData, error: selectError } = await supabase
        .from('session')
        .select('*')
        .limit(1);
      
      results.session_select = {
        success: !selectError,
        error: selectError ? {
          message: selectError.message,
          code: selectError.code,
          details: selectError.details,
          hint: selectError.hint
        } : null,
        data_count: selectData ? selectData.length : 0
      };

      // Test 2: Try an upsert of a test session
      const testSid = 'test-diagnose-' + Date.now();
      const testSess = { cookie: { expires: new Date(Date.now() + 60000) }, test: true };
      const testExpire = new Date(Date.now() + 60000);
      
      const { error: upsertError } = await supabase
        .from('session')
        .upsert({ sid: testSid, sess: testSess, expire: testExpire });

      results.session_upsert = {
        success: !upsertError,
        error: upsertError ? {
          message: upsertError.message,
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint
        } : null
      };

      if (!upsertError) {
        // Clean up
        await supabase.from('session').delete().eq('sid', testSid);
      }
    } else {
      results.error = "Supabase env vars are missing";
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

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

const express = require('express');
const router = express.Router();
const db = require('../db');

// حماية بسيطة: يتطلب الهيدر x-admin-password مطابقًا لقيمة ADMIN_PASSWORD
function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

// GET /admin/visitors — قائمة آخر الزوار (مع صفحات)
router.get('/admin/visitors', requireAdmin, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = parseInt(req.query.offset) || 0;

  const rows = db.prepare(`
    SELECT * FROM visitors ORDER BY id DESC LIMIT ? OFFSET ?
  `).all(limit, offset);

  const total = db.prepare(`SELECT COUNT(*) AS count FROM visitors`).get().count;

  res.json({ ok: true, total, rows });
});

// GET /admin/stats — إحصائيات مختصرة
router.get('/admin/stats', requireAdmin, (req, res) => {
  const total = db.prepare(`SELECT COUNT(*) AS count FROM visitors`).get().count;
  const byCountry = db.prepare(`
    SELECT country, COUNT(*) AS count FROM visitors
    WHERE country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 10
  `).all();
  const byDevice = db.prepare(`
    SELECT device_type, COUNT(*) AS count FROM visitors
    GROUP BY device_type ORDER BY count DESC
  `).all();
  const last24h = db.prepare(`
    SELECT COUNT(*) AS count FROM visitors
    WHERE created_at >= datetime('now', '-1 day')
  `).get().count;

  res.json({ ok: true, total, last24h, byCountry, byDevice });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { UAParser } = require('ua-parser-js');
const geoip = require('geoip-lite');
const db = require('../db');

// يستخرج IP الحقيقي للزائر (يدعم العمل خلف بروكسي/منصات الاستضافة السحابية)
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress;
}

// POST /track — يستقبل بيانات من صفحة الموقع ويسجلها
router.post('/track', (req, res) => {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();

    const geo = geoip.lookup(ip); // تقريبي فقط، غير دقيق في الشبكات الريفية/الموبايل

    const { language, screen, timezone, referrer, page } = req.body || {};

    const stmt = db.prepare(`
      INSERT INTO visitors
        (ip, country, city, user_agent, device_type, browser, os, language, screen_size, timezone, referrer, page)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      ip,
      geo?.country || null,
      geo?.city || null,
      userAgent,
      uaResult.device.type || 'desktop',
      `${uaResult.browser.name || ''} ${uaResult.browser.version || ''}`.trim(),
      `${uaResult.os.name || ''} ${uaResult.os.version || ''}`.trim(),
      language || null,
      screen || null,
      timezone || null,
      referrer || null,
      page || null
    );

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('خطأ في تسجيل الزائر:', err.message);
    res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

module.exports = router;

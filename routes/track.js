const express = require('express');
const router = express.Router();
const { UAParser } = require('ua-parser-js');
const db = require('../db');

const IPINFO_TOKEN = process.env.IPINFO_TOKEN || '';

// يستخرج IP الحقيقي للزائر (يدعم العمل خلف بروكسي/منصات الاستضافة السحابية)
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress;
}

// يتحقق إن كان IP محليًا (أثناء التجربة على الجهاز نفسه) فلا داعي لطلب موقعه
function isPrivateIp(ip) {
  if (!ip) return true;
  return (
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip.startsWith('::ffff:127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.')
  );
}

// يستعلم عن موقع الـ IP عبر ipinfo.io (الخطة المجانية)
async function lookupIp(ip) {
  if (isPrivateIp(ip) || !IPINFO_TOKEN) return { country: null, city: null, region: null };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const resp = await fetch(`https://ipinfo.io/${ip}/json?token=${IPINFO_TOKEN}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) return { country: null, city: null, region: null };

    const data = await resp.json();
    return {
      country: data.country || null,
      city: data.city || null,
      region: data.region || null,
    };
  } catch (err) {
    console.error('تعذّر الاستعلام عن موقع IP عبر ipinfo.io:', err.message);
    return { country: null, city: null, region: null };
  }
}

// POST /track — يستقبل بيانات من صفحة الموقع ويسجلها
router.post('/track', async (req, res) => {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();

    const geo = await lookupIp(ip);

    const { language, screen, timezone, referrer, page } = req.body || {};

    const stmt = db.prepare(`
      INSERT INTO visitors
        (ip, country, city, user_agent, device_type, browser, os, language, screen_size, timezone, referrer, page)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      ip,
      geo.country ? `${geo.country}${geo.region ? ' - ' + geo.region : ''}` : null,
      geo.city,
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

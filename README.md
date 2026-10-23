# Visitor Backend

Backend بسيط (Node.js/Express) لتسجيل بيانات الزوار (IP، الجهاز، المتصفح، اللغة، المنطقة الزمنية...) لموقع مستضاف على GitHub Pages.

## 1. التشغيل محليًا

```bash
npm install
cp .env.example .env
# عدّل ADMIN_PASSWORD و ALLOWED_ORIGIN في .env
npm start
```

الخادم يعمل افتراضيًا على `http://localhost:3000`.

## 2. نشره مجانًا (Render مثال)

1. ارفع هذا المجلد إلى مستودع GitHub جديد.
2. على [render.com](https://render.com): New → Web Service → اختر المستودع.
3. Build Command: `npm install` — Start Command: `npm start`.
4. أضف متغيرات البيئة من `.env.example` في إعدادات الخدمة (Environment).
5. بعد النشر ستحصل على رابط مثل `https://your-backend.onrender.com`.

خدمات بديلة: Railway، Fly.io، Cyclic.

## 3. ربطه بموقع GitHub Pages

انسخ محتوى `frontend-snippet.html` إلى صفحتك، وعدّل `BACKEND_URL` إلى رابط الخادم بعد نشره.

## 4. لوحة الإدارة

افتح `public/index.html` (محليًا أو بعد رفعه)، عدّل `API_BASE` فيه إلى رابط الـ backend، وسجّل الدخول بكلمة `ADMIN_PASSWORD`.

نقاط API:
- `POST /track` — تسجيل زيارة (تُستدعى من الموقع تلقائيًا)
- `GET /admin/visitors` — قائمة الزوار (يتطلب هيدر `x-admin-password`)
- `GET /admin/stats` — إحصائيات (نفس الحماية)

## ملاحظات مهمة

- **الخصوصية:** أضف صفحة "سياسة الخصوصية" توضح أنك تجمع IP ونوع الجهاز، حتى بدون نافذة منبثقة — سطر صغير في الفوتر كافٍ.
- **لا تخزّن بيانات دفع** في هذا النظام؛ هو لتحليلات الزوار فقط.
- **دقة الموقع الجغرافي عبر IP محدودة جدًا**، خصوصًا في المناطق الريفية وشبكات الجوال في سوريا — استخدمه كتقدير وليس كحقيقة.
- غيّر `ADMIN_PASSWORD` إلى كلمة قوية قبل النشر، ولا ترفع ملف `.env` إلى GitHub (أضفه إلى `.gitignore`).

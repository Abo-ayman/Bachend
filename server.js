require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const trackRoutes = require('./routes/track');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

app.use(express.json());

// يسمح فقط لموقعك (GitHub Pages) بالاتصال بالـ API
app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST'],
}));

app.use('/', trackRoutes);
app.use('/', adminRoutes);

// لوحة إدارة بسيطة (HTML) لعرض الزوار
app.use('/dashboard', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Visitor tracking backend يعمل بنجاح ✅');
});

app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});

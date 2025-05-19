const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// استخدام المجلد العام للملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// تعريف المسار الرئيسي
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// بدء الخادم
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
  console.log(`افتح المتصفح على العنوان: http://localhost:${PORT}`);
});

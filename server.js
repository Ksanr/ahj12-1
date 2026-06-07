const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();


const corsOptions = {
    origin: 'https://ksanr.github.io',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware для искусственной задержки (5 секунды)
const slowMiddleware = (req, res, next) => {
  setTimeout(next, 5000);
};

// Пример данных (имитация постов)
const mockPosts = [
  { id: 1, title: 'Первый пост', body: 'Содержимое первого поста с задержкой загрузки.' },
  { id: 2, title: 'Второй пост', body: 'Здесь может быть ваш текст. Анимация скелетона отображается до получения ответа.' },
  { id: 3, title: 'Работа Service Worker', body: 'Даже без интернета страница откроется, но покажет ошибку.' },
  { id: 4, title: 'Современный DOM', body: 'Используем append, prepend, after, remove.' },
  { id: 5, title: 'Webpack + Workbox', body: 'Автоматическая генерация SW с прекешем.' }
];

app.get('/api/posts', slowMiddleware, (req, res) => {
  res.json(mockPosts);
});

// Раздача статики из папки dist
app.use(express.static(path.join(__dirname, 'dist')));

// Все остальные маршруты отдаём index.html (SPA)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});

module.exports = app;
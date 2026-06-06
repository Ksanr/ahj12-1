require('./styles.css');

// ===== Состояния приложения =====
let currentState = 'loading'; // loading, error, loaded
let retryCallback = null;

// DOM элементы
const appDiv = document.getElementById('app');

// Функция отрисовки скелетона
function renderSkeleton() {
  appDiv.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'app-container';
  container.innerHTML = `
    <div class="skeleton">
      <div class="skeleton-header"></div>
      ${Array(5).fill(`
        <div class="skeleton-item">
          <div class="skeleton-avatar"></div>
          <div style="flex:1">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  appDiv.append(container);
}

// Функция отрисовки ошибки
function renderError(message = 'Не удалось загрузить данные. Проверьте соединение.') {
  appDiv.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'app-container';
  container.innerHTML = `
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <div class="error-message">${message}</div>
      <button class="retry-btn" data-retry>Попробовать снова</button>
    </div>
  `;
  appDiv.append(container);

  const retryBtn = container.querySelector('[data-retry]');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      if (retryCallback) retryCallback();
    });
  }
}

// Функция отрисовки реальных данных
function renderData(data) {
  if (!Array.isArray(data)) return;
  appDiv.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'app-container';
  const postsHtml = `
    <div class="posts-list">
      ${data.map(post => `
        <div class="post-card">
          <div class="post-title">${escapeHtml(post.title)}</div>
          <div class="post-body">${escapeHtml(post.body)}</div>
        </div>
      `).join('')}
    </div>
  `;
  container.insertAdjacentHTML('beforeend', postsHtml);
  appDiv.append(container);
}

// Простая защита от XSS
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Загрузка данных с API (через fetch)
async function fetchData() {
  const apiUrl = process.env.API_BASE_URL
    ? `${process.env.API_BASE_URL}/api/posts`
    : '/api/posts'; // для локальной разработки с прокси

  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

// Основной цикл загрузки
async function loadData() {
  currentState = 'loading';
  renderSkeleton();

  try {
    const data = await fetchData();
    renderData(data);
    currentState = 'loaded';
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    currentState = 'error';
    renderError('Сервер недоступен или данные не получены. Попробуйте позже.');
    // Устанавливаем колбэк для повтора
    retryCallback = () => loadData();
  }
}

// Регистрация Service Worker с Workbox
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW зарегистрирован:', reg))
      .catch(err => console.log('SW регистрация не удалась:', err));
  });
}

// Запуск загрузки
loadData();
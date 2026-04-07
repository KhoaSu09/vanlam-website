// ui.js - Modern UI & Shared Components for Vanlam Technologies

(function() {
  const THEME_KEY = 'vl_theme';
  const SITE_NAME = 'Vanlam Technologies';

  // 1. Initial Theme Setup
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    initThemeToggle();
    initMobileMenu();
    initScrollReveal();
    updateActiveLink();
  });

  // 2. Header Injection (Includes Admin Links)
  function injectHeader() {
    const existingHeader = document.querySelector('header');
    if (existingHeader) existingHeader.remove();

    const currentUser = window.vlAuth ? window.vlAuth.getCurrentUser() : null;
    const isAdmin = currentUser && currentUser.role === 'admin';

    const header = document.createElement('header');
    header.className = 'header';
    header.innerHTML = `
      <div class="container nav">
        <a href="index.html" class="logo">
          <span style="font-size: 1.5rem;">🚀</span> ${SITE_NAME}
        </a>
        
        <nav class="menu" id="vlMenu">
          <a href="index.html">Trang chủ</a>
          <a href="services.html">Dịch vụ</a>
          <a href="shop.html">Sản phẩm</a>
          <a href="news.html">Tin tức</a>
          <a href="documents.html">Tài liệu</a>
          <a href="about.html">Giới thiệu</a>
          <a href="contact.html">Liên hệ</a>
          ${isAdmin ? `
            <a href="posts.html" class="admin-only">QL Tin tức</a>
            <a href="products.html" class="admin-only">QL Sản phẩm</a>
            <a href="manage-documents.html" class="admin-only">QL Tài liệu</a>
          ` : ''}
        </nav>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <button class="theme-toggle" id="vlThemeToggle" title="Chuyển chế độ Sáng/Tối">
            ${document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'}
          </button>
          <button class="mobile-toggle" id="vlMobileToggle">☰</button>
        </div>
      </div>
    `;
    document.body.prepend(header);
  }

  // 3. Footer Injection
  function injectFooter() {
    const existingFooter = document.querySelector('footer');
    if (existingFooter) existingFooter.remove();

    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <h4 style="font-size: 1.25rem; font-weight: 800; color: white;">${SITE_NAME}</h4>
            <p style="margin-top: 1rem;">Cung cấp giải pháp chuyển đổi số và hạ tầng công nghệ hiện đại hàng đầu Việt Nam.</p>
          </div>
          <div>
            <h4>Liên kết nhanh</h4>
            <ul style="list-style: none;">
              <li><a href="services.html">Dịch vụ</a></li>
              <li><a href="shop.html">Sản phẩm</a></li>
              <li><a href="news.html">Tin tức</a></li>
              <li><a href="documents.html">Tài liệu</a></li>
            </ul>
          </div>
          <div>
            <h4>Hỗ trợ</h4>
            <ul style="list-style: none;">
              <li><a href="contact.html">Liên hệ</a></li>
              <li><a href="about.html">Về chúng tôi</a></li>
              <li><a href="#">Điều khoản sử dụng</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
            </ul>
          </div>
          <div>
            <h4>Liên hệ</h4>
            <p>📧 khoasu.tech020@gmail.com</p>
            <p>📞 0912 818 815</p>
            <p>📍 Hà Nội, Việt Nam</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
        </div>
      </div>
    `;
    document.body.append(footer);
  }

  // 4. Theme Toggle Logic
  function initThemeToggle() {
    const btn = document.getElementById('vlThemeToggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
      btn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
    });
  }

  // 5. Mobile Menu Logic
  function initMobileMenu() {
    const toggle = document.getElementById('vlMobileToggle');
    const menu = document.getElementById('vlMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      menu.classList.toggle('active');
      toggle.innerHTML = menu.classList.contains('active') ? '✕' : '☰';
    });
  }

  // 6. Scroll Reveal Animations
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
  }

  // 7. Active Link Highlighting
  function updateActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.menu a');
    links.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      }
    });
  }
})();

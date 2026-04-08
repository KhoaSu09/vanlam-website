// ui.js - Modern UI & Shared Components for Vanlam Technologies

(function() {
  const THEME_KEY = 'vl_theme';
  const SITE_NAME = 'Vanlam Technologies';

  // 1. Initial Theme Setup
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  document.addEventListener('DOMContentLoaded', () => {
    seedInitialData(); // Ensure site has content
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

  // 8. Seed Initial Data
  function seedInitialData() {
    const PRODUCTS_KEY = 'vl_products_v1';
    const POSTS_KEY = 'vl_posts_v1';

    // Seed Products
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      const initialProducts = [
        {
          id: 'p1',
          name: 'Hệ thống Camera AI thông minh',
          price: 15000000,
          description: 'Hệ thống camera giám sát tích hợp trí tuệ nhân tạo, nhận diện khuôn mặt và cảnh báo xâm nhập thời gian thực.',
          image: 'assets/img/elv_solutions.png'
        },
        {
          id: 'p2',
          name: 'Bộ lưu trữ Cloud doanh nghiệp',
          price: 5000000,
          description: 'Giải pháp lưu trữ đám mây an toàn, mã hóa đa lớp, băng thông rộng cho doanh nghiệp vừa và nhỏ.',
          image: 'assets/img/cloud_infra.png'
        },
        {
          id: 'p3',
          name: 'Thiết bị WiFi 6 Mesh chuyên dụng',
          price: 3500000,
          description: 'Công nghệ Mesh WiFi 6 mới nhất, đảm bảo vùng phủ sóng rộng và tốc độ cao cho văn phòng cao tầng.',
          image: 'assets/img/hero_main.png'
        }
      ];
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
    }

    // Seed Posts
    if (!localStorage.getItem(POSTS_KEY)) {
      const initialPosts = [
        {
          id: 'n1',
          title: 'Xu hướng chuyển đổi số năm 2026',
          date: new Date().toISOString(),
          content: 'Trong năm 2026, AI và Zero-trust Security sẽ là hai trụ cột chính trong chiến lược số hóa của các doanh nghiệp toàn cầu...',
          image: 'assets/img/consulting.png'
        },
        {
          id: 'n2',
          title: 'Vanlam Technologies đạt chứng nhận Bảo mật Quốc tế',
          date: new Date().toISOString(),
          content: 'Chúng tôi tự hào thông báo vừa hoàn tất quy trình kiểm định và đạt chứng nhận bảo mật thông tin chuẩn ISO/IEC 27001...',
          image: 'assets/img/ops_247.png'
        }
      ];
      localStorage.setItem(POSTS_KEY, JSON.stringify(initialPosts));
    }
  }
})();

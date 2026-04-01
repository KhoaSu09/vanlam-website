// auth.js - Role-Based Authentication System for Vanlam Technologies
const USERS_KEY = 'vl_users_v1';
const SESSION_KEY = 'vl_current_user_v1';

// Mặc định tạo tài khoản admin và user (chỉ dùng cho static site)
const defaultUsers = [
  { username: 'admin', password: 'Abcd@9999', role: 'admin' },
  { username: 'khachhang', password: '123', role: 'user' }
];

const defaultPosts = [
  { 
    id: 'post-1', 
    title: 'Vanlam Technologies ra mắt giải pháp Chuyển đổi số 2025', 
    date: new Date().toISOString(), 
    content: 'Chúng tôi tự hào giới thiệu hệ sinh thái công nghệ mới giúp doanh nghiệp tối ưu hóa quy trình vận hành và nâng cao trải nghiệm khách hàng.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'post-2', 
    title: 'Tầm quan trọng của Bảo mật thông tin trong kỷ nguyên AI', 
    date: new Date(Date.now() - 86400000).toISOString(), 
    content: 'An ninh mạng đang trở thành ưu tiên hàng đầu. Vanlam cung cấp các giải pháp bảo mật đa lớp ứng dụng trí tuệ nhân tạo.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop'
  }
];

const defaultProducts = [
  {
    id: 'prod-1',
    name: 'Smart Gateway V1',
    price: 2500000,
    description: 'Thiết bị kết nối thông minh hỗ trợ đa giao thức Zigbee, Matter và Wi-Fi. Bảo mật chuẩn quân đội.',
    image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=1000&auto=format&fit=crop',
    date: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Phần mềm Quản lý Kho ERP',
    price: 0,
    description: 'Giải pháp quản lý kho chuyên sâu cho doanh nghiệp vừa và nhỏ. Tích hợp AI dự báo tồn kho.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
    date: new Date().toISOString()
  }
];

function initData() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
  const existingPosts = JSON.parse(localStorage.getItem('vl_posts_v1') || '[]');
  if (existingPosts.length === 0) {
    localStorage.setItem('vl_posts_v1', JSON.stringify(defaultPosts));
  }
  const existingProds = JSON.parse(localStorage.getItem('vl_products_v1') || '[]');
  if (existingProds.length === 0) {
    localStorage.setItem('vl_products_v1', JSON.stringify(defaultProducts));
  }
}
initData();

window.vlAuth = {
  getUsers: function () {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch (e) { return []; }
  },
  getCurrentUser: function () {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
  },
  saveUsers: function (users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  register: async function (username, password) {
    const users = this.getUsers();
    if (users.some(u => u.username === username)) {
      return { success: false, message: 'Tên đăng nhập đã tồn tại!' };
    }
    const newUser = { username, password, role: 'user' };

    try {
      const scriptURL = 'https://script.google.com/macros/s/AKfycbwPcFiC1QIBqyaxyRMVSRO8wB2GiDgH01I3EaC8kFvO4mXmfZNbJmEQkPJ4YRP24Fyr9g/exec';
      await fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
    } catch (e) {
      console.warn('Google Sheets sync warning:', e);
    }

    users.push(newUser);
    this.saveUsers(users);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return { success: true };
  },
  login: function (username, password) {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  },
  logout: function () {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html'; // Xóa session xong về trang chủ
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Auth CSS
  const style = document.createElement('style');
  style.textContent = `
      .admin-only { display: none !important; }
      body.is-admin .admin-only { display: inline-block !important; }
      
      .auth-modal { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.6); z-index:10001; align-items:center; justify-content:center; }
      .auth-modal.active { display:flex; }
      .auth-content { background:#fff; border-radius:12px; padding:24px; width:90%; max-width:400px; box-shadow:0 20px 40px rgba(0,0,0,.2); font-family:Inter,sans-serif; }
      .auth-input { width:100%; padding:12px; margin-bottom:12px; border:1px solid #d2d6dc; border-radius:8px; font-size:15px; box-sizing:border-box; }
      .auth-input:focus { border-color:#0f3c7d; outline:none; }
      .auth-btn { width:100%; padding:12px; background:#0f3c7d; color:#fff; border:none; border-radius:8px; font-size:16px; font-weight:600; cursor:pointer; }
      .auth-btn:hover { background:#0d2a5c; }
      .auth-close { background:#e5e7eb; color:#111; margin-top:10px; }
      .auth-close:hover { background:#d1d5db; }
      .auth-error { color:#c92a2a; font-size:14px; margin-bottom:12px; display:none; background:#fee2e2; border:1px solid #fca5a5; padding:10px; border-radius:6px; }
    `;
  document.head.appendChild(style);

  // 2. Tái tạo Giao diện Modal Đăng Nhập
  const oldModal = document.getElementById('authModal');
  if (oldModal) oldModal.remove();

  const authContainer = document.createElement('div');
  authContainer.innerHTML = `
      <div id="authModal" class="auth-modal">
        <div class="auth-content">
          <h3 id="authTitle" style="margin-top:0; margin-bottom:20px; color:#0f3c7d; font-size:22px; text-align:center;">Đăng nhập</h3>
          <div id="authError" class="auth-error">Sai tên đăng nhập hoặc mật khẩu!</div>
          <input type="text" id="authUsername" class="auth-input" placeholder="Tên đăng nhập" />
          <input type="password" id="authPassword" class="auth-input" placeholder="Mật khẩu" />
          <button class="auth-btn" id="authLoginBtn">Đăng nhập ngay</button>
          
          <div style="text-align:center; margin-top:16px; font-size:14px;">
            <span id="authToggleText">Chưa có tài khoản?</span> 
            <a href="#" id="authToggleBtn" style="color:#0f3c7d; font-weight:600; text-decoration:none;">Đăng ký ngay</a>
          </div>
          <button class="auth-btn auth-close" onclick="document.getElementById('authModal').classList.remove('active')">Đóng</button>
        </div>
      </div>
    `;
  document.body.appendChild(authContainer);

  let isRegisterMode = false;
  document.getElementById('authToggleBtn').addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    document.getElementById('authError').style.display = 'none';

    if (isRegisterMode) {
      document.getElementById('authTitle').textContent = 'Đăng ký tài khoản';
      document.getElementById('authLoginBtn').textContent = 'Tạo tài khoản';
      document.getElementById('authToggleText').textContent = 'Đã có tài khoản?';
      document.getElementById('authToggleBtn').textContent = 'Đăng nhập ngay';
    } else {
      document.getElementById('authTitle').textContent = 'Đăng nhập';
      document.getElementById('authLoginBtn').textContent = 'Đăng nhập ngay';
      document.getElementById('authToggleText').textContent = 'Chưa có tài khoản?';
      document.getElementById('authToggleBtn').textContent = 'Đăng ký ngay';
    }
  });

  document.getElementById('authLoginBtn').addEventListener('click', async () => {
    const u = document.getElementById('authUsername').value.trim();
    const p = document.getElementById('authPassword').value.trim();

    const errEl = document.getElementById('authError');
    if (!u || !p) {
      errEl.textContent = 'Vui lòng nhập đầy đủ tên và mật khẩu!';
      errEl.style.display = 'block';
      return;
    }

    if (isRegisterMode) {
      const btn = document.getElementById('authLoginBtn');
      btn.textContent = 'Đang xử lý...';
      btn.disabled = true;
      const res = await window.vlAuth.register(u, p);
      if (res.success) {
        window.location.reload();
      } else {
        errEl.textContent = res.message;
        errEl.style.display = 'block';
        btn.textContent = 'Tạo tài khoản';
        btn.disabled = false;
      }
    } else {
      if (window.vlAuth.login(u, p)) {
        window.location.reload();
      } else {
        errEl.textContent = 'Sai tên đăng nhập hoặc mật khẩu!';
        errEl.style.display = 'block';
      }
    }
  });

  // Cho phép dùng nút Enter
  document.getElementById('authPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('authLoginBtn').click();
  });

  // 3. Phân quyền
  const currentUser = window.vlAuth.getCurrentUser();
  if (currentUser && currentUser.role === 'admin') {
    document.body.classList.add('is-admin');
  }

  // 4. Tìm các thẻ Nav để gắn nút Đăng nhập / Đăng xuất
  function injectAuthLinks() {
    const navs = document.querySelectorAll('nav, .nav, .menu, header div.links');
    if (navs.length === 0) return false;

    navs.forEach(nav => {
      // Tránh gắn trùng nếu đã có
      if (nav.querySelector('.auth-link-injected')) return;

      const authLink = document.createElement('a');
      authLink.className = 'auth-link-injected';
      authLink.style.marginLeft = '20px';
      authLink.style.fontWeight = '600';
      authLink.style.cursor = 'pointer';

      if (currentUser) {
        authLink.textContent = `Đăng xuất (${currentUser.username})`;
        authLink.style.color = '#c92a2a'; 
        authLink.onclick = (e) => { e.preventDefault(); window.vlAuth.logout(); };
      } else {
        authLink.textContent = 'Đăng nhập';
        authLink.style.color = '#0f3c7d'; 
        authLink.onclick = (e) => {
          e.preventDefault();
          document.getElementById('authUsername').value = '';
          document.getElementById('authPassword').value = '';
          document.getElementById('authError').style.display = 'none';
          document.getElementById('authModal').classList.add('active');
        };
      }
      nav.appendChild(authLink);
    });
    return true;
  }

  if (!injectAuthLinks()) {
    // Thử lại sau 500ms nếu chưa tìm thấy nav (đề phòng script chạy quá nhanh)
    setTimeout(injectAuthLinks, 500);
  }

  // 5. Nếu đang ở các file quản lý nhưng không phải admin -> đá về index.html
  // 5. Nếu đang ở các file quản lý nhưng không phải admin -> đá về index.html
  const isManagePage = window.location.pathname.includes('posts.html') || window.location.pathname.includes('products.html') || window.location.pathname.includes('manage-documents.html');
  if (isManagePage && (!currentUser || currentUser.role !== 'admin')) {
    alert("Khu vực này dành cho Quản trị viên (Admin). \n\nNếu bạn là khách hàng, vui lòng xem Sản phẩm tại trang 'Cửa hàng' hoặc 'Tin tức'.");
    window.location.href = 'index.html';
  }

  // 6. Inject Chat Widget
  const chatStyle = document.createElement('style');
  chatStyle.textContent = `
    .vl-chat-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
      font-family: 'Inter', sans-serif;
    }
    .vl-chat-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .vl-chat-widget.active .vl-chat-options {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .vl-chat-btn {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      border: none;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    .vl-chat-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .vl-chat-btn .tooltip {
      position: absolute;
      right: 60px;
      background: #333;
      color: #fff;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s;
      pointer-events: none;
    }
    .vl-chat-btn:hover .tooltip {
      opacity: 1;
      visibility: visible;
    }
    .vl-chat-main {
      width: 60px;
      height: 60px;
      background: #0f3c7d;
      font-size: 28px;
    }
    .vl-chat-zalo { background: #0068FF; font-size: 24px; font-weight: bold; font-family: Arial, sans-serif; text-decoration: none; }
    .vl-chat-fb { background: #0084FF; font-size: 24px; font-weight: bold; font-family: 'Times New Roman', serif; font-style: italic; padding-top: 5px; }
    .vl-chat-web { background: #0aa3a3; font-size: 20px; }
    
    @keyframes vlPulse {
      0% { box-shadow: 0 0 0 0 rgba(15, 60, 125, 0.5); }
      70% { box-shadow: 0 0 0 15px rgba(15, 60, 125, 0); }
      100% { box-shadow: 0 0 0 0 rgba(15, 60, 125, 0); }
    }
    .vl-chat-main { animation: vlPulse 2s infinite; }
    .vl-chat-widget.active .vl-chat-main { animation: none; transform: rotate(45deg); font-size: 32px; font-weight: 300; }
  `;
  document.head.appendChild(chatStyle);

  const chatContainer = document.createElement('div');
  chatContainer.className = 'vl-chat-widget';

  chatContainer.innerHTML = `
    <div class="vl-chat-options">
      <a href="https://zalo.me/0912818815" target="_blank" class="vl-chat-btn vl-chat-zalo" title="Chat Zalo">
        Z
        <span class="tooltip">Chat Zalo</span>
      </a>
      <a href="https://www.facebook.com/khoaSNA" target="_blank" class="vl-chat-btn vl-chat-fb" title="Chat Facebook">
        f
        <span class="tooltip">Chat Facebook</span>
      </a>
      <button class="vl-chat-btn vl-chat-web" onclick="alert('Để tích hợp tính năng live-chat trực tiếp, trang web của bạn cần kết nối với nền tảng bên thứ ba (như Tawk.to, Subiz, hoặc Facebook Customer Chat).\\n\\nHình thức hoạt động:\\n1. Bạn tạo tài khoản trên các nền tảng chat đó.\\n2. Lấy đoạn mã JavaScript (embed code) cung cấp.\\n3. Dán đoạn mã đó vào bên trong thẻ <body> của website.')">
        💬
        <span class="tooltip">Chat Trực Tiếp</span>
      </button>
    </div>
    <button class="vl-chat-btn vl-chat-main" id="vlChatMainBtn">
      💬
    </button>
  `;

  document.body.appendChild(chatContainer);

  const mainChatBtn = document.getElementById('vlChatMainBtn');
  mainChatBtn.addEventListener('click', () => {
    chatContainer.classList.toggle('active');
    if (chatContainer.classList.contains('active')) {
      mainChatBtn.innerHTML = '+';
    } else {
      mainChatBtn.innerHTML = '💬';
    }
  });
});

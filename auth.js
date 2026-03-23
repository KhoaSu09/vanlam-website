// auth.js - Role-Based Authentication System for Vanlam Technologies
const USERS_KEY = 'vl_users_v1';
const SESSION_KEY = 'vl_current_user_v1';

// Mặc định tạo tài khoản admin và user (chỉ dùng cho static site)
const defaultUsers = [
  { username: 'admin', password: '123', role: 'admin' },
  { username: 'khachhang', password: '123', role: 'user' }
];

function initUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
}
initUsers();

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
      const scriptURL = 'https://script.google.com/macros/s/AKfycbwq8U3QpS7FY6MDMi5lqUxtAUWUIgkqGhmCptjJctB5-NwoP-Hq9XqfHpRjEQTAIDbxeA/exec';
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
          <h3 id="authTitle" style="margin-top:0; color:#0f3c7d; font-size:22px; text-align:center;">Đăng nhập</h3>
          <p id="authSubtitle" style="text-align:center; font-size:13px; color:#6b7280; margin-bottom:20px;">(Admin: admin/123 | Mặc định: khachhang/123)</p>
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
      document.getElementById('authSubtitle').style.display = 'none';
      document.getElementById('authLoginBtn').textContent = 'Tạo tài khoản';
      document.getElementById('authToggleText').textContent = 'Đã có tài khoản?';
      document.getElementById('authToggleBtn').textContent = 'Đăng nhập ngay';
    } else {
      document.getElementById('authTitle').textContent = 'Đăng nhập';
      document.getElementById('authSubtitle').style.display = 'block';
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

  // 4. Tìm các thẻ Nav để gắn nút Đăng nhập / Đăng xuất, tránh gắn vào footer nav (nếu có)
  const navs = document.querySelectorAll('nav.menu, header nav');
  navs.forEach(nav => {
    const authLink = document.createElement('a');
    authLink.style.marginLeft = '20px';
    authLink.style.fontWeight = '600';
    authLink.style.cursor = 'pointer';

    if (currentUser) {
      authLink.textContent = `Đăng xuất (${currentUser.username})`;
      authLink.style.color = '#c92a2a'; // Đỏ nhạt để báo hiệu đăng xuất
      authLink.onclick = (e) => { e.preventDefault(); window.vlAuth.logout(); };
    } else {
      authLink.textContent = 'Đăng nhập';
      authLink.style.color = '#0f3c7d'; // Xanh primary
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

  // 5. Nếu đang ở các file quản lý nhưng không phải admin -> đá về index.html
  const isManagePage = window.location.pathname.includes('posts.html') || window.location.pathname.includes('products.html');
  if (isManagePage && (!currentUser || currentUser.role !== 'admin')) {
    // Thay vì redirect ngay, chỉ che UI gốc đi bằng css
    // Tuy nhiên cách dễ nhất là:
    alert("Bạn cần quyền Quản trị viên để truy cập trang này!");
    window.location.href = 'index.html';
  }
});

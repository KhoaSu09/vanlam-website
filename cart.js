// Shared Cart Logic for Vanlam Technologies
document.addEventListener('DOMContentLoaded', () => {
  // Inject Cart CSS
  const style = document.createElement('style');
  style.textContent = `
    .cart-icon { position:fixed; top:20px; right:20px; background:#0f3c7d; color:#fff; border-radius:50%; width:50px; height:50px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:20px; z-index:9999; box-shadow:0 4px 10px rgba(0,0,0,0.15); transition:transform 0.2s; }
    .cart-icon:hover { transform:scale(1.05); }
    .cart-count { position:absolute; top:-5px; right:-5px; background:#c92a2a; color:#fff; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; }
    .cart-modal { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.5); z-index:10000; align-items:center; justify-content:center; }
    .cart-modal.active { display:flex; }
    .cart-content { background:#fff; border-radius:12px; padding:20px; width:90%; max-width:500px; max-height:85vh; overflow-y:auto; position:relative; }
    .cart-item { display:flex; align-items:center; gap:12px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #e5e7eb; }
    .cart-item img { width:60px; height:60px; object-fit:cover; border-radius:6px; }
    .cart-item-details { flex:1; }
    .cart-item-title { font-weight:600; margin:0; font-family:Inter,sans-serif; }
    .cart-item-price { color:#0f3c7d; font-weight:600; font-family:Inter,sans-serif; }
    .remove-item { background:#c92a2a; color:#fff; border:none; border-radius:4px; padding:6px 10px; cursor:pointer; font-size:13px; }
    .remove-item:hover { filter:brightness(1.1); }
    .cart-total { font-size:18px; font-weight:700; text-align:right; margin:20px 0; color:#111; font-family:Inter,sans-serif; }
    .checkout-btn { width:100%; padding:14px; background:#0f3c7d; color:#fff; border:none; border-radius:8px; font-size:16px; font-weight:600; cursor:pointer; font-family:Inter,sans-serif; }
    .checkout-btn:hover { background:#0d2a5c; }
    .order-message { font-size:14px; margin-bottom:12px; color:#065f46; background:#ecfdf5; border:1px solid #a7f3d0; padding:12px; border-radius:8px; font-family:Inter,sans-serif; }
    .order-history { margin-top:20px; border-top:1px solid #e5e7eb; padding-top:16px; font-family:Inter,sans-serif; }
    .order-history h4 { margin:0 0 10px; font-size:16px; color:#111; }
    .order-history-item { font-size:14px; color:#374151; margin-bottom:8px; }
    .close-modal-btn { width:100%; padding:12px; background:#e5e7eb; color:#111; border:none; border-radius:8px; font-size:16px; font-weight:600; cursor:pointer; font-family:Inter,sans-serif; margin-top:8px; }
    .close-modal-btn:hover { background:#d1d5db; }
    .cart-form-control { width:100%; padding:10px 14px; border:1px solid #d2d6dc; border-radius:8px; font-size:15px; font-family:Inter,sans-serif; box-sizing:border-box; }
    .cart-form-control:focus { outline:none; border-color:#0f3c7d; }
  `;
  document.head.appendChild(style);

  // Remove old cart nodes if they exist (e.g. from shop.html)
  document.querySelectorAll('.cart-icon').forEach(el => el.remove());
  const oldModal = document.getElementById('cartModal');
  if (oldModal) oldModal.remove();

  // Inject HTML
  const cartContainer = document.createElement('div');
  cartContainer.innerHTML = `
    <!-- Cart Icon -->
    <div class="cart-icon" onclick="openCart()">
      🛒<div class="cart-count" id="cartCount">0</div>
    </div>
    <!-- Cart Modal -->
    <div id="cartModal" class="cart-modal">
      <div class="cart-content" style="font-family:Inter,sans-serif; color:#111;">
        <h3 style="margin-top:0; color:#0f3c7d; font-size:22px;">Giỏ hàng</h3>
        <div id="cartItems"></div>
        <div id="cartTotal" class="cart-total">Tổng: 0 VNĐ</div>

        <div id="checkoutSection" style="margin-top:20px;">
          <button class="checkout-btn" onclick="showCheckoutForm()">Thanh toán</button>
        </div>

        <div id="orderMessage" class="order-message" style="display:none;"></div>
        <div id="checkoutForm" style="display:none; margin-top:20px; border-top:1px solid #e5e7eb; padding-top:20px;">
          <h4 style="margin-top:0; font-size:18px;">Thông tin thanh toán</h4>
          <div style="margin-bottom:12px;"><input id="customerName" type="text" placeholder="Họ và tên" class="cart-form-control" /></div>
          <div style="margin-bottom:12px;"><input id="customerPhone" type="tel" placeholder="Số điện thoại" class="cart-form-control" /></div>
          <div style="margin-bottom:12px;"><input id="customerEmail" type="email" placeholder="Email" class="cart-form-control" /></div>
          <div style="margin-bottom:16px;"><textarea id="customerAddress" placeholder="Địa chỉ giao hàng đầy đủ" class="cart-form-control" style="height:80px;"></textarea></div>
          <button class="checkout-btn" onclick="processCheckout()">Xác nhận đặt hàng</button>
          <button class="close-modal-btn" onclick="hideCheckoutForm()">Hủy</button>
        </div>
        <div id="orderHistory" class="order-history"></div>

        <button class="close-modal-btn" style="margin-top:16px;" onclick="closeCart()">Đóng giỏ hàng</button>
      </div>
    </div>
  `;
  document.body.appendChild(cartContainer);

  updateCartCount();
  renderOrderHistory();
});

const CART_KEY = 'vl_cart';
const ORDERS_KEY = 'vl_orders_v1';

function formatPriceGlobal(price) {
  if (!price || price === 0) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}
function escapeHtmlGlobal(s) {
  return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch(e) { return []; }
}
function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
    return true;
  } catch(e) {
    if (e.name === 'QuotaExceededError') {
      alert('Bộ nhớ đã đầy do có quá nhiều ảnh (QuotaExceededError). Không thể thêm vào giỏ. Vui lòng vào Cửa hàng -> Cài đặt để xóa bớt dữ liệu web!');
    }
    return false;
  }
}

function addToCart(id, name, price, image, quantity = 1) {
  if (!id || !name || isNaN(price) || price < 0 || quantity < 1) {
    alert('Sản phẩm không hợp lệ, vui lòng thử lại.');
    return;
  }
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    // Không lưu chuỗi Base64 (ảnh tải lên dài > 1000 ký tự) vào giỏ để tiết kiệm bộ nhớ 5MB
    const safeImage = (image && image.length > 1000) ? '' : image;
    cart.push({ id, name, price, image: safeImage, quantity });
  }
  
  if (saveCart(cart)) {
    alert('Đã thêm vào giỏ hàng!');
  }
}

function removeFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  renderCart();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const counterEl = document.getElementById('cartCount');
  if (counterEl) counterEl.textContent = count;
}

function renderCart() {
  const cart = getCart();
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  if (!cartItems) return;

  if (!cart.length) {
    cartItems.innerHTML = '<p style="color:#6b7280;">Giỏ hàng trống</p>';
    cartTotal.textContent = 'Tổng: 0 VNĐ';
    return;
  }

  let products = [];
  try { products = JSON.parse(localStorage.getItem('vl_products_v1') || '[]'); } catch(e) {}

  cartItems.innerHTML = cart.map(item => {
    let img = item.image;
    // Nếu biến image trong giỏ bị rỗng do là chuỗi quá dài, cố gắng lấy lại từ database sản phẩm
    if (!img) {
      const p = products.find(p => p.id === item.id);
      if (p) img = p.image;
    }
    return `
    <div class="cart-item">
      ${img ? `<img src="${img}" alt="${escapeHtmlGlobal(item.name)}" />` : '<div style="width:60px; height:60px; background:#e5e7eb; border-radius:6px;"></div>'}
      <div class="cart-item-details">
        <h4 class="cart-item-title">${escapeHtmlGlobal(item.name)}</h4>
        <div class="cart-item-price">${formatPriceGlobal(item.price)} x ${item.quantity}</div>
        <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
          <button style="width:28px; height:28px; border-radius:50%; border:1px solid #d2d6dc; background:#fff; cursor:pointer;" onclick="changeCartQuantity('${item.id}', -1)">-</button>
          <span style="font-weight:600;min-width:16px;text-align:center;">${item.quantity}</span>
          <button style="width:28px; height:28px; border-radius:50%; border:1px solid #d2d6dc; background:#fff; cursor:pointer;" onclick="changeCartQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="remove-item" onclick="removeFromCart('${item.id}')">Xóa</button>
    </div>
  `;
  }).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `Tổng: ${formatPriceGlobal(total)}`;
}

function changeCartQuantity(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
  renderCart();
}

function openCart() {
  renderCart();
  document.getElementById('cartModal').classList.add('active');
}
function closeCart() {
  document.getElementById('cartModal').classList.remove('active');
}
function showCheckoutForm() {
  document.getElementById('checkoutSection').style.display = 'none';
  document.getElementById('checkoutForm').style.display = 'block';
}
function hideCheckoutForm() {
  document.getElementById('checkoutForm').style.display = 'none';
  document.getElementById('checkoutSection').style.display = 'block';
}

async function processCheckout() {
  const confirmBtns = document.querySelectorAll('#checkoutForm .checkout-btn');
  const confirmBtn = confirmBtns.length > 0 ? confirmBtns[0] : null;

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const address = document.getElementById('customerAddress').value.trim();
  const cart = getCart();

  if (!cart.length) {
    alert('Giỏ hàng trống!');
    return;
  }
  if (!name || !phone || !email || !address) {
    alert('Vui lòng điền đầy đủ thông tin thanh toán.');
    return;
  }

  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Đang xử lý...';
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = { id: 'ORD_' + Date.now(), date: new Date().toISOString(), customer: { name, phone, email, address }, items: cart, total };
  
  const currentUser = window.vlAuth ? window.vlAuth.getCurrentUser() : null;
  const orderPayload = {
    type: 'order',
    id: order.id,
    username: currentUser ? currentUser.username : 'Khách vãng lai',
    customer: order.customer,
    items: order.items,
    total: order.total
  };
  
  try {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyorLitn0FEonjc4VDkBtyNENWzGK5_chxLCYiqKv299PlTIqnAFYc9ENru9kGvvmh75g/exec';
    await fetch(scriptURL, { 
      method: 'POST', 
      body: JSON.stringify(orderPayload),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
  } catch(e) {
    console.warn('Lỗi đồng bộ Google Sheets:', e);
  }
  
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Xác nhận đặt hàng';
  }

  const orders = loadOrders();
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  
  localStorage.removeItem(CART_KEY);
  updateCartCount();
  renderCart();
  hideCheckoutForm();
  renderOrderHistory();

  const orderText = `🛒 ĐƠN HÀNG MỚI\n- Mã đơn: ${order.id}\n- Khách hàng: ${order.customer.name}\n- SĐT: ${order.customer.phone}\n- Email: ${order.customer.email}\n- ĐC: ${order.customer.address}\n\nSản phẩm:\n${order.items.map(i => `+ ${i.name} (x${i.quantity}) - ${formatPriceGlobal(i.price)}`).join('\n')}\n\n================\n💰 Tổng cộng: ${formatPriceGlobal(order.total)}`;
  const fbLink = 'https://m.me/khoaSNA';
  const zaloLink = 'https://zalo.me/0912818815';
  
  const msgContainer = document.getElementById('orderMessage');
  msgContainer.dataset.orderText = orderText;

  msgContainer.innerHTML = `
    <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #065f46;">✅ Đặt hàng thành công! (Mã: ${order.id})</div>
    <p style="margin: 0 0 12px 0; font-size:14px; color:#374151;">Gửi thông tin đơn hàng này cho shop qua Zalo hoặc Facebook để được xác nhận nhanh nhất:</p>
    <div style="display:flex; gap:12px; margin-top:8px;">
      <button onclick="copyToSocial(event, '${zaloLink}')" style="flex:1; background:#0068FF; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer; font-weight:600; font-size:14px;">Gửi qua Zalo</button>
      <button onclick="copyToSocial(event, '${fbLink}')" style="flex:1; background:#0084FF; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer; font-weight:600; font-size:14px;">Gửi qua Facebook</button>
    </div>
  `;
  msgContainer.style.display = 'block';
}

window.copyToSocial = function(e, url) {
  e.preventDefault();
  const text = document.getElementById('orderMessage').dataset.orderText || '';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Đã copy sẵn nội dung đơn hàng vào bộ nhớ tạm!\n\nWebsite sẽ mở ứng dụng chat. Bạn chỉ cần ấn "Dán" (Paste) để gửi cho shop nhé!');
      window.open(url, '_blank');
    }).catch(err => {
      alert('Đang mở ứng dụng chat. Bạn có thể cần copy lại thông tin bằng tay nếu clipboard gặp lỗi.');
      window.open(url, '_blank');
    });
  } else {
    window.open(url, '_blank');
  }
};

function loadOrders() {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch (e) { return []; }
}
function renderOrderHistory() {
  const el = document.getElementById('orderHistory');
  if (!el) return;
  const orders = loadOrders().slice(-5).reverse();
  if (!orders.length) {
    el.innerHTML = '<h4>Lịch sử mua hàng</h4><p style="color:#6b7280; font-size:14px;">Chưa có đơn hàng.</p>';
    return;
  }
  el.innerHTML = `<h4>Lịch sử mua hàng</h4>${orders.map(o => `
    <div class="order-history-item">Đơn <strong>${o.id}</strong> - ${new Date(o.date).toLocaleDateString('vi-VN')} - ${formatPriceGlobal(o.total)} (${o.items.length} sp)</div>
  `).join('')}`;
}

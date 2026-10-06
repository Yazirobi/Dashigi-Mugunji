const heroSlides = document.querySelectorAll(".hero-slide");
let currentHeroSlide = 0;

if (heroSlides.length > 1) {
  setInterval(() => {
    heroSlides[currentHeroSlide].classList.remove("active");

    currentHeroSlide =
      (currentHeroSlide + 1) % heroSlides.length;

    heroSlides[currentHeroSlide].classList.add("active");
  }, 4000);
}
const PRODUCTS = [
  { id: 1, name: "배추김치 (1년 묵은지)", price: 14000, note: "깊고 시원한 우리 집 기본 김치", image: "images/thumb/thumb_baechu.jpg" },
  { id: 2, name: "열무김치", price: 13000, note: "4계절 내내 즐기는 아삭한 산뜻함", image: "images/thumb/thumb_yeolmu.jpg" },
  { id: 3, name: "알타리김치", price: 11000, note: "오독오독 씹는 맛 일품, 총각김치", image: "images/thumb/thumb_chonggak.jpg" },
  { id: 4, name: "파김치", price: 22000, note: "따라올 수 없는 향긋한 감칠맛", image: "images/thumb/thumb_pa.jpg" },
  { id: 5, name: "봄동 겉절이", price: 6000, note: "아삭하고 상큼한 시즈널 밥도둑", image: "images/thumb/thumb_gutjeori.jpg" },
  { id: 6, name: "동치미", price: 5000, note: "올 겨울, 놓칠 수 없는 달큰한 국물", image: "images/thumb/thumb_dongchimi.jpg" },
  { id: 7, name: "썰은 배추김치", price: 3900, note: "도마 없는 간편함, 전라도 명품 김치", image: "images/thumb/thumb_chopBaechu.jpg" },
  { id: 8, name: "깍두기", price: 3500, note: "한입에 쏘옥, 100% 국산 깍두기", image: "images/thumb/thumb_kkakdugi.jpg" }
];
const CART_KEY = "dashigiMugunjiCart";
const WISH_KEY = "dashigiMugunjiWish";

function won(value) {
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = count);
}
function getProduct(id) { return PRODUCTS.find(p => p.id === Number(id)); }
function imageMarkup(product, className = "") {
  return `<div class="${className}"><img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.classList.add('image-missing'); this.parentElement.insertAdjacentHTML('beforeend','<span>상품 이미지</span>')"></div>`;
}
function productCard(product) {
  return `<article class="product-card">
    <a href="product-${product.id}.html" aria-label="${product.name} 상세 보기">
      ${imageMarkup(product, "product-image")}
      <h3>${product.name}</h3>
      <div class="price">${won(product.price)}</div>
      <div class="product-meta">${product.note}</div>
    </a>
  </article>`;
}
function renderProductCards(targetId = "productGrid") {
  const target = document.getElementById(targetId);
  if (target) target.innerHTML = PRODUCTS.map(productCard).join("");
}
function getQuantity() {
  const input = document.querySelector("[data-quantity]");
  return Math.max(1, Math.min(99, Number(input?.value || 1)));
}
function changeQuantity(delta) {
  const input = document.querySelector("[data-quantity]");
  if (!input) return;
  input.value = Math.max(1, Math.min(99, Number(input.value || 1) + delta));
  updateDetailSubtotal();
}
function updateDetailSubtotal() {
  const productId = document.body.dataset.productId;
  const product = getProduct(productId);
  const subtotal = document.querySelector("[data-subtotal]");
  if (product && subtotal) subtotal.textContent = won(product.price * getQuantity());
}
function addToCart(productId, qty = 1) {
  const product = getProduct(productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.qty = Math.min(99, existing.qty + qty);
  else cart.push({ id: product.id, qty });
  saveCart(cart);
  showToast(`${product.name} ${qty}개를 장바구니에 담았습니다.`);
}
function buyNow(productId) {
  addToCart(productId, getQuantity());
  window.location.href = "cart.html";
}
function toggleWish(productId) {
  const wishes = JSON.parse(localStorage.getItem(WISH_KEY) || "[]");
  const id = Number(productId);
  const next = wishes.includes(id) ? wishes.filter(x => x !== id) : [...wishes, id];
  localStorage.setItem(WISH_KEY, JSON.stringify(next));
  showToast(next.includes(id) ? "찜 목록에 담았습니다." : "찜 목록에서 삭제했습니다.");
}
function renderCart() {
  const target = document.getElementById("cartContents");
  if (!target) return;
  const cart = getCart();
  if (!cart.length) {
    target.innerHTML = `<div class="empty-state"><p>장바구니가 비어 있습니다.</p><a class="btn" href="index.html#products">상품 보러 가기</a></div>`;
    const summary = document.getElementById("cartSummary");
    if (summary) summary.hidden = true;
    return;
  }
  target.innerHTML = `<table class="cart-table"><thead><tr><th>상품정보</th><th>수량</th><th>상품금액</th><th></th></tr></thead><tbody>
    ${cart.map(item => {
      const p = getProduct(item.id);
      if (!p) return "";
      return `<tr>
        <td><div class="cart-product"><div class="cart-thumb"><img src="${p.image}" alt="" onerror="this.style.display='none'"></div><div><a href="product-${p.id}.html">${p.name}</a><div class="product-meta">${won(p.price)}</div></div></div></td>
        <td><div class="quantity-control"><button type="button" aria-label="수량 줄이기" onclick="updateCartQty(${p.id},-1)">−</button><input value="${item.qty}" readonly aria-label="수량"><button type="button" aria-label="수량 늘리기" onclick="updateCartQty(${p.id},1)">＋</button></div></td>
        <td>${won(p.price * item.qty)}</td>
        <td><button class="text-link" type="button" onclick="removeCartItem(${p.id})">삭제</button></td>
      </tr>`;
    }).join("")}
  </tbody></table>`;
  const subtotal = cart.reduce((sum, item) => sum + (getProduct(item.id)?.price || 0) * item.qty, 0);
  document.getElementById("cartSubtotal").textContent = won(subtotal);
  document.getElementById("cartTotal").textContent = won(subtotal);
  const summary = document.getElementById("cartSummary");
  if (summary) summary.hidden = false;
}
function updateCartQty(id, delta) {
  const cart = getCart();
  const item = cart.find(x => x.id === Number(id));
  if (!item) return;
  item.qty = Math.max(1, Math.min(99, item.qty + delta));
  saveCart(cart); renderCart();
}
function removeCartItem(id) {
  saveCart(getCart().filter(item => item.id !== Number(id)));
  renderCart();
}
function checkoutDemo() {
  if (!getCart().length) { showToast("장바구니가 비어 있습니다."); return; }
  alert("시연용 결제 화면입니다. 실제 결제는 연결되어 있지 않습니다.");
}
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}
function toggleMenu() {
  document.querySelector(".nav")?.classList.toggle("open");
}
document.addEventListener("DOMContentLoaded", () => {
  renderProductCards();
  updateCartCount();
  renderCart();
  updateDetailSubtotal();
  document.querySelectorAll("[data-quantity]").forEach(input => {
    input.addEventListener("change", () => {
      input.value = Math.max(1, Math.min(99, Number(input.value || 1)));
      updateDetailSubtotal();
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const renderSpecial = (id, products) => {
    const target = document.getElementById(id);
    if (target) target.innerHTML = products.map(productCard).join("");
  };
    renderSpecial("familyProducts", [PRODUCTS[0], PRODUCTS[2], PRODUCTS[1]]);
    renderSpecial("recommendProducts", [PRODUCTS[6], PRODUCTS[7]]);
    renderSpecial("seasonProducts", [PRODUCTS[4], PRODUCTS[5]]);
  const popular = document.getElementById("popularGrid");
  if (popular) popular.innerHTML = [PRODUCTS[0], PRODUCTS[3]].map(productCard).join("");
});


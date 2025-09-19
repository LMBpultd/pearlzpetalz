// ==================== CART STATE ====================
let cartMap = JSON.parse(localStorage.getItem("cartMap")) || {};
updateCartCount();

// ==================== HELPERS ====================
function toRoman(num) {
  const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
  let roman = "", i;
  for (i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (!cartCount) return; // in case page hasn't rendered yet
  const totalQty = Object.values(cartMap).reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalQty;
  cartCount.style.display = totalQty > 0 ? "inline-block" : "none";
  localStorage.setItem("cartMap", JSON.stringify(cartMap));
}

// ==================== RENDER PRODUCTS ====================
function renderProducts(products, container, imageFolder) {
  container.innerHTML = "";
  products.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${imageFolder}${item.image}" alt="${item.name}">
      <div class="product-name">${item.name}</div>
      <div class="product-price">₹${item.price}</div>
      <button class="add-btn" data-index="${index}" data-img="${item.image}">Add to Cart</button>`;
    container.appendChild(card);
  });
}

// ==================== CART HANDLERS ====================
function setupCart(products, container, imageFolder) {
  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-btn")) {
      const idx = parseInt(e.target.getAttribute("data-index"));
      const item = products[idx];
      const img = item.image;
      if (!cartMap[img]) {
        cartMap[img] = {name: item.name, price: item.price, image: `${imageFolder}${img}`, qty: 1};
      } else {
        cartMap[img].qty += 1;
      }
      updateCartCount();
      showToast("Product added successfully ✅"); // ✅ toast message here
    }
  });
  document.getElementById("cartIcon").addEventListener("click", showCart);
}

function showCart() {
  let cartModal = document.getElementById("cartModal");
  if (!cartModal) {
    cartModal = document.createElement("div");
    cartModal.id = "cartModal";
    document.body.appendChild(cartModal);
  }
  const items = Object.values(cartMap);
  let content = '<h3>Your Cart</h3><ul id="cartItems">';
  if (items.length === 0) {
    content += "<li>No items in cart.</li>";
  } else {
    items.forEach((item) => {
      content += `
        <li>
          <img src="${item.image}" alt="${item.name}">
          ${item.name} - ₹${item.price} <strong>x${item.qty}</strong>
          <button class="remove-btn" data-img="${item.image}">Delete</button>
        </li>`;
    });
  }
  content += `</ul>
    <button class="order-btn">Order via WhatsApp</button>
    <button class="close-btn">Close</button>`;
  cartModal.innerHTML = content;

  // Delete items
  cartModal.querySelector("#cartItems").addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const imageUrl = e.target.getAttribute("data-img");
      let key = null;
      for (const k in cartMap) {
        if (cartMap[k].image === imageUrl) { key = k; break; }
      }
      if (key) {
        cartMap[key].qty -= 1;
        if (cartMap[key].qty <= 0) delete cartMap[key];
        updateCartCount();
        showCart();
      }
    }
  });

  // Close modal
  cartModal.querySelector(".close-btn").addEventListener("click", () => cartModal.remove());

  // WhatsApp order
  cartModal.querySelector(".order-btn").addEventListener("click", () => {
    const baseURL = "https://wa.me/9539889496?text=";
    let message = "I am interested in your these products:\n";
    items.forEach((item, idx) => {
      const imgName = item.image.split("/").pop();
      const imageURL = `https://www.pearlzpetalz.co.in/pearlz_petalz/images/Collections/${imgName}`;
      const romanNum = toRoman(idx + 1);
      message += `\n${romanNum}. ${item.name} (x${item.qty})\n   ${imageURL}\n`;
    });
    const encodedURL = baseURL + encodeURIComponent(message);
    window.open(encodedURL, "_blank");

    // clear cart after order
    cartMap = {};
    localStorage.removeItem("cartMap");
    updateCartCount();
    cartModal.remove();
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 2000); // hide after 2 sec
}

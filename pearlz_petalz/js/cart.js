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
  if (!cartCount) return;
  const totalQty = Object.values(cartMap).reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalQty;
  cartCount.style.display = totalQty > 0 ? "inline-block" : "none";
  localStorage.setItem("cartMap", JSON.stringify(cartMap));
}

// ==================== CART HANDLERS ====================
function setupCart(products, container, imageFolder) {
  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-btn")) {
      const idx = parseInt(e.target.getAttribute("data-index"));
      const item = products[idx];
      const fileKey = item.file; 
      
      if (!cartMap[fileKey]) {
        cartMap[fileKey] = {
          name: item.name, 
          price: parseFloat(item.price), 
          file: fileKey,
          qty: 1
        };
      } else {
        cartMap[fileKey].qty += 1;
      }
      
      updateCartCount();
      showToast("Product added to cart ✅");

      // ലൈവ് അപ്‌ഡേറ്റ്: കാർട്ട് ഓപ്പൺ ആണെങ്കിൽ ലിസ്റ്റ് ഉടൻ പുതുക്കുന്നു
      if (document.getElementById("cartModal")) {
        showCart();
      }
    }
  });
  document.getElementById("cartIcon").addEventListener("click", showCart);
}

// തംബ്‌നെയിൽ ഫോർമാറ്റുകൾ (jpg, jpeg, mp4) പരിശോധിക്കുന്നു
function checkCartMedia(imgElement, jpeg, png, video, containerId) {
  if (imgElement.src.endsWith('.jpg')) {
    imgElement.src = jpeg; 
  } else if (imgElement.src.endsWith('.jpeg')) {
    imgElement.src = png; 
  } else {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <video style="width:100%; height:100%; object-fit:cover;">
          <source src="${video}" type="video/mp4">
        </video>`;
    }
  }
}

function showCart() {
  let cartModal = document.getElementById("cartModal");
  if (!cartModal) {
    cartModal = document.createElement("div");
    cartModal.id = "cartModal";
    document.body.appendChild(cartModal);
  }

  const items = Object.values(cartMap);
  const imageFolder = "images/Collections/";
  let content = '<h3>Your Cart</h3><ul id="cartItems" style="padding:0; margin:0;">';

  if (items.length === 0) {
    content += "<li style='list-style:none; text-align:center; padding:20px;'>Your cart is empty.</li>";
  } else {
    items.forEach((item, idx) => {
      const mediaId = `cart-media-${idx}`;
      const jpgPath = `${imageFolder}${item.file}.jpg`;
      const jpegPath = `${imageFolder}${item.file}.jpeg`;
      const pngPath = `${imageFolder}${item.file}.png`;
      const videoPath = `${imageFolder}${item.file}.mp4`;
      const itemTotal = item.price * item.qty;

      content += `
        <li style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px; list-style:none;">
          <div id="${mediaId}" style="width:55px; height:55px; flex-shrink:0; cursor:pointer; background:#f9f9f9; border-radius:4px; overflow:hidden;" onclick="checkAndOpenFullScreen('${item.file}')">
            <img src="${jpgPath}" style="width:100%; height:100%; object-fit:cover;" 
                 onerror="checkCartMedia(this, '${jpegPath}', '${pngPath}', '${videoPath}', '${mediaId}')">
          </div>

          <div style="flex-grow:1; margin-left:12px;">
            <div style="font-weight:bold; font-size:14px;">${item.name}</div>
            <div style="font-size:13px; color:#555;">₹${item.price} × ${item.qty} = <b>₹${itemTotal}</b></div>
          </div>

          <div style="display:flex; align-items:center; gap:5px;">
            <button onclick="changeQty('${item.file}', -1)" style="width:28px; height:28px; cursor:pointer; background:#eee; border:1px solid #ccc; border-radius:4px;">-</button>
            <span style="font-weight:bold; min-width:20px; text-align:center;">${item.qty}</span>
            <button onclick="changeQty('${item.file}', 1)" style="width:28px; height:28px; cursor:pointer; background:#eee; border:1px solid #ccc; border-radius:4px;">+</button>
            <button class="remove-btn" data-file="${item.file}" style="background:none; border:none; color:red; cursor:pointer; font-size:20px; margin-left:5px;">&times;</button>
          </div>
        </li>`;
    });
  }

  content += `</ul>
    <div style="margin-top:15px;">
        <button class="order-btn">Order via WhatsApp</button>
        <button class="close-btn">Close</button>
    </div>`;
  cartModal.innerHTML = content;

  cartModal.querySelectorAll(".remove-btn").forEach(btn => {
    btn.onclick = () => {
      const fileKey = btn.getAttribute("data-file");
      delete cartMap[fileKey];
      updateCartCount();
      showCart();
    };
  });

  cartModal.querySelector(".close-btn").onclick = () => cartModal.remove();

  cartModal.querySelector(".order-btn").onclick = () => {
    if (items.length === 0) return;
    const baseURL = "https://wa.me/9539889496?text=";
    let message = "I am interested in these products:\n";
    items.forEach((item, idx) => {
      const romanNum = toRoman(idx + 1);
      const imageURL = `https://www.pearlzpetalz.co.in/pearlz_petalz/images/Collections/${item.file}.jpg`;
      message += `\n${romanNum}. ${item.name} (Qty: ${item.qty})\nPrice: ₹${item.price * item.qty}\nLink: ${imageURL}\n`;
    });
    window.open(baseURL + encodeURIComponent(message), "_blank");
    cartMap = {};
    localStorage.removeItem("cartMap");
    updateCartCount();
    cartModal.remove();
  };
}

function changeQty(fileKey, delta) {
  if (cartMap[fileKey]) {
    cartMap[fileKey].qty += delta;
    if (cartMap[fileKey].qty <= 0) {
      delete cartMap[fileKey];
    }
    updateCartCount();
    showCart();
  }
}

function checkAndOpenFullScreen(file) {
  const folder = "images/Collections/";
  const imgPath = `${folder}${file}.jpg`;
  const videoPath = `${folder}${file}.mp4`;
  const img = new Image();
  img.onload = () => openFullScreen(imgPath, false);
  img.onerror = () => openFullScreen(videoPath, true);
  img.src = imgPath;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 2000);
}
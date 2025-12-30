// ==================== CART STATE ====================
let cartMap = JSON.parse(localStorage.getItem("cartMap")) || {};
updateCartCount();

// ==================== HELPERS ====================
// ഓർഡർ മെസ്സേജിൽ നമ്പറുകൾ റോമൻ അക്കത്തിൽ കാണിക്കാൻ
function toRoman(num) {
  const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
  let roman = "";
  for (let i in lookup) { 
    while (num >= lookup[i]) { 
      roman += i; 
      num -= lookup[i]; 
    } 
  }
  return roman;
}

// ഹെഡറിലെയും ഫ്ലോട്ടിംഗ് ബട്ടണിലെയും കൗണ്ട് പുതുക്കാൻ
function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  const floatingCartCount = document.getElementById("floatingCartCount");
  const totalQty = Object.values(cartMap).reduce((sum, item) => sum + item.qty, 0);
  
  if (cartCount) {
    cartCount.textContent = totalQty;
    cartCount.style.display = totalQty > 0 ? "inline-block" : "none";
  }
  if (floatingCartCount) {
    floatingCartCount.textContent = totalQty;
  }
  
  localStorage.setItem("cartMap", JSON.stringify(cartMap));
}

// ==================== CART HANDLERS ====================
function setupCart(products, container, imageFolder) {
  // ഇവന്റ് ലിസണറുകൾ ഡ്യൂപ്ലിക്കേറ്റ് ആകാതിരിക്കാൻ കണ്ടെയ്നർ ക്ലോൺ ചെയ്യുന്നു
  const newContainer = container.cloneNode(true);
  container.parentNode.replaceChild(newContainer, container);

  newContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-btn")) {
      const idx = parseInt(e.target.getAttribute("data-index"));
      const item = products[idx];
      
      if (!cartMap[item.file]) {
        cartMap[item.file] = { 
          name: item.name, 
          price: parseFloat(item.price), 
          file: item.file, 
          qty: 1 
        };
      } else { 
        cartMap[item.file].qty += 1; 
      }
      
      updateCartCount();
      showToast("Product added to cart ✅");

      // --- ലൈവ് അപ്‌ഡേറ്റ് ലോജിക് ---
      // കാർട്ട് ഓപ്പൺ ആണെങ്കിൽ ലിസ്റ്റ് ഉടൻ പുതുക്കുന്നു
      if (document.getElementById("cartModal")) {
        showCart();
      }
    }
  });

  // കാർട്ട് ഐക്കൺ ക്ലിക്ക് ചെയ്യുമ്പോൾ കാർട്ട് കാണിക്കുന്നു
  const cartIcon = document.getElementById("cartIcon");
  cartIcon.replaceWith(cartIcon.cloneNode(true));
  document.getElementById("cartIcon").addEventListener("click", showCart);
}

// കാർട്ട് വിൻഡോ കാണിക്കാൻ
function showCart() {
  let modal = document.getElementById("cartModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "cartModal";
    document.body.appendChild(modal);
  }

  const items = Object.values(cartMap);
  const imageFolder = "images/Collections/";
  let content = '<h3>Your Cart</h3><ul style="padding:0; list-style:none; max-height:300px; overflow-y:auto;">';

  if (items.length === 0) {
    content += "<li style='text-align:center; padding:20px;'>Your cart is empty.</li>";
  } else {
    items.forEach(item => {
      content += `
        <li style="display:flex; align-items:center; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:10px;">
          <img src="${imageFolder}${item.file}.jpg" style="width:45px; height:45px; margin-right:10px; border-radius:4px; object-fit:cover;">
          <div style="flex-grow:1; font-size:14px;">
            <b>${item.name}</b><br>
            ₹${item.price} x ${item.qty} = <b>₹${item.price * item.qty}</b>
          </div>
          <div style="display:flex; align-items:center; gap:5px;">
            <button onclick="changeQty('${item.file}', -1)" style="width:25px; cursor:pointer;">-</button>
            <span style="min-width:15px; text-align:center;">${item.qty}</span>
            <button onclick="changeQty('${item.file}', 1)" style="width:25px; cursor:pointer;">+</button>
            <button style="color:red; background:none; border:none; font-size:18px; cursor:pointer; margin-left:5px;" onclick="removeItem('${item.file}')">&times;</button>
          </div>
        </li>`;
    });
  }

  content += `</ul>
    <div style="margin-top:15px;">
      <button class="order-btn" onclick="orderWhatsApp()" style="width:100%; padding:10px; background:green; color:white; border:none; border-radius:4px; cursor:pointer; font-size:16px;">Order via WhatsApp</button>
      <button class="close-btn" onclick="this.parentElement.parentElement.remove()" style="width:100%; padding:8px; margin-top:8px; cursor:pointer;">Close</button>
    </div>`;
  
  modal.innerHTML = content;
}

// ക്വാണ്ടിറ്റി മാറ്റാൻ
function changeQty(key, delta) {
  if (cartMap[key]) {
    cartMap[key].qty += delta;
    if (cartMap[key].qty <= 0) delete cartMap[key];
    updateCartCount(); 
    showCart();
  }
}

// കാർട്ടിൽ നിന്ന് ഒഴിവാക്കാൻ
function removeItem(key) { 
  delete cartMap[key]; 
  updateCartCount(); 
  showCart(); 
}

// വാട്സാപ്പ് ഓർഡർ ലിങ്ക് ജനറേറ്റ് ചെയ്യാൻ
function orderWhatsApp() {
  const items = Object.values(cartMap);
  if (items.length === 0) return;

  const baseURL = "https://wa.me/9539889496?text=";
  let message = "I am interested in these products:\n";
  
  items.forEach((item, i) => {
    const romanNum = toRoman(i + 1);
    const imageURL = `https://www.pearlzpetalz.co.in/pearlz_petalz/images/Collections/${item.file}.jpg`;
    message += `\n${romanNum}. ${item.name} (Qty: ${item.qty})\nPrice: ₹${item.price * item.qty}\nLink: ${imageURL}\n`;
  });

  window.open(baseURL + encodeURIComponent(message), "_blank");
  
  // ഓർഡർ നൽകിയ ശേഷം കാർട്ട് ക്ലോസ് ചെയ്യുന്നു (ഡാറ്റ ഡിലീറ്റ് ചെയ്യുന്നില്ല)
  const modal = document.getElementById("cartModal");
  if (modal) modal.remove();
}

// ടോസ്റ്റ് മെസ്സേജ് കാണിക്കാൻ
function showToast(m) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = m; 
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}
const cart = [];

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (e) => {
    // Add to cart
    if (e.target.closest(".add-to-cart")) {
      e.preventDefault();
      const btn = e.target.closest(".add-to-cart");
      const img = btn.dataset.img;
      const caption = btn.dataset.caption;

      const existing = cart.find((item) => item.img === img);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ img, caption, qty: 1 });
      }

      showCart();
      location.hash = "#cart-modal";
    }

    // Quantity +
    if (e.target.classList.contains("qty-increase")) {
      const index = parseInt(e.target.dataset.index);
      cart[index].qty++;
      showCart();
    }

    // Quantity -
    if (e.target.classList.contains("qty-decrease")) {
      const index = parseInt(e.target.dataset.index);
      if (cart[index].qty > 1) {
        cart[index].qty--;
        showCart();
      }
    }

    // Remove
    if (e.target.classList.contains("remove-item")) {
      const index = parseInt(e.target.dataset.index);
      cart.splice(index, 1);
      showCart();
    }

    // Send to WhatsApp
    if (e.target.id === "submit-cart") {
      sendCartToWhatsApp();
    }
  });
});

function showCart() {
  const container = document.getElementById("cart-items");
  const emptyMsg = document.getElementById("empty-msg");
  const submitBtn = document.getElementById("submit-cart");

  container.innerHTML = "";

  if (cart.length === 0) {
    emptyMsg.style.display = "block";
    submitBtn.style.display = "none";
    return;
  }

  emptyMsg.style.display = "none";
  submitBtn.style.display = "block";

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="images/${item.img}" width="50">
      <span>${item.caption}</span>
      <div class="qty-controls">
        <button class="qty-decrease" data-index="${index}">-</button>
        <span>${item.qty}</span>
        <button class="qty-increase" data-index="${index}">+</button>
      </div>
      <button class="remove-item" data-index="${index}">Remove</button>
    `;
    container.appendChild(div);
  });
}

function sendCartToWhatsApp() {
  if (cart.length === 0) return;

  let message = "\n\nHi! I'm interested in these products:\n\n";
  let insta =
    "Craving More? Tap into our Insta pearlz petalz : https://www.instagram.com/pearlz_petalz";
  cart.forEach((item) => {
    const imgLink = `https://lmbpultd.github.io/pearlzpetalz//images/${item.img}`;
    message += ` *${item.caption}*   (No of Quantity : ${item.qty}) \n     ${imgLink} \n\n`;
  });

  const phone = "+919539889496";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(
    message
  )} ${insta}`;
  window.open(url, "_blank");
}

// Hide cart when clicking outside the cart modal
document.addEventListener("click", (e) => {
  const cartModal = document.getElementById("cart-modal");
  const cartContent = cartModal.querySelector(".cart-content");

  if (
    cartModal.style.display !== "none" &&
    cartModal.classList.contains("show") &&
    !cartContent.contains(e.target) &&
    !e.target.closest(".add-to-cart")
  ) {
    cartModal.classList.remove("show");
    cartModal.style.display = "none";
  }
});

// Show cart modal with 'show' class
function showCart() {
  const container = document.getElementById("cart-items");
  const emptyMsg = document.getElementById("empty-msg");
  const submitBtn = document.getElementById("submit-cart");
  const cartModal = document.getElementById("cart-modal");

  container.innerHTML = "";

  if (cart.length === 0) {
    emptyMsg.style.display = "block";
    submitBtn.style.display = "none";
  } else {
    emptyMsg.style.display = "none";
    submitBtn.style.display = "block";

    cart.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <img src="images/${item.img}" width="50">
        <span>${item.caption}</span>
        <div class="qty-controls">
          <button class="qty-decrease" data-index="${index}">-</button>
          <span>${item.qty}</span>
          <button class="qty-increase" data-index="${index}">+</button>
        </div>
        <button class="remove-item" data-index="${index}">Remove</button>
      `;
      container.appendChild(div);
    });
  }

  // Show cart modal
  cartModal.classList.add("show");
  cartModal.style.display = "block";
}

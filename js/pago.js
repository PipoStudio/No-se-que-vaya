// =========================================================
// GEEKWAVE CHECKOUT
// pago.js
// =========================================================

console.log("[Geekwave] Checkout Inicializado");

// =========================================================
// VARIABLES
// =========================================================

const CART_KEY = "geekwave_cart";
const USER_KEY = "geekwave_user_billing";

let inventario = [];
let currentPayment = "wompi";
let couponDiscount = 0;

// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", async () => {

    initLucide();
    initLenis();
    initAccordion();
    initPaymentMethods();
    initContactMethods();
    initCoupon();
    initValidation();
    initSavedData();

    await loadInventory();

    renderCheckoutCart();
    validateCheckout();

});

// =========================================================
// LUCIDE
// =========================================================

function initLucide() {

    if (window.lucide) {
        lucide.createIcons();
    }

}

// =========================================================
// LENIS
// =========================================================

function initLenis() {

    if (typeof Lenis !== "undefined") {

        const lenis = new Lenis({
            duration: 1.3,
            smoothWheel: true,
            lerp: 0.08
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

    }

}

// =========================================================
// INVENTARIO
// =========================================================

async function loadInventory() {

    try {

        const response = await fetch("/json/inventario.json");

        if (!response.ok) {
            throw new Error("No se pudo cargar inventario");
        }

        inventario = await response.json();

        console.log("[Geekwave] Inventario cargado");

    } catch (error) {

        console.error(error);

    }

}

// =========================================================
// ACCORDION
// =========================================================

function initAccordion() {

    const toggles = document.querySelectorAll(".step-toggle");

    toggles.forEach(toggle => {

        toggle.addEventListener("click", () => {

            const target = toggle.dataset.step;
            toggleAccordion(target);

        });

    });

}

window.toggleAccordion = function(stepId) {

    const target = document.getElementById(stepId);

    if (!target) return;

    const isActive = target.classList.contains("active");

    document.querySelectorAll(".checkout-step")
        .forEach(step => step.classList.remove("active"));

    if (!isActive) {
        target.classList.add("active");
    }

};

// =========================================================
// PAYMENT METHODS
// =========================================================

function initPaymentMethods() {

    const methods = document.querySelectorAll(".payment-method");

    methods.forEach(method => {

        method.addEventListener("click", () => {

            methods.forEach(m => m.classList.remove("active"));

            method.classList.add("active");

            currentPayment = method.dataset.payment;

        });

    });

}

// =========================================================
// CONTACT METHODS
// =========================================================

function initContactMethods() {

    const methods = document.querySelectorAll(".contact-method");

    methods.forEach(method => {

        method.addEventListener("click", () => {

            methods.forEach(m => m.classList.remove("active"));

            method.classList.add("active");

        });

    });

}

// =========================================================
// CART
// =========================================================

function getCart() {

    return JSON.parse(localStorage.getItem(CART_KEY)) || [];

}

function saveCart(cart) {

    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    renderCheckoutCart();

    syncNavbarCart();

}

function renderCheckoutCart() {

    const container = document.getElementById("checkout-products");

    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {

        container.innerHTML = `
            <div class="checkout-empty">
                <h3>Tu carrito está vacío</h3>
                <p>Agrega productos antes de continuar.</p>
            </div>
        `;

        updateTotals(0);

        return;

    }

    let subtotal = 0;

    container.innerHTML = cart.map(item => {

        const product = inventario.find(
            p => parseInt(p.id) === parseInt(item.id)
        );

        if (!product) return "";

        const quantity = item.qty || 1;
        const total = product.precio_usd * quantity;

        subtotal += total;

        return `
            <article class="checkout-product">
                
                <div class="checkout-product-image">
                    <img src="${product.imagen}" alt="${product.nombre}">
                </div>

                <div class="checkout-product-info">

                    <div class="checkout-product-top">
                        <h4>${product.nombre}</h4>

                        <button 
                            class="remove-product-btn"
                            onclick="removeFromCart(${item.id})"
                        >
                            <i data-lucide="x"></i>
                        </button>
                    </div>

                    <div class="checkout-product-bottom">

                        <div class="checkout-qty">

                            <button onclick="changeQty(${item.id}, -1)">
                                -
                            </button>

                            <span>${quantity}</span>

                            <button onclick="changeQty(${item.id}, 1)">
                                +
                            </button>

                        </div>

                        <strong>
                            $${total.toFixed(2)}
                        </strong>

                    </div>

                </div>

            </article>
        `;

    }).join("");

    updateTotals(subtotal);

    initLucide();

}

// =========================================================
// QTY
// =========================================================

window.changeQty = function(id, delta) {

    let cart = getCart();

    const item = cart.find(
        item => parseInt(item.id) === parseInt(id)
    );

    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {

        cart = cart.filter(
            i => parseInt(i.id) !== parseInt(id)
        );

    }

    saveCart(cart);

};

window.removeFromCart = function(id) {

    let cart = getCart();

    cart = cart.filter(
        item => parseInt(item.id) !== parseInt(id)
    );

    saveCart(cart);

};

// =========================================================
// TOTALS
// =========================================================

function updateTotals(subtotal) {

    const discount = subtotal * couponDiscount;

    const finalTotal = subtotal - discount;

    const subtotalEl = document.getElementById("checkout-subtotal");
    const totalEl = document.getElementById("checkout-total");
    const discountRow = document.getElementById("discount-row");
    const discountAmount = document.getElementById("discount-amount");

    if (subtotalEl) {
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    }

    if (totalEl) {
        totalEl.textContent = `$${finalTotal.toFixed(2)}`;
    }

    if (discount > 0) {

        discountRow.classList.add("active");

        discountAmount.textContent = `-$${discount.toFixed(2)}`;

    } else {

        discountRow.classList.remove("active");

    }

    const payBtn = document.getElementById("main-pay-btn");

    if (payBtn) {

        payBtn.querySelector(".btn-price").textContent =
            `$${finalTotal.toFixed(2)}`;

    }

}

// =========================================================
// VALIDATION
// =========================================================

function initValidation() {

    const fields = document.querySelectorAll(".checkout-input");

    fields.forEach(field => {

        field.addEventListener("input", () => {

            validateField(field);
            validateCheckout();

        });

    });

}

function validateField(field) {

    if (field.value.trim().length > 2) {

        field.classList.add("valid");
        field.classList.remove("invalid");

    } else {

        field.classList.remove("valid");
        field.classList.add("invalid");

    }

}

function validateCheckout() {

    const requiredFields = document.querySelectorAll(
        ".checkout-input[required]"
    );

    let valid = true;

    requiredFields.forEach(field => {

        if (field.value.trim() === "") {
            valid = false;
        }

    });

    const cart = getCart();

    if (cart.length === 0) {
        valid = false;
    }

    const button = document.getElementById("main-pay-btn");

    if (!button) return;

    if (valid) {

        button.classList.add("ready");

        button.querySelector(".btn-text").textContent =
            currentPayment === "paypal"
                ? "Continuar con PayPal"
                : "Proceder al pago";

    } else {

        button.classList.remove("ready");

        button.querySelector(".btn-text").textContent =
            "Completa tus datos";

    }

}

// =========================================================
// SAVED DATA
// =========================================================

function initSavedData() {

    const data = JSON.parse(
        localStorage.getItem(USER_KEY)
    );

    if (!data) return;

    setValue("checkout-name", data.name);
    setValue("checkout-email", data.email);
    setValue("checkout-city", data.city);
    setValue("checkout-address", data.address);
    setValue("checkout-phone", data.phone);

    const remember = document.getElementById("remember-data");

    if (remember) {
        remember.checked = true;
    }

}

function saveUserData() {

    const remember = document.getElementById("remember-data");

    if (!remember || !remember.checked) return;

    const data = {

        name:
            getValue("checkout-name"),

        email:
            getValue("checkout-email"),

        city:
            getValue("checkout-city"),

        address:
            getValue("checkout-address"),

        phone:
            getValue("checkout-phone")

    };

    localStorage.setItem(USER_KEY, JSON.stringify(data));

}

// =========================================================
// HELPERS
// =========================================================

function getValue(id) {

    const el = document.getElementById(id);

    return el ? el.value : "";

}

function setValue(id, value) {

    const el = document.getElementById(id);

    if (el && value) {
        el.value = value;
    }

}

// =========================================================
// COUPONS
// =========================================================

function initCoupon() {

    const btn = document.getElementById("apply-coupon-btn");

    if (!btn) return;

    btn.addEventListener("click", applyCoupon);

}

function applyCoupon() {

    const input = document.getElementById("coupon-input");

    if (!input) return;

    const code = input.value.trim().toUpperCase();

    if (code === "GEEK10") {

        couponDiscount = 0.10;

        showToast("Cupón aplicado: 10% OFF");

    } else if (code === "WELCOME") {

        couponDiscount = 0.05;

        showToast("Cupón aplicado: 5% OFF");

    } else {

        couponDiscount = 0;

        showToast("Cupón inválido");

    }

    renderCheckoutCart();

}

// =========================================================
// PAY
// =========================================================

window.processPayment = async function() {

    const button = document.getElementById("main-pay-btn");

    if (!button.classList.contains("ready")) {

        toggleAccordion("step-shipping");

        showToast("Completa todos los campos");

        return;

    }

    saveUserData();

    showOverlay();

    try {

        await fakePaymentDelay();

        if (currentPayment === "paypal") {

            console.log("Procesar PayPal");

        } else {

            console.log("Procesar Wompi");

        }

        // =================================================
        // AQUÍ CONECTAS TU NETLIFY FUNCTION
        // =================================================

        setTimeout(() => {

            hideOverlay();

            showToast("Pago procesado correctamente");

        }, 1000);

    } catch (error) {

        console.error(error);

        hideOverlay();

        showToast("Error procesando pago");

    }

};

// =========================================================
// FAKE DELAY
// =========================================================

function fakePaymentDelay() {

    return new Promise(resolve => {

        setTimeout(resolve, 2000);

    });

}

// =========================================================
// OVERLAY
// =========================================================

function showOverlay() {

    const overlay = document.getElementById("payment-overlay");

    if (overlay) {
        overlay.classList.add("active");
    }

}

function hideOverlay() {

    const overlay = document.getElementById("payment-overlay");

    if (overlay) {
        overlay.classList.remove("active");
    }

}

// =========================================================
// TOAST
// =========================================================

function showToast(message) {

    let toast = document.querySelector(".geekwave-toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.className = "geekwave-toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

// =========================================================
// NAVBAR CART SYNC
// =========================================================

function syncNavbarCart() {

    const cart = getCart();

    const totalItems = cart.reduce(
        (acc, item) => acc + item.qty,
        0
    );

    const badge = document.getElementById("cartBadge");

    if (!badge) return;

    if (totalItems > 0) {

        badge.textContent = totalItems;
        badge.classList.add("show");

    } else {

        badge.classList.remove("show");

    }

}

// =========================================================
// EMPTY STATE STYLE
// =========================================================

const style = document.createElement("style");

style.innerHTML = `

.checkout-empty {

    padding: 4rem 2rem;
    text-align: center;

}

.checkout-empty h3 {

    font-family: "Space Grotesk", sans-serif;
    margin-bottom: 1rem;

}

.checkout-empty p {

    color: rgba(255,255,255,0.5);

}

.checkout-product {

    display: flex;
    gap: 1rem;

    padding: 1rem;

    border-radius: 24px;

    background: rgba(255,255,255,0.03);

    border: 1px solid rgba(255,255,255,0.06);

    margin-bottom: 1rem;

}

.checkout-product-image {

    width: 90px;
    height: 90px;

    border-radius: 18px;

    overflow: hidden;

    flex-shrink: 0;

}

.checkout-product-image img {

    width: 100%;
    height: 100%;

    object-fit: cover;

}

.checkout-product-info {

    flex: 1;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

}

.checkout-product-top {

    display: flex;
    justify-content: space-between;
    gap: 1rem;

}

.checkout-product-top h4 {

    margin: 0;

    font-family: "Space Grotesk", sans-serif;

    font-size: 1rem;

    line-height: 1.4;

}

.remove-product-btn {

    width: 36px;
    height: 36px;

    border-radius: 12px;

    border: none;

    background: rgba(255,255,255,0.05);

    color: rgba(255,255,255,0.7);

    cursor: pointer;

}

.checkout-product-bottom {

    display: flex;
    justify-content: space-between;
    align-items: center;

}

.checkout-qty {

    display: flex;
    align-items: center;

    gap: 12px;

    padding: 0.5rem 0.8rem;

    border-radius: 999px;

    background: rgba(255,255,255,0.04);

}

.checkout-qty button {

    width: 28px;
    height: 28px;

    border-radius: 50%;

    border: none;

    background: rgba(255,255,255,0.08);

    color: white;

    cursor: pointer;

}

.geekwave-toast {

    position: fixed;

    bottom: 30px;
    right: 30px;

    background: #00ff7f;
    color: black;

    padding: 1rem 1.4rem;

    border-radius: 18px;

    font-weight: 800;

    z-index: 999999;

    opacity: 0;

    transform: translateY(20px);

    transition: all 0.35s ease;

}

.geekwave-toast.show {

    opacity: 1;

    transform: translateY(0);

}

`;

document.head.appendChild(style);
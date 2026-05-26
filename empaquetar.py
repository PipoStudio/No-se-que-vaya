import os
import shutil
import re

print("🚀 Iniciando empaquetado inteligente para Netlify...")

base_dir = os.getcwd()
deploy_dir = os.path.join(base_dir, 'NETLIFY_DEPLOY_READY')
public_dir = os.path.join(deploy_dir, 'public')
functions_dir = os.path.join(deploy_dir, 'netlify', 'functions')

# 1. Limpiar y crear estructura de carpetas
if os.path.exists(deploy_dir):
    shutil.rmtree(deploy_dir)
os.makedirs(public_dir)
os.makedirs(functions_dir)

# 2. Copiar todo el Frontend a la carpeta "public"
ignore_items = {'GEEKWAVE_READY', 'NETLIFY_DEPLOY_READY', 'node_modules', '.git', 'netlify'}
for item in os.listdir(base_dir):
    if item in ignore_items or item.endswith('.py'):
        continue
    src = os.path.join(base_dir, item)
    dst = os.path.join(public_dir, item)
    if os.path.isdir(src):
        shutil.copytree(src, dst)
    else:
        shutil.copy2(src, dst)

print("✅ Frontend copiado a /public")

# 3. Buscar y Mover el Backend (Wompi)
backend_found = False
for root, dirs, files in os.walk(base_dir):
    if 'NETLIFY_DEPLOY_READY' in root: continue
    if 'process-payment.js' in files:
        shutil.copy2(os.path.join(root, 'process-payment.js'), functions_dir)
        backend_found = True
        break

if backend_found:
    print("✅ Backend Wompi (process-payment.js) encontrado y posicionado.")
else:
    print("⚠️ Advertencia: No se encontró process-payment.js en el proyecto.")

# 4. Crear package.json EN LA RAÍZ (Netlify lo prefiere así para instalar globalmente)
with open(os.path.join(deploy_dir, 'package.json'), 'w', encoding='utf-8') as f:
    f.write('{\n  "dependencies": {\n    "axios": "^1.7.0"\n  }\n}')

# 5. Crear netlify.toml con el comando de build incluido
# Esto arregla exactamente el error de "Cannot find module 'axios'"
toml_content = """[build]
  command = "npm install"
  publish = "public"
  functions = "netlify/functions"
"""
with open(os.path.join(deploy_dir, 'netlify.toml'), 'w', encoding='utf-8') as f:
    f.write(toml_content)
print("✅ Archivo netlify.toml generado con comando de instalación.")

# 6. INYECTAR LA SOLUCIÓN AL PAGO.HTML EN LA COPIA
pago_path = os.path.join(public_dir, 'pago.html')
if os.path.exists(pago_path):
    with open(pago_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Arreglar CSS del acordeón
    style_fix = """
    <style>
        .step-content { max-height: 0; overflow: hidden; opacity: 0; transition: all 0.4s ease; padding: 0 35px; }
        .accordion-step.active .step-content { max-height: 1500px; opacity: 1; padding: 25px 35px; overflow: visible; }
    </style>
</head>"""
    if ".step-content { max-height: 0;" not in content:
        content = content.replace('</head>', style_fix)

    # Inyectar el JS unificado
    pattern = re.compile(r'(<script src="https://unpkg\.com/lenis@1\.1\.18/dist/lenis\.min\.js"></script>).*?</body>', re.DOTALL)
    
    js_unificado = """<script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
    <script>
        const lenis = new Lenis({ autoRaf: true, duration: 1.8, lerp: 0.08, smoothWheel: true });
        lucide.createIcons();

        let inventario = [];
        let isContactSaved = false;

        function getCart() { return JSON.parse(localStorage.getItem('geekwave_cart')) || []; }
        function saveCart(cart) { localStorage.setItem('geekwave_cart', JSON.stringify(cart)); renderAllCarts(); }

        window.addToCart = function(id, nombre, qty) {
            let cart = getCart();
            let item = cart.find(i => parseInt(i.id) === parseInt(id));
            if (item) item.qty += parseInt(qty);
            else cart.push({ id, nombre, qty: parseInt(qty) });
            saveCart(cart);
            const drop = document.getElementById('cartDropdown');
            if(drop) drop.classList.add('show');
        };

        window.changeCartQty = function(id, delta) {
            let cart = getCart();
            let item = cart.find(i => parseInt(i.id) === parseInt(id));
            if(item) { item.qty += delta; if(item.qty < 1) item.qty = 1; }
            saveCart(cart);
        };

        window.removeFromCart = function(id) {
            let cart = getCart();
            cart = cart.filter(i => parseInt(i.id) !== parseInt(id));
            saveCart(cart);
        };

        // --- SINCRONIZACIÓN PERFECTA ---
        function renderAllCarts() {
            const cart = getCart();
            let subtotal = 0;
            const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

            const badgeC = document.getElementById('cartBadge');
            if (badgeC) {
                if (totalItems > 0) { badgeC.textContent = totalItems; badgeC.classList.add('show'); }
                else badgeC.classList.remove('show');
            }

            const navContainer = document.getElementById('cartItemsContainer');
            if (navContainer) {
                if (cart.length === 0) navContainer.innerHTML = `<div style="text-align:center; padding:20px; color:#888;">Vacío</div>`;
                else navContainer.innerHTML = cart.map(item => `<div class="cart-item" style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #222;"><span>${item.nombre}</span><span style="color:#00ff7f;">x${item.qty}</span></div>`).join('');
            }

            const chkContainer = document.getElementById('checkout-cart-items');
            const mainBtn = document.getElementById('mainActionBtn');
            if (chkContainer) {
                if (cart.length === 0) {
                    chkContainer.innerHTML = `<div style="text-align:center; padding:40px 0; color:#888;">Tu carrito está vacío.</div>`;
                    if(mainBtn) mainBtn.style.display = 'none';
                } else {
                    if(mainBtn) mainBtn.style.display = 'block';
                    chkContainer.innerHTML = cart.map(item => {
                        const prod = inventario.find(i => parseInt(i.id) === parseInt(item.id));
                        if(prod) {
                            const total = prod.precio_usd * item.qty;
                            subtotal += total;
                            return `
                            <div style="display:flex; align-items:center; gap:15px; background:rgba(255,255,255,0.02); padding:12px; border-radius:12px; margin-bottom:15px; border:1px solid #333;">
                                <img src="${prod.imagen}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
                                <div style="flex:1;">
                                    <h4 style="margin:0; font-size:0.95rem; color:white;">${prod.nombre}</h4>
                                    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">
                                        <div style="display:flex; align-items:center; gap:10px; background:#0a0a0a; border-radius:6px; padding:4px 8px; border:1px solid #222;">
                                            <button onclick="changeCartQty(${item.id}, -1)" style="background:none; border:none; color:white; cursor:pointer;">-</button>
                                            <span style="font-weight:bold; font-size:0.9rem;">${item.qty}</span>
                                            <button onclick="changeCartQty(${item.id}, 1)" style="background:none; border:none; color:white; cursor:pointer;">+</button>
                                        </div>
                                        <div style="color:#00ff7f; font-weight:800;">$${total.toFixed(2)}</div>
                                    </div>
                                </div>
                                <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:#ff4444; cursor:pointer;"><i data-lucide="trash-2" style="width:18px;"></i></button>
                            </div>`;
                        }
                        return '';
                    }).join('');
                }
            }

            const subtotalEl = document.getElementById('calc-subtotal');
            const totalEl = document.getElementById('calc-total');
            if(subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
            if(totalEl) totalEl.innerText = `$${subtotal.toFixed(2)}`;

            lucide.createIcons();
            validateCheckout();
        }

        document.addEventListener('DOMContentLoaded', async () => {
            try {
                const res = await fetch('/json/inventario.json');
                if(!res.ok) throw new Error("Fallo carga");
                inventario = await res.json();
                renderAllCarts(); 
            } catch(e) { console.error("Error BD", e); }

            document.querySelectorAll('.v-field').forEach(i => i.addEventListener('input', validateCheckout));
            
            const cartBtn = document.getElementById('cartBtn');
            const cartDropdown = document.getElementById('cartDropdown');
            if(cartBtn) cartBtn.addEventListener('click', (e) => { e.stopPropagation(); cartDropdown.classList.toggle('show'); renderAllCarts(); });
            document.addEventListener('click', (e) => { if(cartDropdown && !cartDropdown.contains(e.target) && !cartBtn.contains(e.target)) cartDropdown.classList.remove('show'); });
            
            // Auto rellenar
            const savedData = JSON.parse(localStorage.getItem('geekwave_user_billing'));
            if(savedData) {
                if(document.getElementById('chk-nombre')) document.getElementById('chk-nombre').value = savedData.nombre || '';
                if(document.getElementById('chk-email')) document.getElementById('chk-email').value = savedData.email || '';
                if(document.getElementById('chk-direccion')) document.getElementById('chk-direccion').value = savedData.direccion || '';
                if(document.getElementById('save-info-chk')) document.getElementById('save-info-chk').checked = true;
            }
        });

        window.toggleAccordion = function(id) {
            const step = document.getElementById(id);
            if(step.classList.contains('active')) step.classList.remove('active');
            else {
                document.querySelectorAll('.accordion-step').forEach(s => s.classList.remove('active'));
                step.classList.add('active');
            }
        };

        window.showContactInput = function(type, el) {
            el.parentElement.querySelectorAll('.select-card').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
            document.getElementById('contact-input-wrapper').style.display = 'block';
            document.getElementById('contact-label').innerText = `Ingresa tu número para ${type}`;
            isContactSaved = false;
            document.getElementById('contact-saved-msg').style.display = 'none';
            validateCheckout();
        };

        window.saveContactNumber = function(e) {
            e.preventDefault();
            if(document.getElementById('chk-telefono').value.length > 5) {
                isContactSaved = true;
                document.getElementById('contact-saved-msg').style.display = 'block';
                validateCheckout();
            } else { alert("Número inválido"); }
        };

        window.selectPayment = function(el) {
            el.parentElement.querySelectorAll('.select-card').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
        };

        function validateCheckout() {
            const req = document.querySelectorAll('.v-field:not(.opcional)');
            let ok = true;
            req.forEach(i => { if(i.value.trim() === "") ok = false; });
            if(!isContactSaved) ok = false;
            
            const cart = JSON.parse(localStorage.getItem('geekwave_cart')) || [];
            if(cart.length === 0) ok = false;

            const btn = document.getElementById('mainActionBtn');
            if(!btn || btn.innerText === "Procesando...") return; 

            if(ok) {
                btn.classList.add('ready');
                btn.innerText = "PAGAR EN WOMPI";
                btn.style.background = "#00ff7f";
                btn.style.color = "black";
            } else {
                btn.classList.remove('ready');
                btn.innerText = "COMPLETA LOS DATOS";
                btn.style.background = "#252525";
                btn.style.color = "#888";
            }
        }

        window.processExternalPayment = async function() {
            const btn = document.getElementById('mainActionBtn');
            if(!btn.classList.contains('ready')) {
                toggleAccordion('step1'); 
                return;
            }

            document.getElementById('transition-overlay').classList.add('active');
            btn.innerText = "Procesando...";
            btn.classList.remove('ready');

            const email = document.getElementById('chk-email').value;
            const amount = parseFloat(document.getElementById('calc-total').innerText.replace('$','').replace(',',''));

            try {
                const res = await fetch('/.netlify/functions/process-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, amount })
                });

                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Netlify devolvió HTML en vez de la pasarela. La estructura de carpetas falló.");
                }

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Wompi rechazó la conexión");

                if(data.urlPagoWompi) {
                    window.location.href = data.urlPagoWompi; 
                } else {
                    throw new Error("Wompi no generó el enlace de pago.");
                }
            } catch (err) {
                console.error(err);
                alert("⚠️ Error: " + err.message);
                document.getElementById('transition-overlay').classList.remove('active');
                validateCheckout(); 
            }
        };
    </script>
</body>"""
    
    content = pattern.sub(js_unificado, content)
    
    with open(pago_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ pago.html inyectado con Sincronización y Wompi en la versión de despliegue.")

print("🎉 ¡LISTO! Todo se ha guardado en la carpeta 'NETLIFY_DEPLOY_READY'.")
print("👉 Solo arrastra esa carpeta completa a Netlify y todo funcionará.")
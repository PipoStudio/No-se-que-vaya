import os
import re

# Buscar inteligentemente el archivo pago.html dependiendo de dónde estés en la terminal
posibles_rutas = [
    'pago.html',                                       # Si estás dentro de geekwave_netlify
    'GEEKWAVE_READY/pago.html',                        # Si estás dentro de geekwave_netlify y usas la carpeta nueva
    os.path.join('geekwave_netlify', 'pago.html'),     # Si estás una carpeta atrás
    os.path.join('geekwave_netlify', 'GEEKWAVE_READY', 'pago.html')
]

file_path = None
for ruta in posibles_rutas:
    if os.path.exists(ruta):
        file_path = ruta
        break

if not file_path:
    print("❌ Error: No se encontró el archivo pago.html en ninguna de las rutas esperadas.")
    exit(1)

print(f"🔍 Encontrado y analizando: {file_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Eliminar TODOS los bloques <script> ... </script> existentes al final del body
pattern_scripts = re.compile(r'(<script src="https://unpkg\.com/lenis@1\.1\.18/dist/lenis\.min\.js"></script>).*?</body>', re.DOTALL)

if not pattern_scripts.search(content):
    print("❌ No se encontró la etiqueta Lenis al final del archivo. Asegúrate de no haberla borrado manualmente.")
    exit(1)

# 2. El nuevo bloque de código unificado (HTML + JS)
new_scripts = """<script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
    <script>
        lucide.createIcons();
        const lenis = new Lenis({ autoRaf: true, duration: 1.8 });

        // --- SISTEMA GLOBAL UNIFICADO ---
        let invGlobal = [];
        let contactSaved = false;

        document.addEventListener('DOMContentLoaded', async () => {
            // 1. Cargar Base de Datos
            try {
                const res = await fetch('/json/inventario.json');
                invGlobal = await res.json();
                renderAllCarts(); 
            } catch (err) { console.error("Error BD:", err); }

            // 2. Buscador del Nav
            const searchBtn = document.getElementById('searchBtn');
            if (searchBtn) {
                searchBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const container = document.getElementById('searchContainer');
                    if (container) container.classList.toggle('active');
                });
            }

            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const q = e.target.value.toLowerCase().trim();
                    const resDiv = document.getElementById('searchResults');
                    if (!resDiv) return;

                    if (q === "") { resDiv.classList.remove('active'); return; }
                    
                    let matches = invGlobal.filter(p => p.nombre.toLowerCase().includes(q)).slice(0, 4);
                    if (matches.length > 0) {
                        resDiv.classList.add('active');
                        resDiv.innerHTML = matches.map(p => `
                            <div class="result-item" style="cursor:pointer;" onclick="addProd(${p.id}, '${p.nombre.replace(/'/g, "")}', 1)">
                                <span style="color:white;">${p.nombre}</span>
                                <span style="color:#00ff7f; margin-left:auto;">$${p.precio_usd.toFixed(2)}</span>
                                <i data-lucide="plus" style="margin-left:10px;"></i>
                            </div>`).join('');
                        lucide.createIcons();
                    } else { resDiv.classList.remove('active'); }
                });
            }

            // 3. Carrito del Nav (Dropdown)
            const cartBtn = document.getElementById('cartBtn');
            if (cartBtn) {
                cartBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const dropdown = document.getElementById('cartDropdown');
                    if (dropdown) dropdown.classList.toggle('show');
                });
            }

            // Ocultar al hacer clic afuera
            document.addEventListener('click', () => {
                const drop = document.getElementById('cartDropdown');
                const searchCont = document.getElementById('searchContainer');
                const searchRes = document.getElementById('searchResults');
                if (drop) drop.classList.remove('show');
                if (searchCont) searchCont.classList.remove('active');
                if (searchRes) searchRes.classList.remove('active');
            });

            // 4. Validación en tiempo real del formulario
            document.querySelectorAll('.v-field').forEach(input => {
                input.addEventListener('input', checkForm);
            });
        });

        // --- FUNCIONES DE CARRITO ---
        function getCart() { return JSON.parse(localStorage.getItem('geekwave_cart')) || []; }
        function saveCart(cart) { localStorage.setItem('geekwave_cart', JSON.stringify(cart)); renderAllCarts(); }

        window.addProd = function(id, nombre, qty) {
            let cart = getCart();
            let item = cart.find(i => parseInt(i.id) === parseInt(id));
            if (item) item.qty += qty;
            else cart.push({ id, nombre, qty });
            saveCart(cart);
            const searchCont = document.getElementById('searchContainer');
            if (searchCont) searchCont.classList.remove('active');
        };
        window.addToCart = window.addProd;

        window.updateQty = function(id, delta) {
            let cart = getCart();
            let item = cart.find(i => parseInt(i.id) === parseInt(id));
            if(item) {
                item.qty += delta;
                if(item.qty < 1) item.qty = 1; 
            }
            saveCart(cart);
        };
        window.changeCartQty = window.updateQty;

        window.deleteProd = function(id) {
            let cart = getCart();
            cart = cart.filter(i => parseInt(i.id) !== parseInt(id));
            saveCart(cart);
        };
        window.removeFromCart = window.deleteProd;

        // --- RENDERIZADORES MÚLTIPLES ---
        function renderAllCarts() {
            if (invGlobal.length === 0) return;
            const cart = getCart();
            let subtotal = 0;
            
            // Render 1: Navbar
            const navContainer = document.getElementById('cartItemsContainer');
            const badge = document.getElementById('cartBadge');
            let totalItems = cart.reduce((s, i) => s + i.qty, 0);
            
            if(badge) {
                if(totalItems > 0) { badge.textContent = totalItems; badge.classList.add('show'); } 
                else { badge.classList.remove('show'); }
            }

            if (navContainer) {
                if(cart.length === 0) navContainer.innerHTML = `<div style="padding:20px; text-align:center;">Vacío</div>`;
                else {
                    navContainer.innerHTML = cart.map(item => `<div class="cart-item" style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #222;"><span>${item.nombre}</span><span>x${item.qty}</span></div>`).join('');
                }
            }

            // Render 2: Checkout (TU PEDIDO)
            const chkContainer = document.getElementById('checkout-cart-items');
            if (chkContainer) {
                if(cart.length === 0) {
                    chkContainer.innerHTML = `<div style="text-align:center; padding:30px; color:#555;"><i data-lucide="shopping-cart"></i><br>Agrega productos</div>`;
                } else {
                    chkContainer.innerHTML = cart.map(item => {
                        const prod = invGlobal.find(p => parseInt(p.id) === parseInt(item.id));
                        if(prod) {
                            const total = prod.precio_usd * item.qty;
                            subtotal += total;
                            const img = prod.imagen || 'https://via.placeholder.com/65x65/000/00ff7f';
                            
                            return `
                            <div class="chk-item-card" style="display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.02); padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #1a1a1a;">
                                <img src="${img}" alt="prod" style="width: 65px; height: 65px; object-fit: cover; border-radius: 8px; border: 1px solid #222;">
                                <div class="chk-item-info" style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                    <h4 style="margin: 0; font-size: 0.95rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;">${prod.nombre}</h4>
                                    <div class="chk-controls-wrapper" style="display: flex; align-items: center; justify-content: space-between;">
                                        <div class="chk-qty-box" style="display: flex; align-items: center; gap: 10px; background: #0a0a0a; border-radius: 6px; padding: 4px 8px; border: 1px solid #222;">
                                            <button class="chk-qty-btn" onclick="updateQty(${item.id}, -1)" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.1rem; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">-</button>
                                            <span style="font-weight:bold; font-size:0.9rem;">${item.qty}</span>
                                            <button class="chk-qty-btn" onclick="updateQty(${item.id}, 1)" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.1rem; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">+</button>
                                        </div>
                                        <span class="chk-item-price" style="font-weight: 800; font-size: 1rem; color: #00ff7f; font-family: 'Space Grotesk';">$${total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button class="chk-trash-btn" onclick="deleteProd(${item.id})" style="background: none; border: none; color: #ff4444; cursor: pointer; padding: 8px; border-radius: 6px; transition: 0.2s;"><i data-lucide="trash-2" style="width:18px;"></i></button>
                            </div>`;
                        }
                    }).join('');
                }
            }

            // Actualizar Totales
            const calcSub = document.getElementById('calc-subtotal');
            const calcTot = document.getElementById('calc-total');
            if (calcSub) calcSub.innerText = `$${subtotal.toFixed(2)}`;
            if (calcTot) calcTot.innerText = `$${subtotal.toFixed(2)}`;
            lucide.createIcons();
            
            checkForm(); 
        }

        // --- FUNCIONES INTERACTIVAS DEL CHECKOUT ---
        window.toggleAcc = function(id) {
            const step = document.getElementById(id);
            if (!step) return;
            if(step.classList.contains('active')) {
                step.classList.remove('active');
            } else {
                document.querySelectorAll('.accordion-step').forEach(s => s.classList.remove('active'));
                step.classList.add('active');
            }
        };

        window.highlightCard = function(el) {
            if (!el || !el.parentElement) return;
            el.parentElement.querySelectorAll('.select-card').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
        };

        window.selectContact = function(type, el) {
            highlightCard(el);
            const box = document.getElementById('contact-box');
            const label = document.getElementById('contact-label');
            const ok = document.getElementById('contact-ok');
            if (box) box.style.display = 'block';
            if (label) label.innerText = `Ingresa tu número para ${type}`;
            contactSaved = false;
            if (ok) ok.style.display = 'none';
            checkForm();
        };

        window.saveContact = function(e) {
            e.preventDefault();
            const tel = document.getElementById('chk-telefono');
            const ok = document.getElementById('contact-ok');
            if(tel && tel.value.length > 6) {
                contactSaved = true;
                if (ok) ok.style.display = 'flex';
                checkForm();
            } else { alert("Número inválido"); }
        };

        function checkForm() {
            const req = document.querySelectorAll('.v-field:not(.opcional)');
            let ok = true;
            req.forEach(i => { if(i.value.trim() === "") ok = false; });
            if(!contactSaved) ok = false;
            if(getCart().length === 0) ok = false;

            const btn = document.getElementById('mainActionBtn');
            if (!btn) return;

            if(ok) {
                btn.classList.add('ready');
                btn.innerText = "PAGAR EN WOMPI";
                btn.style.background = "#00ff7f";
                btn.style.color = "black";
            } else {
                btn.classList.remove('ready');
                btn.innerText = "COMPLETA TUS DATOS";
                btn.style.background = "#252525";
                btn.style.color = "#555";
            }
        }

        window.processExternalPayment = async function() {
            const btn = document.getElementById('mainActionBtn');
            if(!btn || !btn.classList.contains('ready')) {
                toggleAcc('step1'); 
                return;
            }

            btn.innerText = "Conectando...";
            btn.style.opacity = "0.7";
            btn.style.pointerEvents = "none";
            
            const emailValue = document.getElementById('chk-email') ? document.getElementById('chk-email').value : '';
            const calcTotal = document.getElementById('calc-total');
            const rawTotal = calcTotal ? calcTotal.innerText.replace('$', '').replace(',', '') : '0';
            const amountValue = parseFloat(rawTotal);

            try {
                const res = await fetch('/.netlify/functions/process-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailValue, amount: amountValue })
                });

                if (!res.ok) throw new Error("Fallo de red con el servidor");
                const data = await res.json();
                
                if(data.urlPagoWompi) {
                    window.location.href = data.urlPagoWompi;
                } else {
                    throw new Error("Respuesta inválida de Wompi");
                }
            } catch (err) {
                console.error(err);
                alert("⚠️ Error al conectar con pasarela: " + err.message);
                btn.innerText = "PAGAR EN WOMPI";
                btn.style.opacity = "1";
                btn.style.pointerEvents = "auto";
                checkForm();
            }
        };
    </script>
</body>"""

updated_content = pattern_scripts.sub(new_scripts, content)

# 3. Solucionar el problema de los estilos ocultos del Acordeón en el HTML directamente
style_fix = """
    <style>
        /* Fix Acordeon y Carrito */
        .step-header { display: flex; justify-content: space-between; cursor: pointer; user-select: none; }
        .accordion-icon { transition: transform 0.3s ease; color: #888; }
        .accordion-step.active .accordion-icon { transform: rotate(180deg); color: #00ff7f; }
        .step-content { max-height: 0; overflow: hidden; opacity: 0; padding: 0 35px; transition: all 0.4s ease; }
        .accordion-step.active .step-content { max-height: 1500px; opacity: 1; padding: 25px 35px; overflow: visible; }
    </style>
</head>"""

if "/* Fix Acordeon y Carrito */" not in updated_content:
    updated_content = updated_content.replace('</head>', style_fix)

# Guardar cambios
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print(f"✅ ¡Éxito! El archivo {file_path} ha sido inyectado y limpiado automáticamente.")
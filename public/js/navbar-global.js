/**
 * Navbar global: misma lógica que index.html (mega menú, búsqueda, carrito).
 * Generado a partir del bloque en index.html; mantener sincronizado si cambia.
 */
document.addEventListener('DOMContentLoaded', () => {
        let inventario = [];
        let currentFocus = -1;

        // --- REFERENCIAS A ELEMENTOS ---
        const productosBtn = document.getElementById('productosBtn');
        const productosMenu = document.getElementById('productosMenu');
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        const searchContainer = document.getElementById('searchContainer');
        const navLinks = document.getElementById('navLinks');
        const searchResults = document.getElementById('searchResults');
        const filterBtn = document.getElementById('filterBtn');
        const filterPanel = document.getElementById('filterPanel');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        const cartBadge = document.getElementById('cartBadge');

        // NUEVOS ELEMENTOS CARRITO
        const cartBtn = document.getElementById('cartBtn');
        const cartDropdown = document.getElementById('cartDropdown');
        const closeCartBtn = document.getElementById('closeCartBtn');
        const cartItemsContainer = document.getElementById('cartItemsContainer');
        const toastMsg = document.getElementById('toastMsg');
        const saveCartBtn = document.getElementById('saveCartBtn');

        // --- SISTEMA DE CARRITO AVANZADO ---
// --- SISTEMA DE NOTIFICACIONES (Canasta y Usuario) ---
        function updateCartBadge() {
            const cart = JSON.parse(localStorage.getItem('geekwave_cart')) || [];
            const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

            const badgeC = document.getElementById('cartBadge');
            const badgeU = document.getElementById('userBadge');
            const tooltipU = document.getElementById('userTooltip');
            const isLoggedIn = localStorage.getItem('geekwave_logged_in') === 'true';

            if (totalItems > 0) {
                // Actualizar número en la canasta de forma segura
                if (badgeC) {
                    badgeC.textContent = totalItems;
                    badgeC.classList.add('show');
                }

                // Actualizar estado del usuario
                if(badgeU) {
                    if (isLoggedIn) {
                        // Aplasta las clases anteriores y pone la correcta
                        badgeU.className = 'user-badge show green';
                        if(tooltipU) tooltipU.classList.remove('active');
                    } else {
                        badgeU.className = 'user-badge show red';
                        if(tooltipU) tooltipU.classList.add('active');
                    }
                }
            } else {
                // Si está vacío, limpiamos todo
                if(badgeC) badgeC.classList.remove('show');
                if(badgeU) {
                    badgeU.className = 'user-badge';
                    badgeU.classList.remove('show');
                }
                if(tooltipU) tooltipU.classList.remove('active');
            }
        }

        // Ejecuta al cargar la primera vez
        updateCartBadge();

        // LA MAGIA CONTRA EL CACHÉ DEL NAVEGADOR:
        // Forzamos a que actualice los puntos cada vez que la pestaña se vuelve a mostrar o gana el foco.
        window.addEventListener('pageshow', updateCartBadge);
        window.addEventListener('focus', updateCartBadge);
        function showToast() {
            if (!toastMsg) return;
            toastMsg.classList.add('show');
            setTimeout(() => toastMsg.classList.remove('show'), 2000); // Desaparece a los 2 segundos
        }
window.addToCart = function(id, nombre, qty) {
    // 1. SOPORTE HÍBRIDO: Identifica si recibes un objeto o valores sueltos
    let itemData;
    if (typeof id === 'object') {
        itemData = id; 
    } else {
        itemData = { id: id, nombre: nombre, qty: qty };
    }

    // 2. Obtener carrito actual
    let cart = JSON.parse(localStorage.getItem('geekwave_cart')) || [];
    
    // 3. Lógica de guardado (Idempotencia)
    let existingItem = cart.find(i => String(i.id) === String(itemData.id));
    
    if (existingItem) {
        existingItem.qty = parseInt(existingItem.qty) + parseInt(itemData.qty);
    } else {
        cart.push({
            id: itemData.id,
            nombre: itemData.nombre,
            qty: parseInt(itemData.qty),
            variant: itemData.variant || null,
            image: itemData.image || null
        });
    }
    
    // 4. Guardar en almacenamiento
    localStorage.setItem('geekwave_cart', JSON.stringify(cart));
    
    // 5. SINCRONIZACIÓN INMEDIATA DE LA INTERFAZ
    // Actualizamos el contador del badge (si existe)
    if (typeof updateCartBadge === 'function') updateCartBadge();
    
    // Forzamos el renderizado del dropdown para que el usuario vea el cambio al instante
    // Esto funciona porque renderCart lee el localStorage que acabamos de actualizar
    if (typeof renderCart === 'function') {
        renderCart(); 
    }
    
    // 6. Feedback visual al usuario
    if (typeof showToast === 'function') showToast();
};
 // Cambiar cantidad en el carrito directamente (+ o -)
        window.changeCartQty = function(id, delta) {
            let cart = JSON.parse(localStorage.getItem('geekwave_cart')) || [];
            let item = cart.find(i => parseInt(i.id) === parseInt(id));
            if(item) {
                item.qty += delta;
                if(item.qty < 1) item.qty = 1; // Mínimo 1 producto
            }
            localStorage.setItem('geekwave_cart', JSON.stringify(cart));
            updateCartBadge();
            renderCart(); // Redibuja instantáneamente
        };

        // Eliminar producto y mostrar animación
        window.removeFromCart = function(id) {
            let cart = JSON.parse(localStorage.getItem('geekwave_cart')) || [];
            cart = cart.filter(i => parseInt(i.id) !== parseInt(id)); // Filtrado seguro
            localStorage.setItem('geekwave_cart', JSON.stringify(cart));
            updateCartBadge();
            renderCart(); // Redibuja instantáneamente
            showToast();
        };



        // Redibuja el carrito
   // Redibuja el carrito con lógica de redirección dinámica
        function renderCart() {
            if (!cartItemsContainer) return;
            let cart = JSON.parse(localStorage.getItem('geekwave_cart')) || [];
            const checkoutBtn = document.querySelector('.cart-footer .btn-primary');
            const saveBtn = document.getElementById('saveCartBtn');

            if(cart.length === 0) {
                // 1. UI cuando el carrito está vacío
                cartItemsContainer.innerHTML = `
                    <div style="text-align: center; color: var(--text-muted); padding: 40px 20px; font-size: 0.9rem;">
                        <i data-lucide="shopping-cart" style="width: 40px; height: 40px; margin-bottom: 15px; opacity: 0.2;"></i>
                        <br>Tu carrito está vacío.
                    </div>`;

                // 2. Cambiar botón principal para redirigir a OFERTAS
                if(checkoutBtn) {
                    checkoutBtn.textContent = 'Ir a comprar'; // Copywriting sugerido
                    checkoutBtn.onclick = () => window.location.href = 'ofertas.html';
                    checkoutBtn.classList.remove('btn-disabled');
                }

                // 3. Desactivar y poner en gris el botón "Guardar"
                if(saveBtn) {
                    saveBtn.textContent = 'No, gracias';
                    saveBtn.classList.add('btn-disabled'); // Asegúrate de tener esta clase en tu CSS
                }
            } else {
                // 1. UI con productos agregados
                cartItemsContainer.innerHTML = cart.map(item => {
                    const fullItem = inventario.find(i => parseInt(i.id) === parseInt(item.id));
                    const imgUrl = (fullItem && fullItem.imagen) ? fullItem.imagen : 'https://res.cloudinary.com/dn8pns203/image/upload/v1776342565/smilling_friends_dgrpym.webp';

                    return `
                    <div class="cart-item">
                        <img src="${imgUrl}" alt="${item.nombre}" class="cart-item-img">
                        <div class="cart-item-details">
                            <div class="cart-item-title" title="${item.nombre}">${item.nombre}</div>
                            <div class="cart-item-actions">
                                <div class="qty-control">
                                    <button class="qty-btn minus" onclick="event.preventDefault(); event.stopPropagation(); changeCartQty(${item.id}, -1)">-</button>
                                    <span class="qty-num">${item.qty}</span>
                                    <button class="qty-btn plus" onclick="event.preventDefault(); event.stopPropagation(); changeCartQty(${item.id}, 1)">+</button>
                                </div>
                                <button class="trash-btn" onclick="event.preventDefault(); event.stopPropagation(); removeFromCart(${item.id})" title="Eliminar">
                                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                                </button>
                            </div>
                        </div>
                    </div>`;
                }).join('');

                // 2. Restaurar botón principal para redirigir a PAGAR
                if(checkoutBtn) {
                    checkoutBtn.textContent = 'Ir a pagar';
                    checkoutBtn.onclick = () => window.location.href = 'pago.html';
                    checkoutBtn.classList.remove('btn-disabled');
                }

                // 3. Restaurar botón Guardar
                if(saveBtn) {
                    saveBtn.textContent = 'Guardar';
                    saveBtn.classList.remove('btn-disabled');
                }
            }
            // Recargar iconos de Lucide (basura, carrito vacío, etc.)
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        // --- LÓGICA MENÚS Y PANELES (ABRIR/CERRAR) ---
        if (cartBtn && cartDropdown) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeSearch(); // Cerramos cualquier otra cosa
                if(productosMenu) productosMenu.classList.remove('active');

                cartDropdown.classList.toggle('show');
                if(cartDropdown.classList.contains('show')) renderCart();
            });
        }

        if(closeCartBtn) {
            closeCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                cartDropdown.classList.remove('show');
            });
        }
if(saveCartBtn) {
            saveCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Ocultamos el carrito (los datos ya se están guardando en tiempo real en localStorage)
                cartDropdown.classList.remove('show');
            });
        }
        // --- CARGA DE INVENTARIO ---
        fetch('json/inventario.json')
            .then(response => response.json())
            .then(data => { inventario = data; })
            .catch(error => console.error('Error cargando inventario:', error));

        // --- LÓGICA MEGA MENÚ PRODUCTOS ---
        let currentMenuCol = 0; // 0=Categorías, 1=Subcategorías, 2=Productos
        let currentMenuIdx = [0, 0, 0];

        if(productosBtn) {
            productosBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = productosMenu.classList.contains('active');
                if(!isOpen) {
                    closeSearch();
                    if(cartDropdown) cartDropdown.classList.remove('show');
                    productosMenu.classList.add('active');

                    // Resetear teclado al abrir
                    currentMenuCol = 0;
                    currentMenuIdx = [0, 0, 0];
                    renderCategories();
                } else {
                    productosMenu.classList.remove('active');
                }
            });
        }

        if(productosMenu) {
            productosMenu.addEventListener('click', (e) => { e.stopPropagation(); });
        }

        // Rastrea la posición del mouse para sincronizarlo con el teclado
        window.updateMenuFocus = function(col, idx) {
            currentMenuCol = col;
            currentMenuIdx[col] = idx;
            highlightMenu();
        };

        // Pinta el elemento seleccionado con teclado/mouse
        function highlightMenu() {
            document.querySelectorAll('.menu-list .menu-item').forEach(el => el.classList.remove('highlight'));
            let lists = ['list-categories', 'list-subcategories', 'list-products'];
            let activeList = document.getElementById(lists[currentMenuCol]);
            if(!activeList) return;

            let items = activeList.querySelectorAll('.menu-item');
            if(items.length === 0) return;

            // Evitar que el cursor se salga de los límites
            if(currentMenuIdx[currentMenuCol] >= items.length) currentMenuIdx[currentMenuCol] = items.length - 1;
            if(currentMenuIdx[currentMenuCol] < 0) currentMenuIdx[currentMenuCol] = 0;

            let activeItem = items[currentMenuIdx[currentMenuCol]];
            if(activeItem) {
                activeItem.classList.add('highlight');
                activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }

        function renderCategories() {
            const list = document.getElementById('list-categories');
            list.onwheel = (e) => e.stopPropagation(); // DESBLOQUEA EL SCROLL DEL RATÓN

            const categories = [...new Set(inventario.map(item => item.categoria))];
            list.innerHTML = categories.map((cat, idx) => `
                <li class="menu-item" onclick="selectCategory('${cat}', this)" onmouseenter="updateMenuFocus(0, ${idx})">
                    ${cat} <i data-lucide="chevron-right"></i>
                </li>
            `).join('');
            lucide.createIcons();
            highlightMenu();
        }

        window.selectCategory = function(cat, element) {
            document.querySelectorAll('#list-categories .menu-item').forEach(i => i.classList.remove('selected'));
            if(element) element.classList.add('selected');

            const subList = document.getElementById('list-subcategories');
            subList.onwheel = (e) => e.stopPropagation(); // DESBLOQUEA EL SCROLL DEL RATÓN

            const subCats = [...new Set(inventario.filter(i => i.categoria === cat).map(i => i.subcategoria))];
            subList.innerHTML = subCats.map((sub, idx) => `
                <li class="menu-item" onclick="selectSubCategory('${cat}', '${sub}', this)" onmouseenter="updateMenuFocus(1, ${idx})">
                    ${sub || 'General'} <i data-lucide="chevron-right"></i>
                </li>
            `).join('');

            document.getElementById('col-subcategories').classList.remove('hidden');
            document.getElementById('col-products').classList.add('hidden');
            lucide.createIcons();

            // Pasar cursor a la siguiente columna
            currentMenuCol = 1;
            currentMenuIdx[1] = 0;
            highlightMenu();
        };

        window.selectSubCategory = function(cat, sub, element) {
            document.querySelectorAll('#list-subcategories .menu-item').forEach(i => i.classList.remove('selected'));
            if(element) element.classList.add('selected');

            const prodList = document.getElementById('list-products');
            prodList.onwheel = (e) => e.stopPropagation(); // DESBLOQUEA EL SCROLL DEL RATÓN

            const prods = inventario.filter(i => i.categoria === cat && i.subcategoria === sub);
            prodList.innerHTML = prods.map((p, idx) => `
                <li class="menu-item" style="font-size: 1rem;" onclick="window.location.href='producto.html?id=${p.id}'" onmouseenter="updateMenuFocus(2, ${idx})">
                    <a href="producto.html?id=${p.id}" onclick="event.preventDefault()">${p.nombre}</a>
                </li>
            `).join('');

            document.getElementById('col-products').classList.remove('hidden');

            // Pasar cursor a los productos
            currentMenuCol = 2;
            currentMenuIdx[2] = 0;
            highlightMenu();
        };

        // --- SISTEMA TECLADO MEGA MENÚ ---
        document.addEventListener('keydown', (e) => {
            if(productosMenu && productosMenu.classList.contains('active')) {
                let lists = ['list-categories', 'list-subcategories', 'list-products'];
                let activeList = document.getElementById(lists[currentMenuCol]);
                if(!activeList) return;
                let items = activeList.querySelectorAll('.menu-item');

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    currentMenuIdx[currentMenuCol]++;
                    highlightMenu();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    currentMenuIdx[currentMenuCol]--;
                    highlightMenu();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    // Solo salta a la derecha si la siguiente columna ya se abrió
                    if(currentMenuCol < 2 && !document.getElementById(['col-categories','col-subcategories','col-products'][currentMenuCol+1]).classList.contains('hidden')) {
                        currentMenuCol++;
                        highlightMenu();
                    }
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if(currentMenuCol > 0) {
                        currentMenuCol--;
                        highlightMenu();
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if(items[currentMenuIdx[currentMenuCol]]) {
                        items[currentMenuIdx[currentMenuCol]].click();
                    }
                }
            }
        });

        // --- VARIABLES Y LÓGICA DE FILTRO ---
        const filterCategory = document.getElementById('filterCategory');
        const filterPrice = document.getElementById('filterPrice');
        const filterSort = document.getElementById('filterSort');

        const savedFilters = JSON.parse(localStorage.getItem('geekwave_filters')) || { category: 'Todo', price: 'all', sort: 'relevance' };
        if(filterCategory) filterCategory.value = savedFilters.category;
        if(filterPrice) filterPrice.value = savedFilters.price;
        if(filterSort) filterSort.value = savedFilters.sort;

        if(filterBtn) {
            filterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if(searchResults) searchResults.classList.remove('active');
                filterPanel.classList.toggle('show');
                filterBtn.classList.toggle('active');
            });
        }

        if(filterPanel) { filterPanel.addEventListener('click', (e) => { e.stopPropagation(); }); }

        if(applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                localStorage.setItem('geekwave_filters', JSON.stringify({ category: filterCategory.value, price: filterPrice.value, sort: filterSort.value }));
                filterPanel.classList.remove('show');
                filterBtn.classList.remove('active');
                if(searchInput.value.trim() !== "") { searchInput.dispatchEvent(new Event('input')); } else { showRecentSearches(); }
                if(searchInput) searchInput.focus();
            });
        }

        // --- BÚSQUEDAS RECIENTES ---
        function getRecentSearches() {
            const stored = localStorage.getItem('recentSearches');
            return stored ? JSON.parse(stored) : [];
        }

        function saveRecentSearch(term) {
            if (!term) return;
            let recents = getRecentSearches();
            recents = recents.filter(item => item !== term);
            recents.unshift(term);
            recents = recents.slice(0, 3);
            localStorage.setItem('recentSearches', JSON.stringify(recents));
        }

        function removeRecentSearch(term) {
            let recents = getRecentSearches();
            recents = recents.filter(item => item !== term);
            localStorage.setItem('recentSearches', JSON.stringify(recents));
            showRecentSearches();
        }

        function showRecentSearches() {
            const recents = getRecentSearches();
            if (recents.length === 0) {
                if(searchResults) searchResults.innerHTML = '';
                if(searchResults) searchResults.classList.remove('active');
                return;
            }
            searchResults.innerHTML = '<div class="recent-header">Búsquedas recientes</div>';
            recents.forEach(term => {
                searchResults.insertAdjacentHTML('beforeend', `
                    <div class="recent-item">
                        <span class="recent-link">${term}</span>
                        <span class="remove-recent" data-term="${term}">&times;</span>
                    </div>
                `);
            });
            searchResults.classList.add('active');

         document.querySelectorAll('.recent-link').forEach(link => {
                link.addEventListener('click', () => {
                    const term = link.innerText;

                    // Buscamos si ese término coincide exactamente con un producto
                    const productoEncontrado = inventario.find(item => item.nombre === term);

                    if (productoEncontrado) {
                        // Si existe, nos vamos directo a la página de ese producto
                        window.location.href = `producto.html?id=${productoEncontrado.id}`;
                    } else {
                        // Si por alguna razón no coincide, solo llenamos la barra y buscamos
                        searchInput.value = term;
                        searchInput.dispatchEvent(new Event('input'));
                    }
                });
            });

            document.querySelectorAll('.remove-recent').forEach(x => {
                x.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeRecentSearch(x.getAttribute('data-term'));
                    searchInput.focus();
                });
            });
        }

        // --- EVENTOS DE BÚSQUEDA ---
        if(searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isActive = searchContainer.classList.contains('active');
                if (!isActive) {
                    searchContainer.classList.add('active');
                    if(navLinks) navLinks.classList.add('hidden');
                    if(productosMenu) productosMenu.classList.remove('active');
                    if(cartDropdown) cartDropdown.classList.remove('show'); // Cierra carrito al buscar
                    if(filterPanel) filterPanel.classList.remove('show');
                    if(filterBtn) filterBtn.classList.remove('active');
                    searchInput.value = '';
                    searchInput.focus();
                    showRecentSearches();
                } else if (searchInput.value === '') {
                    closeSearch();
                }
            });
        }

        if(searchInput) {
            searchInput.addEventListener('click', (e) => e.stopPropagation());

            searchInput.addEventListener('focus', () => {
                if(filterPanel && filterPanel.classList.contains('show')) {
                    filterPanel.classList.remove('show');
                    filterBtn.classList.remove('active');
                    if(searchInput.value === '') showRecentSearches();
                }
            });

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                searchResults.innerHTML = '';
                currentFocus = -1;

                if (query.length === 0) { showRecentSearches(); return; }

                searchResults.classList.add('active');

                let matches = inventario.filter(item => {
                    const textToSearch = (item.nombre + " " + item.descripcion_tecnica + " " + (item.subcategoria || "")).toLowerCase();
                    return textToSearch.includes(query);
                });

                if (filterCategory && filterCategory.value !== 'Todo') matches = matches.filter(item => item.categoria && item.categoria.includes(filterCategory.value));
                if (filterPrice) {
                    if (filterPrice.value === 'under50') matches = matches.filter(item => item.precio_usd < 50);
                    else if (filterPrice.value === '50to150') matches = matches.filter(item => item.precio_usd >= 50 && item.precio_usd <= 150);
                    else if (filterPrice.value === 'over150') matches = matches.filter(item => item.precio_usd > 150);
                }

                if (filterSort) {
                    if (filterSort.value === 'az') matches.sort((a, b) => a.nombre.localeCompare(b.nombre));
                    else if (filterSort.value === 'priceAsc') matches.sort((a, b) => a.precio_usd - b.precio_usd);
                    else if (filterSort.value === 'priceDesc') matches.sort((a, b) => b.precio_usd - a.precio_usd);
                    else if (filterSort.value === 'newest') matches.sort((a, b) => (b.año || 0) - (a.año || 0));
                    else {
                        matches.sort((a, b) => {
                            let indexA = a.nombre.toLowerCase().indexOf(query);
                            let indexB = b.nombre.toLowerCase().indexOf(query);
                            if (indexA === -1) indexA = 999;
                            if (indexB === -1) indexB = 999;
                            return indexA - indexB;
                        });
                    }
                }

                if (matches.length > 0) {
                    matches.slice(0, 6).forEach(item => {
                        const imgUrl = item.imagen || 'https://res.cloudinary.com/dn8pns203/image/upload/v1776342565/smilling_friends_dgrpym.webp';
                        const resultHtml = `
                            <a href="producto.html?id=${item.id}" class="result-item" data-name="${item.nombre}">
                                <img src="${imgUrl}" alt="${item.nombre}" class="result-img">
                                <div class="result-info">
                                    <span class="result-title">${item.nombre} <span style="color: #00ff7f; font-size: 0.85em; margin-left: 8px;">$${item.precio_usd.toFixed(2)}</span></span>
                                    <span class="result-desc">${item.descripcion_tecnica}</span>
                                </div>
                                <div class="result-actions">
                                    <div class="qty-control" onclick="event.preventDefault(); event.stopPropagation();">
                                        <button class="qty-btn minus" onclick="let el=this.nextElementSibling; el.textContent = Math.max(1, parseInt(el.textContent) - 1); document.getElementById('searchInput').focus();">-</button>
                                        <span class="qty-num">1</span>
                                        <button class="qty-btn plus" onclick="let el=this.previousElementSibling; el.textContent = parseInt(el.textContent) + 1; document.getElementById('searchInput').focus();">+</button>
                                    </div>
                                    <button class="add-cart-btn" title="Agregar al carrito" onclick="event.preventDefault(); event.stopPropagation(); window.addToCart(${item.id}, '${item.nombre.replace(/'/g, "\\'")}', this.previousElementSibling.querySelector('.qty-num').textContent);">
                                        <i data-lucide="shopping-cart"></i>
                                    </button>
                                </div>
                            </a>
                        `;
                        searchResults.insertAdjacentHTML('beforeend', resultHtml);
                    });
                    lucide.createIcons();
                    document.querySelectorAll('.result-item').forEach(item => {
                        item.addEventListener('click', () => saveRecentSearch(item.getAttribute('data-name')));
                    });
                } else {
                    searchResults.innerHTML = '<div class="no-results">No se encontraron productos. Verifica tus filtros.</div>';
                }
            });

            searchInput.addEventListener('keydown', (e) => {
                let items = searchResults.querySelectorAll('.result-item, .recent-item');
                if (items.length === 0) return;
                if (e.key === 'ArrowDown') { e.preventDefault(); currentFocus++; addActive(items); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); currentFocus--; addActive(items); }
                else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (currentFocus > -1 && items[currentFocus]) {
                        if(items[currentFocus].classList.contains('result-item')){
                            saveRecentSearch(items[currentFocus].getAttribute('data-name'));
                            items[currentFocus].click();
                        } else if(items[currentFocus].classList.contains('recent-item')){
                            items[currentFocus].querySelector('.recent-link').click();
                        }
                    }
                }
            });
        }

        function addActive(items) {
            if (!items || items.length === 0) return;
            removeActive(items);
            if (currentFocus >= items.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = items.length - 1;
            items[currentFocus].classList.add('highlight');
            items[currentFocus].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }

        function removeActive(items) { items.forEach(item => item.classList.remove('highlight')); }

        // --- EL DETECTOR DEFINITIVO ---
        document.addEventListener('click', (e) => {
            // Cierra búsqueda
            if (searchContainer && !searchContainer.contains(e.target)) closeSearch();
            // Cierra Mega Menú
            if (productosMenu && productosBtn && !productosBtn.contains(e.target) && !productosMenu.contains(e.target)) productosMenu.classList.remove('active');
            // Cierra Carrito Modal
            if (cartDropdown && cartBtn && !cartBtn.contains(e.target) && !cartDropdown.contains(e.target)) cartDropdown.classList.remove('show');
        });

        function closeSearch() {
            if(searchContainer) searchContainer.classList.remove('active');
            if(searchResults) searchResults.classList.remove('active');
            if(navLinks) navLinks.classList.remove('hidden');
            if(filterPanel) filterPanel.classList.remove('show');
            if(filterBtn) filterBtn.classList.remove('active');
            if(searchInput) searchInput.value = '';
            currentFocus = -1;
        }

        const scrollTopBtnNav = document.getElementById('scrollTopBtn');
        if (scrollTopBtnNav) {
            scrollTopBtnNav.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

    });

// =========================
// NAVBAR GLOBAL (SEGURO)
// =========================

document.addEventListener("DOMContentLoaded", () => {

    // 🔍 BUSCADOR
    const searchInput = document.querySelector("#search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            console.log("Buscando:", e.target.value);
            // aquí puedes luego conectar tu lógica real
        });
    }

    // 🛒 MENÚ PRODUCTOS
    const menuProductos = document.querySelector(".menu-productos");
    if (menuProductos) {
        menuProductos.addEventListener("click", () => {
            console.log("Abrir menú productos");
        });
    }

    // 👤 TOOLTIP USUARIO
    const userIcon = document.querySelector(".user-icon");
    const userMenu = document.querySelector(".user-menu");

    if (userIcon && userMenu) {
        userIcon.addEventListener("mouseenter", () => {
            userMenu.style.display = "block";
        });

        userIcon.addEventListener("mouseleave", () => {
            userMenu.style.display = "none";
        });
    }

    // 🚧 LINKS NO IMPLEMENTADOS
    const links = document.querySelectorAll("a");

    links.forEach(link => {
        if (link.getAttribute("href") === "#") {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                alert("Estamos trabajando en esta sección 🚧");
            });
        }
    });

});


document.addEventListener('DOMContentLoaded', () => {
    const tracks = document.querySelectorAll('.slider-track');
    tracks.forEach(track => {
        const initialCards = Array.from(track.children);
        initialCards.forEach(card => {
            const clone = card.cloneNode(true);
            track.appendChild(clone);
        });

        const wrapper = track.parentElement;
        wrapper.addEventListener('scroll', () => {
            if (wrapper.scrollLeft >= track.scrollWidth / 2) {
                wrapper.scrollLeft = 1;
            } else if (wrapper.scrollLeft <= 0) {
                wrapper.scrollLeft = track.scrollWidth / 2 - 1;
            }
        });
    });
});

// =========================
// GEEKWAVE GLOBAL LOGIC
// =========================

document.addEventListener("DOMContentLoaded", () => {

    console.log("✅ JS GLOBAL ACTIVO");

    // BUSCADOR
    const searchInput = document.querySelector("#search");
    if (searchInput) {
        searchInput.addEventListener("input", async (e) => {
            const valor = e.target.value.toLowerCase();

            try {
                const res = await fetch('json/inventario.json');
                const data = await res.json();

                const resultados = data.filter(p =>
                    p.nombre.toLowerCase().includes(valor)
                );

                console.log("Resultados:", resultados);
            } catch (error) {
                console.error("Error inventario:", error);
            }
        });
    }

    // MENU PRODUCTOS
    const menuBtn = document.querySelector(".menu-productos");
    const menu = document.querySelector(".dropdown-productos");

    if (menuBtn && menu) {
        menuBtn.addEventListener("click", () => {
            menu.classList.toggle("active");
        });
    }

    // USER PANEL
    const user = document.querySelector(".user-icon");
    const panel = document.querySelector(".user-panel");

    if (user && panel) {
        user.addEventListener("mouseenter", () => {
            panel.style.display = "block";
        });

        user.addEventListener("mouseleave", () => {
            panel.style.display = "none";
        });
    }

    // LINKS EN CONSTRUCCIÓN
    document.querySelectorAll("a").forEach(link => {
        const href = link.getAttribute("href");

        if (href === "#" or href === "") {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                alert("Estamos trabajando en esta sección 🚧");
            });
        }
    });

});


// ===============================
// INVENTARIO GLOBAL GEEKWAVE
// ===============================

window.INVENTARIO = [];

async function cargarInventario() {
    try {
        const res = await fetch('json/inventario.json');
        INVENTARIO = await res.json();
        console.log("✅ Inventario cargado", INVENTARIO);
    } catch (error) {
        console.error("❌ Error cargando inventario:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {

    await cargarInventario();

    // =====================
    // BUSCADOR GLOBAL
    // =====================
    const searchInput = document.querySelector("#search");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const valor = e.target.value.toLowerCase();

            const resultados = INVENTARIO.filter(p =>
                p.nombre.toLowerCase().includes(valor)
            );

            console.log("🔎 Resultados:", resultados);
        });
    }

    // =====================
    // MENU PRODUCTOS
    // =====================
    const menuBtn = document.querySelector(".menu-productos");

    if (menuBtn) {
        menuBtn.addEventListener("click", () => {

            if (INVENTARIO.length === 0) {
                console.warn("Inventario no cargado aún");
                return;
            }

            console.log("🛍 Catálogo:", INVENTARIO);
        });
    }

});


// FIX VISUAL (evita flash)
window.addEventListener("load", () => {
    document.body.style.visibility = "visible";
});

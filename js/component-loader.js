document.addEventListener('DOMContentLoaded', async () => {
    // Función para cargar componentes
    async function cargarComponente(id, url) {
        try {
            const res = await fetch(url);
            const html = await res.text();
            document.getElementById(id).innerHTML = html;
            // IMPORTANTE: Reiniciar Lucide para que los iconos se carguen en el nuevo HTML
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } catch (err) {
            console.error(`Error cargando ${url}:`, err);
        }
    }

    // Insertar placeholders en tus HTML
    // (Asegúrate de que este ID exista en tus páginas)
    await cargarComponente('nav-placeholder', 'components/navbar.html');
    await cargarComponente('footer-placeholder', 'components/footer.html');
});

// js/component-loader.js
async function cargarComponentes() {
    console.log("Intentando cargar componentes..."); // <--- ESTO DEBE APARECER EN F12 (Console)
    
    const navRes = await fetch('components/navbar.html');
    if (!navRes.ok) console.error("No se pudo cargar el navbar");
    document.getElementById('nav-placeholder').innerHTML = await navRes.text();
    
    const footRes = await fetch('components/footer.html');
    document.getElementById('footer-placeholder').innerHTML = await footRes.text();

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

cargarComponentes();
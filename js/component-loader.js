
async function cargarComponentes() {
    console.log("Iniciando carga dinámica...");
    
    // Inyectar Nav y Footer
    const [navRes, footRes] = await Promise.all([
        fetch('components/navbar.html'),
        fetch('components/footer.html')
    ]);
    
    if(navRes.ok) document.getElementById('nav-placeholder').innerHTML = await navRes.text();
    if(footRes.ok) document.getElementById('footer-placeholder').innerHTML = await footRes.text();

    // Avisar a navbar-global.js que ya puede trabajar
    document.dispatchEvent(new CustomEvent('navbarLoaded'));
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

cargarComponentes();

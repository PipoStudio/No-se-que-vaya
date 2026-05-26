import os
import re # ¡Esta es la línea que faltaba!

# 1. Crear el cargador inteligente (js/component-loader.js)
loader_js = """
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
"""

if not os.path.exists('js'): os.makedirs('js')
with open('js/component-loader.js', 'w', encoding='utf-8') as f:
    f.write(loader_js)

# 2. Modificar archivos HTML
archivos_html = ["index.html", "pago.html", "contacto.html", "login.html", "info.html", "ofertas.html", "productos.html", "soporte.html"]

for arch in archivos_html:
    if os.path.exists(arch):
        with open(arch, 'r', encoding='utf-8') as f:
            c = f.read()
        
        # Reemplazar nav y footer
        c = re.sub(r'<nav.*?>.*?</nav>', '<div id="nav-placeholder"></div>', c, flags=re.DOTALL)
        c = re.sub(r'<footer.*?>.*?</footer>', '<div id="footer-placeholder"></div>', c, flags=re.DOTALL)
        
        # Asegurar el orden de scripts antes de </body>
        script_tag = '    <script src="js/component-loader.js"></script>'
        if script_tag not in c:
            c = c.replace('</body>', f'{script_tag}\n</body>')
        
        with open(arch, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"✅ Configurado: {arch}")
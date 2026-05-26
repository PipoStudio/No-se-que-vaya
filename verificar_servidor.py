import os

def verificar():
    components = ['components/navbar.html', 'components/footer.html', 'js/component-loader.js']
    print("--- Verificación de existencia de archivos ---")
    for comp in components:
        if os.path.exists(comp):
            print(f"✅ Encontrado: {comp}")
        else:
            print(f"❌ NO ENCONTRADO: {comp} (Crea este archivo urgentemente)")

    # Verificar que el index.html tenga los IDs correctos
    if os.path.exists('index.html'):
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
            if 'id="nav-placeholder"' in content and 'id="footer-placeholder"' in content:
                print("✅ IDs encontrados en index.html")
            else:
                print("❌ Faltan los <div id='nav-placeholder'> o 'footer-placeholder' en index.html")

verificar()
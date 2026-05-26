import os
import re

# Buscar todos los archivos HTML en la carpeta actual y subcarpetas
for root, dirs, files in os.walk("."):
    # Ignorar carpetas de dependencias o de git
    if ".git" in root or "node_modules" in root:
        continue
        
    for file in files:
        if file.endswith(".html"):
            file_path = os.path.join(root, file)
            
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # 1. Quitar la barra inicial de rutas /public/js/ o /js/
            # Cambia "/public/js/..." o "/js/..." por "js/..."
            new_content = re.sub(r'src=["\']/(?:public/)?js/', 'src="js/', content)
            new_content = re.sub(r'href=["\']/(?:public/)?css/', 'href="css/', new_content)
            
            # 2. Corregir si quedaba alguna ruta directa a /public/
            new_content = new_content.replace('src="/public/', 'src="')
            new_content = new_content.replace('href="/public/', 'href="')

            if content != new_content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"✅ Rutas corregidas en: {file_path}")

print("¡Limpieza de rutas HTML completada!")
import os
import json

def mapear_proyecto(ruta_raiz):
    estructura = {}
    
    for raiz, directorios, archivos in os.walk(ruta_raiz):
        # Ignoramos la carpeta .git y node_modules para que el JSON sea manejable
        if '.git' in directorios:
            directorios.remove('.git')
        if 'node_modules' in directorios:
            directorios.remove('node_modules')
            
        ruta_relativa = os.path.relpath(raiz, ruta_raiz)
        if ruta_relativa == '.':
            estructura['raiz'] = archivos
        else:
            # Creamos una estructura de diccionario para representar las carpetas
            partes = ruta_relativa.split(os.sep)
            cursor = estructura
            for parte in partes:
                if parte not in cursor:
                    cursor[parte] = {'archivos': [], 'subcarpetas': {}}
                cursor = cursor[parte]['subcarpetas']
            
            # Guardamos los archivos en el nivel correspondiente
            cursor_archivos = estructura
            for parte in partes:
                cursor_archivos = cursor_archivos[parte]['subcarpetas']
            
            # Buscamos el nodo final para añadir archivos
            nodo = estructura
            for parte in partes:
                nodo = nodo[parte]['subcarpetas']
            
            # Actualizamos el nodo actual
            ruta_actual = estructura
            for parte in partes:
                ruta_actual = ruta_actual[parte]['subcarpetas']
            
            # Esta lógica es simple para representar el árbol en JSON
            continue

    # Método simplificado para un JSON de archivos
    resultado = []
    for raiz, _, archivos in os.walk(ruta_raiz):
        if '.git' in raiz or 'node_modules' in raiz:
            continue
        for archivo in archivos:
            resultado.append(os.path.join(raiz, archivo))
            
    return resultado

# Ejecución
directorio = "."
lista_archivos = mapear_proyecto(directorio)

with open('estructura_proyecto.json', 'w', encoding='utf-8') as f:
    json.dump(lista_archivos, f, indent=4)

print("¡Listo! Se ha creado 'estructura_proyecto.json'. Pégalo aquí.")
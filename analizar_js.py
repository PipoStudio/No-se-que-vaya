import os
import json
import re

def analizar_archivo(ruta):
    if not os.path.exists(ruta):
        return {"error": "Archivo no encontrado"}
    
    with open(ruta, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Buscamos funciones clave del carrito
    funciones = ["addToCart", "changeCartQty", "removeFromCart", "renderCheckoutCart", "saveCart"]
    estructura = {}
    
    for func in funciones:
        # Regex simple para detectar si la función existe y capturar su contenido
        patron = rf"function\s+{func}\s*\([^)]*\)\s*{{([\s\S]*?)}}"
        match = re.search(patron, contenido)
        if match:
            estructura[func] = "encontrada"
        else:
            estructura[func] = "no encontrada"
            
    return estructura

# Analizar los archivos
resultados = {
    "pago.js": analizar_archivo("js/pago.js"),
    "navbar-global.js": analizar_archivo("js/navbar-global.js")
}

# Guardar en JSON
with open('estructura_carrito.json', 'w') as f:
    json.dump(resultados, f, indent=4)

print("✅ Análisis completado. Se ha generado 'estructura_carrito.json'.")
print("Por favor, copia y pega aquí el contenido de 'estructura_carrito.json'.")
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 1. Cargamos el inventario en la función
const inventario = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/inventario.json'), 'utf-8'));

exports.handler = async (event) => {
    // ... (Mantén tus headers y lógica de OPTIONS igual)

    try {
        const { email, items } = JSON.parse(event.body || "{}"); // Recibimos el carrito

        if (!email || !items || !Array.isArray(items)) {
            throw new Error("Datos inválidos");
        }

        // 2. Cálculo matemático SEGURO en el servidor
        let subtotal = 0;
        items.forEach(item => {
            const producto = inventario.find(p => p.id === item.id);
            if (producto) {
                subtotal += (producto.precio_usd * item.qty);
            }
        });

        // 3. Aplicar lógica de costos y margen fijo
        const tasaFija = 0.50; // Ejemplo: $0.50 por gestión
        const margenMinimo = 5.00; // Margen de ganancia obligatorio
        const finalAmount = subtotal + tasaFija + margenMinimo;

        // ... (Ahora procedes con la lógica de OAUTH y llamada a Wompi usando 'finalAmount')
        // ...
    } catch (error) {
        // ... (Manejo de errores)
    }
};

console.log("[Geekwave] Lógica de Carrito Conectada");
function syncGeekwaveCart() {
    const cart = JSON.parse(localStorage.getItem('geekwave_cart')) || [];
    const saveBtn = document.getElementById('saveCartBtn');
    const itemsContainer = document.getElementById('cartItemsContainer');
    const checkoutBtn = document.querySelector('.cart-footer .btn-primary');

    if (cart.length === 0) {
        // Estado vacío: invitar a comprar y desactivar guardar
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'No, gracias';
            saveBtn.classList.add('btn-disabled');
        }
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Ir a comprar';
            checkoutBtn.onclick = () => { window.location.href = 'ofertas.html'; };
        }
        if (itemsContainer) {
            itemsContainer.innerHTML = `
                <div style="text-align:center; padding:50px; font-family:sans-serif;">
                    <p style="color:#555; margin-bottom:15px;">Tu carrito está vacío</p>
                    <a href="ofertas.html" style="color:#00ff7f; font-weight:bold; text-decoration:none; border:1px solid #00ff7f; padding:8px 15px; border-radius:5px;">IR A COMPRAR</a>
                </div>`;
        }
    } else {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar';
            saveBtn.classList.remove('btn-disabled');
        }
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Ir a pagar';
            checkoutBtn.onclick = () => { window.location.href = 'pago.html'; };
        }
    }
}

document.addEventListener('DOMContentLoaded', syncGeekwaveCart);
window.addEventListener('storage', syncGeekwaveCart);


// js/geekwave-main.js

async function registrarPartidaDiaria() {
    // 1. Obtenemos el usuario actual de Supabase
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        alert("¡Inicia sesión para ganar puntos de racha!");
        return;
    }

    // 2. Llamamos a la función SQL que creamos antes
    const { data, error } = await supabase.rpc('registrar_partida_y_actualizar_racha', {
        user_id_param: user.id
    });

    if (error) {
        console.error("Error al registrar racha:", error);
        return;
    }

    // 3. Si la función nos devuelve un tipo de premio, disparar el correo
    const tipoPremio = data[0].enviar_correo_tipo;
    if (tipoPremio !== 'NINGUNO') {
        notificarAEmail(user.email, tipoPremio);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const btnPagarWompi = document.getElementById('btn-pagar-wompi'); // Revisa que este ID sea el de tu botón
    
    if (btnPagarWompi) {
        btnPagarWompi.addEventListener('click', (e) => {
            // Verificamos el estado de sesión usando la misma memoria global
            const isLoggedIn = localStorage.getItem('sb-kuvrszdgljonaxihmkzj-auth-token') !== null;
            
            if (!isLoggedIn) {
                e.preventDefault(); // Detenemos la pasarela de pagos
                
                // Le explicamos al usuario por qué lo vamos a redirigir
                alert("Debes iniciar sesión o crear una cuenta rápida para darle seguimiento a tu envío.");
                
                // Guardamos la URL actual de pago en la memoria
                localStorage.setItem('geekwave_redirect_url', window.location.href);
                
                // Lo mandamos al login para que el punto rojo pase a verde
                window.location.href = 'login.html';
            }
            // Si isLoggedIn es true, no hacemos nada y dejamos que Wompi abra su ventana normal.
        });
    }
});
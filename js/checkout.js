document.addEventListener("DOMContentLoaded", () => {
    const mainBtn = document.getElementById('mainActionBtn');
    const overlay = document.getElementById('transition-overlay');

    // Función de redirección centralizada
    const ejecutarSalida = () => {
        // 1. Mensaje de éxito visual en el botón
        mainBtn.innerText = "DATA SENT SUCCESSFULLY";
        mainBtn.style.background = "#00ff7f";
        mainBtn.style.color = "#000";

        // 2. Activar la transición estilo Apple[cite: 1, 3]
        setTimeout(() => {
            if (overlay) {
                overlay.classList.add('active');
                console.log("Overlay activado con éxito");
            }

            // 3. Redirección forzada después de la animación
            setTimeout(() => {
                console.log("Redirigiendo...");
                window.location.href = "https://geekwaveshsop.netlify.app/";
            }, 4500);

        }, 800);
    };

    // Evento de clic
    mainBtn.onclick = (e) => {
        e.preventDefault();
        
        // Verifica si el botón está listo (clase 'ready')[cite: 1]
        if (mainBtn.classList.contains('ready')) {
            ejecutarSalida();
        } else {
            // Efecto de error si no está listo
            mainBtn.style.animation = "shake 0.5s";
            setTimeout(() => mainBtn.style.animation = "", 500);
            console.log("Faltan campos por llenar");
        }
    };
});
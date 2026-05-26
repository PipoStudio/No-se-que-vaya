import os

# Configuración de rutas
navbar_file = "js/navbar-global.js"
game_file = "Game/keepYourSheep/src/scenes/Game.js"

# 1. Modificar Navbar
if os.path.exists(navbar_file):
    with open(navbar_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    new_nav = '<li><a href="/Game/keepYourSheep/index.html">Geekzone</a></li>'
    if "Geekzone" not in content:
        content = content.replace("</ul>", f"{new_nav}</ul>")
        with open(navbar_file, "w", encoding="utf-8") as f:
            f.write(content)
        print("Navbar actualizado con Geekzone.")

# 2. Modificar Game.js
if os.path.exists(game_file):
    with open(game_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "async registrarRachaDeUsuario" not in content:
        injection = """
  async registrarRachaDeUsuario() {
    try {
      if (window.supabase) {
        const { data: { user } } = await window.supabase.auth.getUser();
        if (user) {
          const { data } = await window.supabase.rpc('registrar_partida_y_actualizar_racha', { user_id_param: user.id });
          if (data && data[0] && data[0].enviar_correo_tipo !== 'NINGUNO') {
            await fetch('https://kuvrszdgljonaxihmkzj.supabase.co/functions/v1/enviar-correo-racha', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email, tipoRacha: data[0].enviar_correo_tipo })
            });
          }
        }
      }
    } catch (err) { console.error("Error al registrar racha:", err); }
  }
"""
        # Inyectamos antes de la última llave de la clase
        content = content.rsplit('}', 1)[0] + injection + "\n}"
        with open(game_file, "w", encoding="utf-8") as f:
            f.write(content)
        print("Game.js actualizado con lógica de Supabase.")

print("Modificaciones aplicadas correctamente.")
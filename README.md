# 🏧 Simulador de Cajero Automático
 
Proyecto desarrollado para el curso de **JavaScript** en [CoderHouse](https://www.coderhouse.com/).
 
> ⚠️ **Proyecto en proceso** — se irán agregando funcionalidades a medida que avance el curso.
 
---
 
## 📋 Descripción
 
Simulador de cajero automático que permite a múltiples usuarios autenticarse con su DNI y contraseña para realizar operaciones bancarias básicas como consultar saldo, retirar dinero, ingresar dinero y realizar transferencias entre usuarios. Los datos de usuarios y transacciones se persisten en `localStorage` y se inicializan desde archivos JSON.
 
---
 
## ✨ Funcionalidades
 
- 🔐 **Inicio de sesión** con DNI y contraseña
- 💰 **Consulta de saldo**
- 💸 **Retiro de dinero**
- 💵 **Ingreso de dinero**
- 🔄 **Transferencias** entre usuarios registrados
- 📋 **Historial de transacciones** con fecha, tipo, monto y usuario destino
- 🔔 **Alertas visuales** con SweetAlert2
- 🔙 Navegación entre pantallas con botón "Volver"
 
---
 
## 👥 Usuarios de prueba
 
| DNI      | Contraseña |
|----------|------------|
| 12345678 | 1234       |
| 87654321 | 1234       |
| 11223344 | 1234       |
| 44332211 | 1234       |
| 55667788 | 1234       |
 
---
 
## 🛠️ Tecnologías utilizadas
 
- **HTML5**
- **CSS3**
- **JavaScript** (Vanilla JS)
- **SweetAlert2** — alertas y notificaciones visuales
- **localStorage** — persistencia de datos en el navegador
- **Fetch API** — carga inicial de datos desde archivos JSON
 
---
 
## 📁 Estructura del proyecto
 
```
Proyecto-CoderHouse-Javascript-1/
│
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── data/
    ├── usuarios.json
    └── transacciones.json
```
 
---
 
## 🚀 Cómo usar
 
1. Cloná el repositorio:
   ```bash
   git clone https://github.com/agusbrave52/Proyecto-CoderHouse-Javascript-1.git
   ```
2. Abrí el archivo `index.html` en tu navegador (se recomienda usar un servidor local como Live Server para que el `fetch` funcione correctamente).
3. Hacé clic en **"Entrar al Cajero"**.
4. Ingresá un DNI y contraseña de la tabla de usuarios de prueba.
5. ¡Listo! Ya podés usar el cajero.
 
> Para reiniciar la sesión, recargá la página.
 
---
 
## 📌 Estado del proyecto
 
🟡 **En desarrollo** — Proyecto académico en curso.
 
---
 
## 👤 Autor
 
**Agustín Brave**
- GitHub: [@agusbrave52](https://github.com/agusbrave52)

/* constructor de usuario */
function Usuario(dni, nombre, apellido, contraseña, dinero, blocked = false) {
    this.dni = dni
    this.nombre = nombre
    this.apellido = apellido
    this.contraseña = contraseña
    this.dinero = dinero
    this.blocked = blocked
}

let usuarios = [];

if (!localStorage.getItem("usuarios")) {
    // crear usuarios de ejemplo
    const usuario1 = new Usuario("12345678", "Juan", "Perez", "1234", 1000)
    const usuario2 = new Usuario("87654321", "Maria", "Gomez", "1234", 500)
    const usuario3 = new Usuario("11223344", "Carlos", "Lopez", "1234", 2000)
    const usuario4 = new Usuario("44332211", "Ana", "Martinez", "1234", 1500)
    const usuario5 = new Usuario("55667788", "Luis", "Garcia", "1234", 3000)

    usuarios = [usuario1, usuario2, usuario3, usuario4, usuario5];
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

usuarios = traerUsuarios();
let intentos = 0;
/* establezco el usuario anterior para contabilizar bien los intentos de inicio de sesion */
let dniUsuarioAnterior = null;




/* eventos de los botones */
document.querySelector(".btn-entrar").addEventListener("click", function () {
    AparecerDatosIngreso()
});
document.querySelector(".btn-volver").onclick = function () {
    AparecerInicio()
};

/* funcionalidad para iniciar sesión */
document.querySelector(".btn-login").addEventListener("click", function () {
    const dniInput = document.querySelector("#dni");
    const passwordInput = document.querySelector("#password");
    const txtInfo = document.querySelector(".txtInfo");
    /* compruebo que el usuario haya cambiado para volver los intentos a 0 */
    if (dniInput.value !== dniUsuarioAnterior) {
        intentos = 0;
    }
    dniUsuarioAnterior = dniInput.value; // actualizo el usuario anterior con el dni ingresado
    let usuarioActual = usuarios.find(usuario => usuario.dni === dniInput.value); // busco el usuario ingresado
    if (usuarioActual) {
        // si el usuario existe, verifico si está bloqueado o no
        if (usuarioActual.blocked) {
            txtInfo.textContent = "Tu cuenta ha sido bloqueada por demasiados intentos fallidos. Por favor, contacta al banco para desbloquearla.";
            throw new Error("Cuenta bloqueada")
        }
        else {
            let contraseñaIngresada = passwordInput.value
            if (contraseñaIngresada === usuarioActual.contraseña) { // si la contraseña es correcta, inicio sesión
                localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual)); // guardo el usuario actual en el localStorage
                txtInfo.textContent = "Inicio de sesión exitoso.";
                AparecerMenuCajero();
            } else if (intentos < 3) { // si la contraseña es incorrecta, incremento el contador de intentos y muestro un mensaje de error
                txtInfo.textContent = "Contraseña incorrecta. Por favor, intenta nuevamente. Intento " + (intentos + 1) + " de 3.";
                intentos++;
                passwordInput.value = "";
                if (intentos >= 3) { // si se han agotado los intentos, bloqueo la cuenta del usuario y muestro un mensaje de error
                    usuarioActual.blocked = true;
                    console.log(usuarios)
                    localStorage.setItem("usuarios", JSON.stringify(usuarios));
                    txtInfo.textContent = "Tu cuenta ha sido bloqueada por demasiados intentos fallidos. Por favor, contacta al banco para desbloquearla.";
                    intentos = 0;
                }
            }
        }
    } else {
        limpiarTextos();
        txtInfo.textContent = "Usuario no encontrado. Por favor, verifica tu DNI e intenta nuevamente.";
    }
});

/* funcionalidad Consultar Saldo */
document.querySelector(".btn-consultar").addEventListener("click", function () {
    let usuarioActual = obtenerUsuarioActual();
    const txtInfo = document.querySelector(".txtInfo");
    txtInfo.textContent = `Tu saldo actual es: $${usuarioActual.dinero}`;
});


/* funcionalidad Retirar Dinero */
document.querySelector(".btn-retirar").addEventListener("click", function () {
    const usuarioActual = obtenerUsuarioActual();
    /* cambio el menu a retirar */
    document.querySelector(".menu-cajero").setAttribute("style", "display: none;")
    document.querySelector(".menu-retirar").setAttribute("style", "display: flex;")
    /* cambio el volver */
    const btn_volver = document.querySelector(".btn-volver");
    btn_volver.textContent = "Volver";
    btn_volver.onclick = function () {
        AparecerMenuCajero();
    };
    document.querySelector(".txtInfo").textContent = `Tu saldo actual es: $${usuarioActual.dinero}.`;
});

document.querySelector(".btn-confirmar-retiro").addEventListener("click", function () {
    let usuarioActual = obtenerUsuarioActual();
    const montoRetirar = Number(document.querySelector("#monto-retirar").value);
    const txtInfo = document.querySelector(".txtInfo");
    if (montoRetirar > usuarioActual.dinero) { // si el monto a retirar es mayor al dinero disponible, muestro un mensaje de error
        txtInfo.textContent = "No tienes suficiente dinero para retirar esa cantidad.";
    } else {
        if (montoRetirar <= 0) { // si el monto a retirar es menor o igual a 0, muestro un mensaje de error
            txtInfo.textContent = "El monto a retirar debe ser mayor a cero.";
            return;
        }
        usuarioActual.dinero -= montoRetirar; // resto el monto a retirar al dinero disponible del usuario actual
        actualizarUsuario(usuarioActual);
        localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual)); // actualizo el usuario actual en el localStorage con el nuevo dinero
        txtInfo.textContent = `Has retirado $${montoRetirar}. Tu saldo actual es: $${usuarioActual.dinero}`;
        document.querySelector("#monto-retirar").value = ""; // limpio el input del monto a retirar
        localStorage.setItem("usuarios", JSON.stringify(usuarios)); // actualizo el localStorage con los nuevos datos de los usuarios
    }
});


/* funcionalidad Ingresar Dinero */
document.querySelector(".btn-ingresar").addEventListener("click", function () {
    const usuarioActual = obtenerUsuarioActual();
    /* cambio el menu a ingresar */
    document.querySelector(".menu-cajero").setAttribute("style", "display: none;")
    document.querySelector(".menu-ingresar").setAttribute("style", "display: flex;")
    /* cambio el volver */
    const btn_volver = document.querySelector(".btn-volver");
    btn_volver.textContent = "Volver";
    btn_volver.onclick = function () {
        AparecerMenuCajero();
    };
    document.querySelector(".txtInfo").textContent = `Tu saldo actual es: $${usuarioActual.dinero}.`;
});

document.querySelector(".btn-confirmar-ingreso").addEventListener("click", function () {
    let usuarioActual = obtenerUsuarioActual();
    const montoIngresar = Number(document.querySelector("#monto-ingresar").value);
    const txtInfo = document.querySelector(".txtInfo");
    if (montoIngresar <= 0) { // si el monto a ingresar es menor o igual a 0, muestro un mensaje de error
        txtInfo.textContent = "El monto a ingresar debe ser mayor a cero.";
        return;
    }
    usuarioActual.dinero += montoIngresar; // sumo el monto a ingresar al dinero disponible del usuario actual
    actualizarUsuario(usuarioActual);
    localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual)); // actualizo el usuario actual en el localStorage con el nuevo dinero
    txtInfo.textContent = `Has ingresado $${montoIngresar}. Tu saldo actual es: $${usuarioActual.dinero}`;
    document.querySelector("#monto-ingresar").value = ""; // limpio el input del monto a ingresar
    localStorage.setItem("usuarios", JSON.stringify(usuarios)); // actualizo el localStorage con los nuevos datos de los usuarios
});

/* funcionalidad Transferir Dinero */
document.querySelector(".btn-transferir").addEventListener("click", function () {
    const usuarioActual = obtenerUsuarioActual();
    /* cambio el menu a transferir */
    document.querySelector(".menu-cajero").setAttribute("style", "display: none;")
    document.querySelector(".menu-transferir").setAttribute("style", "display: flex;")
    /* cambio el volver */
    const btn_volver = document.querySelector(".btn-volver");
    btn_volver.textContent = "Volver";
    btn_volver.onclick = function () {
        AparecerMenuCajero();
    };
    document.querySelector(".txtInfo").textContent = `Tu saldo actual es: $${usuarioActual.dinero}.`;
});

document.querySelector(".btn-confirmar-transferencia").addEventListener("click", function () {
    const usuarioActual = obtenerUsuarioActual();
    const dniDestino = document.querySelector("#dni-destino").value;
    const montoTransferir = Number(document.querySelector("#monto-transferir").value);
    const txtInfo = document.querySelector(".txtInfo");
    const usuarioDestino = usuarios.find(usuario => usuario.dni === dniDestino);
    if (!usuarioDestino) { // si el usuario destino no existe, muestro un mensaje de error
        txtInfo.textContent = "El usuario destino no existe. Por favor, verifica el DNI e intenta nuevamente.";
        return;
    }
    if (montoTransferir > usuarioActual.dinero) { // si el monto a transferir es mayor al dinero disponible, muestro un mensaje de error
        txtInfo.textContent = "No tienes suficiente dinero para transferir esa cantidad.";
        return;
    }
    if (montoTransferir <= 0) { // si el monto a transferir es menor o igual a 0, muestro un mensaje de error
        txtInfo.textContent = "El monto a transferir debe ser mayor a cero.";
        return;
    }
    usuarioActual.dinero -= montoTransferir; // resto el monto a transferir al dinero disponible del usuario actual
    usuarioDestino.dinero += montoTransferir; // sumo el monto a transferir al dinero disponible del usuario destino
    actualizarUsuario(usuarioActual);
    actualizarUsuario(usuarioDestino);
    localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));
    txtInfo.textContent = `Has transferido $${montoTransferir} a ${usuarioDestino.nombre} ${usuarioDestino.apellido}. Tu saldo actual es: $${usuarioActual.dinero}`;
    document.querySelector("#dni-destino").value = ""; // limpio el input del DNI destino
    document.querySelector("#monto-transferir").value = ""; // limpio el input del monto a transferir
    localStorage.setItem("usuarios", JSON.stringify(usuarios)); // actualizo el localStorage con los nuevos datos de los usuarios
});






/* vista en datos de ingreso */
function AparecerDatosIngreso() {
    document.querySelector(".datos-ingreso").setAttribute("style", "display: flex;")
    document.querySelector(".btn-entrar").setAttribute("style", "display: none;")
    const btn_volver = document.querySelector(".btn-volver")
    btn_volver.setAttribute("style", "display: block;")
    btn_volver.textContent = "Volver";
    btn_volver.onclick = function () {
        document.querySelector(".datos-ingreso").setAttribute("style", "display: none;")
        AparecerInicio();
    };
    limpiarTextos()
    if (localStorage.getItem("usuarioActual")) {
        localStorage.removeItem("usuarioActual");
    }
}

/* vista en inicio */
function AparecerInicio() {
    document.querySelector(".datos-ingreso").setAttribute("style", "display: none;")
    document.querySelector(".btn-entrar").setAttribute("style", "display: block;")
    document.querySelector(".btn-volver").setAttribute("style", "display: none;")
    document.querySelector(".menu-cajero").setAttribute("style", "display: none;")
    limpiarTextos()
    if (localStorage.getItem("usuarioActual")) {
        localStorage.removeItem("usuarioActual");
    }
}

/* vista en menu cajero */
function AparecerMenuCajero() {
    document.querySelector(".menu-cajero").setAttribute("style", "display: flex;")
    document.querySelector(".datos-ingreso").setAttribute("style", "display: none;")
    document.querySelector(".btn-entrar").setAttribute("style", "display: none;")
    document.querySelector(".menu-retirar").setAttribute("style", "display: none;")
    document.querySelector(".menu-ingresar").setAttribute("style", "display: none;")
    document.querySelector(".menu-transferir").setAttribute("style", "display: none;")
    const btn_volver = document.querySelector(".btn-volver")
    btn_volver.textContent = "Cerrar Sesión";
    btn_volver.onclick = function () {
        document.querySelector(".menu-cajero").setAttribute("style", "display: none;")
        AparecerDatosIngreso();
    };
    limpiarTextos();
}

function obtenerUsuarioActual() {
    const usuarioGuardado = localStorage.getItem("usuarioActual");

    if (!usuarioGuardado) {
        return null;
    }

    return JSON.parse(usuarioGuardado);
}

function actualizarUsuario(usuarioActualizado) {
    usuarios = usuarios.map(usuario => {
        if (usuario.dni === usuarioActualizado.dni) {
            return usuarioActualizado;
        }

        return usuario;
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

/* traer usuarios */
function traerUsuarios() {
    const usuariosGuardados = JSON.parse(localStorage.getItem("usuarios"));
    console.log(usuariosGuardados)
    return usuariosGuardados;
}

/* limpiar textos */
function limpiarTextos() {
    document.querySelector(".txtInfo").textContent = "";
    document.querySelector("#dni").value = "";
    document.querySelector("#password").value = "";
}
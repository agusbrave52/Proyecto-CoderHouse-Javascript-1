/* constructor de usuario */
function Usuario(dni, nombre, apellido, contraseña, dinero, blocked = false) {
    this.dni = dni
    this.nombre = nombre
    this.apellido = apellido
    this.contraseña = contraseña
    this.dinero = dinero
    this.blocked = blocked
}

if (!localStorage.getItem("transacciones")) {
    traerTransacciones();
}


if (!localStorage.getItem("usuarios")) {
    traerUsuarios();
}

let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
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


let transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];

/* traer transacciones */
async function traerTransacciones() {
    const response = await fetch("./data/transacciones.json").then(response => response.json());
    localStorage.setItem("transacciones", JSON.stringify(response));
}

/* funcionalidad para iniciar sesión */
document.querySelector(".btn-login").addEventListener("click", function () {
    usuarios = JSON.parse(localStorage.getItem("usuarios"));
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
            Swal.fire({
                icon: 'error',
                title: 'Cuenta bloqueada',
                text: 'Tu cuenta ha sido bloqueada por demasiados intentos fallidos. Por favor, contacta al banco para desbloquearla.'
            });
        }
        else {
            let contraseñaIngresada = passwordInput.value
            if (contraseñaIngresada === usuarioActual.contraseña) { // si la contraseña es correcta, inicio sesión
                localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual)); // guardo el usuario actual en el localStorage
                Swal.fire({
                    icon: 'success',
                    title: 'Inicio de sesión exitoso',
                    text: `Bienvenido ${usuarioActual.nombre} ${usuarioActual.apellido}.`
                });
                AparecerMenuCajero();
            } else if (intentos < 3) { // si la contraseña es incorrecta, incremento el contador de intentos y muestro un mensaje de error
                Swal.fire({
                    icon: 'error',
                    title: 'Contraseña incorrecta',
                    text: "Contraseña incorrecta. Por favor, intenta nuevamente. Intento " + (intentos + 1) + " de 3."
                });
                intentos++;
                passwordInput.value = "";
                if (intentos >= 3) { // si se han agotado los intentos, bloqueo la cuenta del usuario y muestro un mensaje de error
                    usuarioActual.blocked = true;
                    localStorage.setItem("usuarios", JSON.stringify(usuarios));
                    Swal.fire({
                        icon: 'error',
                        title: 'Cuenta bloqueada',
                        text: 'Tu cuenta ha sido bloqueada por demasiados intentos fallidos. Por favor, contacta al banco para desbloquearla.'
                    });
                    intentos = 0;
                }
            }
        }
    } else {
        limpiarTextos();
        Swal.fire({
            icon: 'error',
            title: 'Usuario no encontrado',
            text: 'Usuario no encontrado. Por favor, verifica tu DNI e intenta nuevamente.'
        });
    }
});

/* funcionalidad Consultar Saldo */
document.querySelector(".btn-consultar").addEventListener("click", function () {
    let usuarioActual = obtenerUsuarioActual();
    Swal.fire({
        icon: 'info',
        title: 'Saldo Actual',
        text: `Tu saldo actual es: $${usuarioActual.dinero}`
    });
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
    document.querySelector(".txtInfo").textContent = `Ingresa el monto que deseas retirar.`;
});

document.querySelector(".btn-confirmar-retiro").addEventListener("click", function () {
    let usuarioActual = obtenerUsuarioActual();
    const montoRetirar = Number(document.querySelector("#monto-retirar").value);
    if (montoRetirar > usuarioActual.dinero) { // si el monto a retirar es mayor al dinero disponible, muestro un mensaje de error
        Swal.fire({
            icon: 'error',
            title: 'Saldo insuficiente',
            text: 'No tienes suficiente dinero para retirar esa cantidad.'
        });
    } else {
        if (montoRetirar <= 0) { // si el monto a retirar es menor o igual a 0, muestro un mensaje de error
            Swal.fire({
                icon: 'error',
                title: 'Monto inválido',
                text: 'El monto a retirar debe ser mayor a cero.'
            });
            return;
        }
        usuarioActual.dinero -= montoRetirar; // resto el monto a retirar al dinero disponible del usuario actual
        actualizarUsuario(usuarioActual);
        agregarTransaccionHistorial("Retiro", montoRetirar, usuarioActual.dni, usuarioActual.dni);
        localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual)); // actualizo el usuario actual en el localStorage con el nuevo dinero
        Swal.fire({
            icon: 'success',
            title: 'Retiro exitoso',
            text: `Has retirado $${montoRetirar}. Tu saldo actual es: $${usuarioActual.dinero}`
        });
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
    document.querySelector(".txtInfo").textContent = `Ingresa el monto que deseas depositar.`;
});

document.querySelector(".btn-confirmar-ingreso").addEventListener("click", function () {
    let usuarioActual = obtenerUsuarioActual();
    const montoIngresar = Number(document.querySelector("#monto-ingresar").value);
    const txtInfo = document.querySelector(".txtInfo");
    if (montoIngresar <= 0) { // si el monto a ingresar es menor o igual a 0, muestro un mensaje de error
        Swal.fire({
            icon: 'error',
            title: 'Monto inválido',
            text: 'El monto a ingresar debe ser mayor a cero.'
        });
        return;
    }
    usuarioActual.dinero += montoIngresar; // sumo el monto a ingresar al dinero disponible del usuario actual
    actualizarUsuario(usuarioActual);
    agregarTransaccionHistorial("Ingreso", montoIngresar, usuarioActual.dni, usuarioActual.dni);
    localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual)); // actualizo el usuario actual en el localStorage con el nuevo dinero
    Swal.fire({
        icon: 'success',
        title: 'Ingreso exitoso',
        text: `Has ingresado $${montoIngresar}. Tu saldo actual es: $${usuarioActual.dinero}`
    });
    txtInfo.textContent = `Ingresa el monto que deseas depositar.`;
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
    document.querySelector(".txtInfo").textContent = `Ingresa el DNI del usuario al que deseas transferir dinero y el monto a transferir.`;
});

document.querySelector(".btn-confirmar-transferencia").addEventListener("click", function () {
    const usuarioActual = obtenerUsuarioActual();
    const dniDestino = document.querySelector("#dni-destino").value;
    if (dniDestino === usuarioActual.dni) { // si el usuario destino es el mismo que el usuario actual, muestro un mensaje de error
        Swal.fire({
            icon: 'error',
            title: 'Transferencia inválida',
            text: 'No puedes transferir dinero a tu propia cuenta. Por favor, ingresa un DNI diferente.'
        });
        return;
    }
    const montoTransferir = Number(document.querySelector("#monto-transferir").value);
    const txtInfo = document.querySelector(".txtInfo");
    const usuarioDestino = usuarios.find(usuario => usuario.dni === dniDestino);
    if (!usuarioDestino) { // si el usuario destino no existe, muestro un mensaje de error
        Swal.fire({
            icon: 'error',
            title: 'Usuario no encontrado',
            text: 'El usuario destino no existe. Por favor, verifica el DNI e intenta nuevamente.'
        });
        return;
    }
    if (montoTransferir > usuarioActual.dinero) { // si el monto a transferir es mayor al dinero disponible, muestro un mensaje de error
        Swal.fire({
            icon: 'error',
            title: 'Fondos insuficientes',
            text: 'No tienes suficiente dinero para transferir esa cantidad.'
        });
        return;
    }
    if (montoTransferir <= 0) { // si el monto a transferir es menor o igual a 0, muestro un mensaje de error
        Swal.fire({
            icon: 'error',
            title: 'Monto inválido',
            text: 'El monto a transferir debe ser mayor a cero.'
        });
        return;
    }
    usuarioActual.dinero -= montoTransferir; // resto el monto a transferir al dinero disponible del usuario actual
    usuarioDestino.dinero += montoTransferir; // sumo el monto a transferir al dinero disponible del usuario destino
    actualizarUsuario(usuarioActual);
    actualizarUsuario(usuarioDestino);
    agregarTransaccionHistorial("Transferencia", montoTransferir, usuarioActual.dni, usuarioDestino.dni);
    localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));
    Swal.fire({
        icon: 'success',
        title: 'Transferencia exitosa',
        text: `Has transferido $${montoTransferir} a ${usuarioDestino.nombre} ${usuarioDestino.apellido}. Tu saldo actual es: $${usuarioActual.dinero}`
    });
    document.querySelector("#dni-destino").value = ""; // limpio el input del DNI destino
    document.querySelector("#monto-transferir").value = ""; // limpio el input del monto a transferir
    localStorage.setItem("usuarios", JSON.stringify(usuarios)); // actualizo el localStorage con los nuevos datos de los usuarios
});

/* funcionalidad historial */
document.querySelector(".btn-historial").addEventListener("click", function () {
    transacciones = JSON.parse(localStorage.getItem("transacciones"));
    const usuarioActual = obtenerUsuarioActual();
    limpiarTextos();
    /* cambio el menu a historial */
    document.querySelector(".menu-cajero").setAttribute("style", "display: none;")
    document.querySelector(".menu-historial").setAttribute("style", "display: flex;")
    /* cambio el volver */
    const btn_volver = document.querySelector(".btn-volver");
    btn_volver.textContent = "Volver";
    btn_volver.onclick = function () {
        AparecerMenuCajero();
    };
    mostrarHistorial(usuarioActual);
});

function agregarTransaccionHistorial(tipo, monto, usuario, usuarioDestino) {
    const fecha = new Date().toISOString();
    const transaccion = {
        fecha,
        tipo,
        monto,
        usuario,
        usuarioDestino,
    };
    transacciones.push(transaccion);
    localStorage.setItem("transacciones", JSON.stringify(transacciones));

}

/* mostrar historial */
function mostrarHistorial(usuario) {
    const tbody = document.querySelector(".historial tbody");
    tbody.innerHTML = "";
    let transaccionesUsuario = transacciones.filter(transaccion => transaccion.usuario === usuario.dni || transaccion.usuarioDestino === usuario.dni); // filtro las transacciones del usuario actual
    transaccionesUsuario.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // ordeno las transacciones por fecha, de la más reciente a la más antigua
    if (transaccionesUsuario.length > 0) {
        transaccionesUsuario.forEach(transaccion => {
            const tr = document.createElement("tr");
            let esTransferencia = transaccion.usuario !== transaccion.usuarioDestino; // verifico si la transaccion es una transferencia o no
            let usuarioDestino = buscarUsuario(transaccion.usuarioDestino); // busco el usuario destino para mostrar su nombre en el historial
            
            const esEgreso = transaccion.tipo === "Retiro" || (esTransferencia && transaccion.usuario === usuario.dni);
            tr.innerHTML = `
                <td>${new Date(transaccion.fecha).toLocaleString()}</td>
                <td>${transaccion.tipo}</td>
                <td>${esEgreso ? "-" : "+"}${transaccion.monto}</td>
                <td>${usuarioDestino.nombre} ${usuarioDestino.apellido}</td>
            `;

            tbody.appendChild(tr);
        });
    }
}

/* buscar usuario por DNI */
function buscarUsuario(dni) {
    return usuarios.find(usuario => usuario.dni === dni);
}

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
    document.querySelector(".menu-historial").setAttribute("style", "display: none;")
    const btn_volver = document.querySelector(".btn-volver")
    btn_volver.textContent = "Cerrar Sesión";
    btn_volver.onclick = function () {
        document.querySelector(".menu-cajero").setAttribute("style", "display: none;")
        AparecerDatosIngreso();
    };
    const usuarioActual = obtenerUsuarioActual();
    document.querySelector(".txtInfo").textContent = `Bienvenido ${usuarioActual.nombre} ${usuarioActual.apellido}. ¿Qué operación deseas realizar?`;
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
async function traerUsuarios() {
    const response = await fetch("./data/usuarios.json").then(response => response.json());
    localStorage.setItem("usuarios", JSON.stringify(response));
}

/* limpiar textos */
function limpiarTextos() {
    document.querySelector(".txtInfo").textContent = "";
    document.querySelector("#dni").value = "";
    document.querySelector("#password").value = "";
}
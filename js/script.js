setTimeout(() => {

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

    let opcion1 = prompt(`Bienvenido al simulador de cajero automatico. Ingrese su dni:`)
    let opcion2 = "";

    let usuarioActual = usuarios.find(usuario => usuario.dni === opcion1)

    while (!usuarioActual) {
        opcion1 = prompt(`Usuario no encontrado. Ingrese su dni nuevamente: `)
        usuarioActual = usuarios.find(usuario => usuario.dni === opcion1)
    }
    console.log(usuarioActual);


    if (usuarioActual) {
        let contraseñaIngresada = "";
        if (usuarioActual.blocked) {
            alert("Tu cuenta ha sido bloqueada por demasiados intentos fallidos. Por favor, contacta al banco para desbloquearla.")
            throw new Error("Cuenta bloqueada")
        }
        else {
            contraseñaIngresada = prompt("Ingrese su contraseña:")
        }
        for (let i = 0; i < 3; i++) {
            if (contraseñaIngresada === usuarioActual.contraseña) {
                break
            } else {
                contraseñaIngresada = prompt("Contraseña incorrecta. Ingrese su contraseña nuevamente. Quedan " + (3 - i) + " intentos:")
            }
        }
        if (contraseñaIngresada === usuarioActual.contraseña) {
            alert("Inicio de sesión exitoso.")
            usuarios = traerUsuarios();
            while (opcion2 !== "5") {
                opcion2 = prompt(`Seleccione una opción:
            1. Ingresar dinero
            2. Retirar dinero
            3. Mostrar saldo
            4. Transferir dinero
            5. Salir`)
                switch (opcion2) {
                    case "1":
                        let cantidadIngresar = parseFloat(prompt("Ingrese la cantidad a ingresar:"))
                        ingresarDinero(usuarios.find(usuario => usuario.dni === usuarioActual.dni), cantidadIngresar);
                        localStorage.setItem("usuarios", JSON.stringify(usuarios))
                        break
                    case "2":
                        let cantidadRetirar = parseFloat(prompt("Ingrese la cantidad a retirar:"))
                        retirarDinero(usuarios.find(usuario => usuario.dni === usuarioActual.dni), cantidadRetirar);
                        localStorage.setItem("usuarios", JSON.stringify(usuarios))
                        break
                    case "3":
                        mostrarSaldo(usuarios.find(usuario => usuario.dni === usuarioActual.dni));
                        break
                    case "4":
                        let dniDestinatario = prompt("Ingrese el DNI del destinatario:")
                        let destinatario = usuarios.find(usuario => usuario.dni === dniDestinatario)
                        if (destinatario && !destinatario.blocked) {
                            let cantidadTransferir = parseFloat(prompt("Ingrese la cantidad a transferir:"))
                            transferirDinero(usuarios.find(usuario => usuario.dni === usuarioActual.dni), destinatario, cantidadTransferir);
                            localStorage.setItem("usuarios", JSON.stringify(usuarios))
                        } else {
                            alert("Destinatario no encontrado o bloqueado.")
                        }
                        break
                    case "5":
                        alert("Gracias por usar el simulador de cajero automático.")
                        break
                    default:
                        alert("Opción no válida.")
                }
            }
        } else {
            alert("Constraseña incorrecta. Se han agotado los intentos. Tu cuenta ha sido bloqueada por seguridad.")
            usuarios.find(usuario => usuario.dni === usuarioActual.dni).blocked = true;
            localStorage.setItem("usuarios", JSON.stringify(usuarios))
        }
    } else {
        alert("Usuario no encontrado.")
    }

    function ingresarDinero(usuario, cantidad) {
        usuario.dinero += cantidad
    }

    function retirarDinero(usuario, cantidad) {
        if (cantidad > usuario.dinero) {
            alert("No tienes suficiente dinero para retirar esa cantidad.")
        } else {
            usuario.dinero -= cantidad
        }
    }

    function mostrarSaldo(usuario) {
        alert(`Tu saldo actual es: $${usuario.dinero}`)
    }

    function transferirDinero(remitente, destinatario, cantidad) {
        if (cantidad > remitente.dinero) {
            alert("No tienes suficiente dinero para transferir esa cantidad.")
        } else {
            remitente.dinero -= cantidad
            ingresarDinero(destinatario, cantidad)
            alert(`Has transferido $${cantidad} a ${destinatario.nombre} ${destinatario.apellido}.`)
        }
    }


    function traerUsuarios() {
        const usuariosGuardados = JSON.parse(localStorage.getItem("usuarios"));
        console.log(usuariosGuardados)
        return usuariosGuardados;
    }

}, 0);
const nombre = document.getElementById("nombre");
const telefono = document.getElementById("telefono");
const correo = document.getElementById("correo");
const form = document.getElementById("form");
const parrafo = document.getElementById("avisos");

form.addEventListener("submit", e => {
    e.preventDefault();
    let avisos = "";
    let entrar = false;
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    // Validacion del nombre
    if (nombre.value.length < 6) {
        avisos += "El nombre no es válido.<br>";
        entrar = true;
    }

    // Validacion del email
    if (!regexEmail.test(correo.value)) {
        avisos += "El correo electrónico no es válido.<br>";
        entrar = true;
    }

    // Validacion del telefono
    if (telefono.value.length < 10) {
        avisos += "Escribe un número válido de teléfono.";
        entrar = true;
    }

    if (entrar) {
        parrafo.innerHTML = avisos;
    }
});
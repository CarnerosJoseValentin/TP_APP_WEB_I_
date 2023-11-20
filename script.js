function register() {
    var firstName = document.getElementById('firstName').value;
    var lastName = document.getElementById('lastName').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var dob = document.getElementById('dob').value;

    var user = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        dob: dob
    };

    localStorage.setItem('user', JSON.stringify(user));

    alert('Registro exitoso ' + firstName + ' ' + lastName + '!');

    window.location.href = 'index.html';
}

//--------------------------------------------------------------------------------------------------------------------------//

function login() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    var storedUser = localStorage.getItem('user');

    if (storedUser) {
        var user = JSON.parse(storedUser);

        if (user.email === email && user.password === password) {

            alert('¡Bienvenido, ' + user.firstName + ' ' + user.lastName + '!');
            window.location.href = 'home.html';
        } else {
            alert('El nombre de usuario y/o contraseña son incorrectos. Por favor, inténtelo de nuevo.');
        }
    } else {
        alert('Usuario no encontrado. Por favor, regístrese antes de iniciar sesión.');
    }
}

//--------------------------------------------------------------------------------------------------------------------------//

function sumarCantidad(button) {
    actualizarCantidad(button, 1);
}

function restarCantidad(button) {
    actualizarCantidad(button, -1);
}

function actualizarCantidad(button, incremento) {
    const productContainer = button.closest('.product');
    const cantidadSpan = productContainer.querySelector('.cantidad');
    let cantidad = parseInt(cantidadSpan.innerText) + incremento;

    cantidad = Math.min(Math.max(1, cantidad), 5);

    cantidadSpan.innerText = cantidad;
}

//--------------------------------------------------------------------------------------------------------------------------//

const carrito = document.getElementById('carrito');
const elementos1 = document.getElementById('lista-1');
const lista = document.querySelector('#lista-carrito tbody');
const vaciarCarritoBtn = document.getElementById('vaciar-carrito');

const elementosCarrito = obtenerElementosDelCarritoDesdeLocalStorage();

document.addEventListener('DOMContentLoaded', cargarCarritoDesdeLocalStorage);
cargarEventListeners();

function cargarEventListeners(){
    elementos1.addEventListener('click', comprarElemento);
    carrito.addEventListener('click', eliminarElemento);
    vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
}

function comprarElemento(e){
    e.preventDefault();
    if(e.target.classList.contains('agregar-carrito')){
        const elemento = e.target.parentElement.parentElement;
        leerDatosElemento(elemento);
    }
}

function leerDatosElemento(elemento){
    const infoElemento = {
        cantidad: parseInt(elemento.querySelector('.cantidad').innerText),
        imagen: elemento.querySelector('img').src,
        titulo: elemento.querySelector('h3').textContent,
        precio: parseFloat(elemento.querySelector('.precio').textContent.replace('$', '')),
        id: elemento.querySelector('a').getAttribute('data-id'),
    }

    const existeEnCarrito = elementosCarrito.some(item => item.id === infoElemento.id);

    if (!existeEnCarrito) {
        insertarCarrito(infoElemento);

        guardarCarritoEnLocalStorage();
    } else {
        alert('Este artículo ya está en el carrito.');
    }
}

function insertarCarrito(elemento){
    const row = document.createElement('tr');
    const precioTotal = elemento.cantidad * elemento.precio; 
    row.innerHTML = `
        <td>
            ${elemento.cantidad}
        </td>
        <td>
            <img src="${elemento.imagen}" width=80>
        </td>
        <td>
            ${elemento.titulo}
        </td>
        <td>
            $${precioTotal.toFixed(2)} <!-- Mostrar el precio total -->
        </td>
        <td>
            <a href="#" class="borrar" data-id="${elemento.id}">X</a>
        </td>
    `;

    lista.appendChild(row);

    actualizarMontoTotal();

}

function eliminarElemento(e){
    e.preventDefault();
    let elemento,
        elementoId;
    if(e.target.classList.contains('borrar')){
        e.target.parentElement.parentElement.remove();
        elemento = e.target.parentElement.parentElement;
        elementoId = elemento.querySelector('a').getAttribute('data-id');
        
        eliminarElementoDelLocalStorage(elementoId);
    }
}

function vaciarCarrito(){
    while(lista.firstChild){
        lista.removeChild(lista.firstChild);
    }
    
    vaciarCarritoEnLocalStorage();
    actualizarMontoTotal();
    return false;
}

function guardarCarritoEnLocalStorage(){

    elementosCarrito.length = 0;
    const filas = lista.querySelectorAll('tr');
    filas.forEach(fila => {
        elementosCarrito.push(fila.innerHTML);
    });

    localStorage.setItem('carrito', JSON.stringify(elementosCarrito));
}

function obtenerElementosDelCarritoDesdeLocalStorage(){
    const elementosCarrito = localStorage.getItem('carrito');
    return elementosCarrito ? JSON.parse(elementosCarrito) : [];
}

function cargarCarritoDesdeLocalStorage(){
    elementosCarrito.forEach(elemento => {
        const row = document.createElement('tr');
        row.innerHTML = elemento;
        lista.appendChild(row);
    });
    actualizarMontoTotal();
}

function eliminarElementoDelLocalStorage(elementoId){
    const nuevosElementos = elementosCarrito.filter(elemento => !elemento.includes(`data-id="${elementoId}"`));
    localStorage.setItem('carrito', JSON.stringify(nuevosElementos));

    actualizarMontoTotal();
}

function vaciarCarritoEnLocalStorage(){
    localStorage.removeItem('carrito');
}

function actualizarMontoTotal() {
    const montoTotal = calcularTotalCarrito();
    if (totalLabel) {
        totalLabel.textContent = `Total: $${montoTotal.toFixed(2)}`;
    }
}

function calcularTotalCarrito() {
    let total = 0;
    const filas = lista.querySelectorAll('tr');

    filas.forEach(fila => {
        const cantidad = parseInt(fila.querySelector('td:first-child').textContent);
        const precioTotal = parseFloat(fila.querySelector('td:nth-child(4)').textContent.replace('$', ''));
        
        total += precioTotal;
    });

    return total;
}

//--------------------------------------------------------------------------------------------------------------------------//

const btnComprar = document.getElementById('btnComprar');
const modal_container = document.getElementById('modal_container');
const btndeliver = document.getElementById('btndeliver');
const close = document.getElementById('close');
const totalLabel = document.getElementById('totalLabel');

btnComprar.addEventListener('click', () => {
    actualizarMontoTotal();
    modal_container.classList.add('show');
});

btndeliver.addEventListener('click', () => {
    
    if (validarFormulario()) {
        alert('¡Gracias por tu compra!');
        modal_container.classList.remove('show');
        vaciarCarrito();
        
        reiniciarFormulario();
    } else {
        alert('Por favor, completa todos los campos del formulario.');
    }
});

close.addEventListener('click', () => {
    modal_container.classList.remove('show');
});

function validarFormulario() {
    const direccion = document.getElementById('direccion').value;
    const codigoPostal = document.getElementById('codigoPostal').value;
    const localidad = document.getElementById('localidad').value;
    const telefono = document.getElementById('telefono').value;

    return direccion && codigoPostal && localidad && telefono;
}

function reiniciarFormulario() {
    document.getElementById('direccion').value = '';
    document.getElementById('codigoPostal').value = '';
    document.getElementById('localidad').value = '';
    document.getElementById('telefono').value = '';
    document.getElementById('total').value = '';
}




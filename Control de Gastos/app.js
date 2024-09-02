// Variables globales
var tPresupuesto = parseFloat(localStorage.getItem('presupuesto')) || 0;
var disponible = tPresupuesto;
var gastos = JSON.parse(localStorage.getItem('gastos')) || [];
var gastado = 0;

// Evento para iniciar con el presupuesto
document.getElementById('btnIniciar').addEventListener('click', function () {
    var presupuesto = parseFloat(document.getElementById('inputPresupuesto').value);

    if (isNaN(presupuesto) || presupuesto <= 0) {
        alert('Por favor, ingrese un presupuesto mayor a 0.');
    } else {
        // Mostrar y ocultar divs 
        document.getElementById('divPresupuesto').style.display = 'none';
        document.getElementById('divGastos').style.display = 'block';
        document.getElementById('divCategoria').style.display = 'block';
        document.getElementById('divGastosNoHay').style.display = 'block';

        // Actualizar los valores de presupuesto
        tPresupuesto = presupuesto;
        disponible = presupuesto;
        gastado = 0;

        // Guardar en localStorage
        localStorage.setItem('presupuesto', presupuesto);
        localStorage.setItem('gastos', JSON.stringify(gastos));

        // Actualizar la interfaz
        document.getElementById('presupuestoDisplay').innerText = `$${presupuesto.toFixed(2)}`;
        document.getElementById('disponibleDisplay').innerText = `$${disponible.toFixed(2)}`;
        document.getElementById('gastadoDisplay').innerText = `$0.0`;

        updateProgressCircle();
    }
});

// Evento para reiniciar el presupuesto
document.getElementById('btnReset').addEventListener('click', function () {
    tPresupuesto = 0;
    disponible = 0;
    gastado = 0;

    // Actualiza la interfaz
    document.getElementById('presupuestoDisplay').innerText = `$0.0`;
    document.getElementById('disponibleDisplay').innerText = `$0.0`;
    document.getElementById('gastadoDisplay').innerText = `$0.0`;

    // Resetea localStorage
    localStorage.removeItem('presupuesto');
    localStorage.removeItem('gastos');

    gastos = [];
    mostrarGastos();

    // Muestra y oculta divs correspondientes
    document.getElementById('divPresupuesto').style.display = 'block';
    document.getElementById('divGastos').style.display = 'none';
    document.getElementById('divCategoria').style.display = 'none';
    document.getElementById('divGastosNoHay').style.display = 'none';

    // Resetea gráfico de progreso
    updateProgressCircle();
});

// Función para actualizar el gráfico de progreso
function updateProgressCircle() {
    gastado = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.costo), 0);
    disponible = tPresupuesto - gastado;

    var porcentaje = (gastado > 0 && tPresupuesto > 0) ? (gastado / tPresupuesto) * 100 : 0;
    var strokeDasharray = 339.292;
    var strokeDashoffset = strokeDasharray - (porcentaje / 100) * strokeDasharray;
 
    console.log(porcentaje);
    document.getElementById('progressCircle').setAttribute  ('stroke-dashoffset', strokeDashoffset);
    document.getElementById('progressText').textContent = `${Math.round(porcentaje)}%`;

    document.getElementById('disponibleDisplay').textContent = `$${disponible.toFixed(2)}`;
    document.getElementById('gastadoDisplay').textContent = `$${gastado.toFixed(2)}`;
}

// Función para mostrar los gastos
function mostrarGastos(filtroCategoria = "") {
    const gastosContainer = document.querySelector('#divGastosNoHay .card .form-group');
    gastosContainer.innerHTML = "";

    const gastosFiltrados = filtroCategoria ? 
        gastos.filter(gasto => gasto.categoria === filtroCategoria) : 
        gastos;

    if (gastosFiltrados.length === 0) {
        gastosContainer.innerHTML = '<small>No hay gastos</small>';
    } else {
        gastosFiltrados.forEach((gasto, index) => {
            const gastoElement = document.createElement('div');
            gastoElement.classList.add('gasto-item');
            gastoElement.innerHTML = `
                <p>${gasto.descripcion} - $${gasto.costo.toFixed(2)} - ${gasto.categoria}</p>
                <button class="btn btn-sm btn-warning edit-gasto" data-index="${index}" data-toggle="modal" data-target="#editModal">Editar</button>
                <button class="btn btn-sm btn-danger delete-gasto" data-index="${index}">Eliminar</button>
            `;
            gastosContainer.appendChild(gastoElement);
        });
    }

    updateProgressCircle();
}

// Función para guardar un nuevo gasto
document.querySelector('#saveGastoBtn').addEventListener('click', function () {
    const descripcion = document.getElementById('recipient-name').value;
    const costo = parseFloat(document.getElementById('recipient-cost').value);
    const categoria = document.getElementById('new-gasto-categoria').value;

    if (descripcion && !isNaN(costo) && costo > 0 && categoria) {
        gastos.push({ descripcion, costo, categoria });
        localStorage.setItem("gastos", JSON.stringify(gastos));
        mostrarGastos();
        $('#exampleModal').modal('hide');
    } else {
        alert("Todos los campos son obligatorios.");
    }
});

// Función para eliminar un gasto
document.querySelector('#divGastosNoHay .card .form-group').addEventListener('click', function (event) {
    if (event.target.classList.contains('delete-gasto')) {
        const index = event.target.getAttribute('data-index');
        gastos.splice(index, 1);
        localStorage.setItem("gastos", JSON.stringify(gastos));
        mostrarGastos();
    }
});

// Función para cargar el gasto en el modal de edición
document.querySelector('#divGastosNoHay .card .form-group').addEventListener('click', function (event) {
    if (event.target.classList.contains('edit-gasto')) {
        const index = event.target.getAttribute('data-index');
        const gasto = gastos[index];
        document.getElementById('edit-recipient-name').value = gasto.descripcion;
        document.getElementById('edit-recipient-cost').value = gasto.costo;
        document.querySelector('#editModal select.form-control').value = gasto.categoria;
        document.getElementById('saveEditBtn').setAttribute('data-index', index);
    }
});

// Función para guardar los cambios al editar un gasto
document.getElementById('saveEditBtn').addEventListener('click', function () {
    const index = this.getAttribute('data-index');
    const descripcion = document.getElementById('edit-recipient-name').value;
    const costo = parseFloat(document.getElementById('edit-recipient-cost').value);
    const categoria = document.getElementById('edit-categoria').value;

    if (descripcion && !isNaN(costo) && costo > 0 && categoria) {
        gastos[index] = { descripcion, costo, categoria };
        localStorage.setItem("gastos", JSON.stringify(gastos));
        mostrarGastos();
        $('#editModal').modal('hide');
    } else {
        alert("Todos los campos son obligatorios.");
    }
});

// Evento para filtrar por categoría
document.getElementById('categoria').addEventListener('change', function () {
    const categoriaSeleccionada = this.value;
    mostrarGastos(categoriaSeleccionada);
});

// Inicializar la visualización de los gastos y el gráfico
mostrarGastos();

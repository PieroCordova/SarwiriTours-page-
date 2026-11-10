/* ===== Sarwiri Tours - JavaScript conectado a la API REST (Backend + MySQL) ===== */

// ---------------------------------------------------------
// 1. CONFIGURACIÓN Y DATOS DE RESPALDO (Fallback)
// ---------------------------------------------------------
const API_URL = "http://localhost:3000/api";
const NUMERO_WHATSAPP = "56900000000";

// Tours de respaldo si el backend no estuviese iniciado
let tours = [
  {
    id: 1,
    nombre: "Sandboard en Cerro Dragón",
    categoria: "Aventura",
    duracion: "3 horas",
    precio: 25000,
    maxPersonas: 10,
    imagen: "img/cerrodragoniqq.jpg",
    descripcion: "Desliza por las dunas del Cerro Dragón con vista a la ciudad y al mar. Incluye tabla e instructor."
  },
  {
    id: 2,
    nombre: "Oficina Salitrera Humberstone",
    categoria: "Cultura",
    duracion: "5 horas",
    precio: 30000,
    maxPersonas: 15,
    imagen: "img/Humberstoneiqq.jpg",
    descripcion: "Recorre el antiguo pueblo salitrero, Patrimonio de la Humanidad, y conoce la historia del salitre."
  },
  {
    id: 3,
    nombre: "Parapente en Alto Hospicio",
    categoria: "Aventura",
    duracion: "2 horas",
    precio: 60000,
    maxPersonas: 4,
    imagen: "img/parapenteiqq.jpg",
    descripcion: "Vuela sobre la costa de Iquique en un vuelo tándem acompañado de un piloto profesional."
  },
  {
    id: 4,
    nombre: "Oasis de Pica y Matilla",
    categoria: "Cultura",
    duracion: "8 horas",
    precio: 40000,
    maxPersonas: 12,
    imagen: "img/picaiqq.jpg",
    descripcion: "Visita el oasis de Pica, sus piscinas naturales y el pueblo de Matilla. Prueba los frutos de la zona."
  },
  {
    id: 5,
    nombre: "City Tour Histórico de Iquique",
    categoria: "Cultura",
    duracion: "3 horas",
    precio: 15000,
    maxPersonas: 20,
    imagen: "img/baquedanoiqq.jpg",
    descripcion: "Paseo por la Plaza Prat, el Teatro Municipal, la calle Baquedano y los edificios históricos."
  },
  {
    id: 6,
    nombre: "Kayak en Playa Cavancha",
    categoria: "Aventura",
    duracion: "2 horas",
    precio: 20000,
    maxPersonas: 8,
    imagen: "img/kayakiqq.jpg",
    descripcion: "Navega por la costa de Iquique en kayak y observa lobos marinos y aves."
  }
];

// ---------------------------------------------------------
// 2. FUNCIONES ÚTILES
// ---------------------------------------------------------
function formatoPrecio(numero) {
  return "$" + Number(numero).toLocaleString("es-CL");
}

function normalizar(texto) {
  return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function claseBadge(categoria) {
  return categoria === "Aventura" ? "badge-aventura" : "badge-cultura";
}

function fechaHoy() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return hoy.getFullYear() + "-" + mes + "-" + dia;
}

function obtenerParametro(nombre) {
  return new URLSearchParams(window.location.search).get(nombre);
}

// Obtener token JWT o autenticar automáticamente usuario visitante de prueba
async function obtenerTokenUsuario() {
  let token = localStorage.getItem("sarwiri_token");
  if (token) return token;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: "visitante@correo.cl", contrasena: "clave123" })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("sarwiri_token", data.token);
      return data.token;
    }
  } catch (e) {
    console.warn("No se pudo conectar con el servicio de autenticación:", e);
  }
  return null;
}

// ---------------------------------------------------------
// 3. ENLACES DE WHATSAPP (todas las páginas)
// ---------------------------------------------------------
document.querySelectorAll(".link-whatsapp").forEach(function (enlace) {
  enlace.href = "https://wa.me/" + NUMERO_WHATSAPP +
    "?text=" + encodeURIComponent("Hola! Quiero información sobre los tours de Sarwiri Tours.");
  enlace.target = "_blank";
});

// ---------------------------------------------------------
// 4. PÁGINA PRINCIPAL (index.html): catálogo + buscador (GET /api/tours)
// ---------------------------------------------------------
const listaTours = document.getElementById("lista-tours");

if (listaTours) {
  const formBuscador = document.getElementById("form-buscador");
  const inputPalabra = document.getElementById("palabra");
  const inputFecha = document.getElementById("fecha");
  const inputPersonas = document.getElementById("personas");
  const sinResultados = document.getElementById("sin-resultados");

  if (inputFecha) inputFecha.min = fechaHoy();

  // Dibuja las tarjetas de los tours
  function mostrarTours(lista) {
    listaTours.innerHTML = "";
    if (sinResultados) {
      sinResultados.classList.toggle("d-none", lista.length > 0);
    }

    lista.forEach(function (t) {
      const maxP = t.max_personas || t.maxPersonas || 10;
      let enlace = "tour.html?id=" + t.id;
      if (inputFecha && inputFecha.value) enlace += "&fecha=" + inputFecha.value;
      if (inputPersonas && inputPersonas.value) enlace += "&personas=" + inputPersonas.value;

      listaTours.innerHTML += `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm">
            <img src="${t.imagen}" class="card-img-top" alt="${t.nombre}" onerror="this.src='https://placehold.co/600x400?text=Sarwiri+Tours'">
            <div class="card-body d-flex flex-column">
              <span class="badge ${claseBadge(t.categoria)} align-self-start mb-2">${t.categoria}</span>
              <h5 class="card-title">${t.nombre}</h5>
              <p class="mb-1 text-muted">Duración: ${t.duracion} | Máx: ${maxP} pers.</p>
              <p class="precio fw-bold">Desde ${formatoPrecio(t.precio)} por persona</p>
              <a href="${enlace}" class="btn btn-marca mt-auto">Ver detalle y reservar</a>
            </div>
          </div>
        </div>`;
    });
  }

  // Carga tours desde la API REST (MySQL)
  async function cargarToursDesdeAPI(query = "", personas = "") {
    try {
      const url = new URL(`${API_URL}/tours`);
      if (query) url.searchParams.set("q", query);
      if (personas) url.searchParams.set("personas", personas);

      const resp = await fetch(url.toString());
      if (resp.ok) {
        const datosBD = await resp.json();
        tours = datosBD.map(t => ({
          ...t,
          maxPersonas: t.max_personas || t.maxPersonas
        }));
        mostrarTours(tours);
        return;
      }
    } catch (e) {
      console.warn("Backend no detectado, usando datos locales:", e.message);
    }
    // Fallback local
    mostrarTours(tours);
  }

  // Filtrado al enviar formulario
  formBuscador.addEventListener("submit", function (e) {
    e.preventDefault();
    const palabra = inputPalabra.value.trim();
    const personas = inputPersonas.value;
    cargarToursDesdeAPI(palabra, personas);
  });

  document.getElementById("btn-limpiar").addEventListener("click", function () {
    formBuscador.reset();
    cargarToursDesdeAPI();
  });

  // Cargar catálogo inicial desde MySQL
  cargarToursDesdeAPI();
}

// ---------------------------------------------------------
// 5. DETALLE DE UN TOUR (tour.html): HU04 y Disponibilidad HU03
// ---------------------------------------------------------
const detalle = document.getElementById("detalle-tour");

if (detalle) {
  const idTour = obtenerParametro("id") || "1";

  async function iniciarDetalle() {
    let tour = null;

    try {
      const res = await fetch(`${API_URL}/tours/${idTour}`);
      if (res.ok) {
        const data = await res.json();
        tour = { ...data, maxPersonas: data.max_personas || data.maxPersonas };
      }
    } catch (e) {
      console.warn("API no disponible para detalle, buscando localmente:", e);
    }

    if (!tour) {
      tour = tours.find(t => t.id === Number(idTour));
    }

    if (!tour) {
      detalle.innerHTML = '<div class="alert alert-warning">Tour no encontrado. <a href="index.html">Volver al catálogo</a></div>';
      return;
    }

    const maxCapacidad = tour.max_personas || tour.maxPersonas || 10;

    detalle.innerHTML = `
      <div class="row g-4">
        <div class="col-12 col-md-6">
          <img src="${tour.imagen}" class="imagen-detalle w-100 rounded shadow-sm" alt="${tour.nombre}" onerror="this.src='https://placehold.co/600x400?text=Sarwiri+Tours'">
        </div>
        <div class="col-12 col-md-6">
          <span class="badge ${claseBadge(tour.categoria)} mb-2">${tour.categoria}</span>
          <h1 class="h2">${tour.nombre}</h1>
          <p class="mb-1 text-muted"><strong>Duración:</strong> ${tour.duracion}</p>
          <p class="precio fs-4 fw-bold">Desde ${formatoPrecio(tour.precio)} por persona</p>
          <p>${tour.descripcion}</p>

          <div class="card p-3 mb-3 bg-light border-0">
            <h6 class="card-subtitle mb-2 text-primary">Consulta de cupos en tiempo real (Base de datos)</h6>
            <div class="row g-2 mb-2">
              <div class="col-7">
                <label for="fecha" class="form-label">Fecha del tour</label>
                <input type="date" id="fecha" class="form-control">
              </div>
              <div class="col-5">
                <label for="personas" class="form-label">Personas (máx. ${maxCapacidad})</label>
                <input type="number" id="personas" class="form-control" min="1" max="${maxCapacidad}" value="1">
              </div>
            </div>
            <div id="info-cupos" class="small text-muted mb-1">Elige una fecha para verificar cupos en MySQL.</div>
            <div id="aviso" class="text-danger small fw-bold"></div>
          </div>

          <button id="btn-reservar" class="btn btn-marca btn-lg w-100">Reservar este tour</button>
        </div>
      </div>`;

    const inputFecha = document.getElementById("fecha");
    const inputPersonas = document.getElementById("personas");
    const infoCupos = document.getElementById("info-cupos");
    const aviso = document.getElementById("aviso");

    inputFecha.min = fechaHoy();
    if (obtenerParametro("fecha")) inputFecha.value = obtenerParametro("fecha");
    if (obtenerParametro("personas")) inputPersonas.value = obtenerParametro("personas");

    // Función para consultar disponibilidad en la API REST (HU03)
    async function consultarDisponibilidad() {
      if (!inputFecha.value) return;
      try {
        const resDisp = await fetch(`${API_URL}/tours/${tour.id}/disponibilidad?fecha=${inputFecha.value}`);
        if (resDisp.ok) {
          const disp = await resDisp.json();
          infoCupos.innerHTML = `🟢 <strong>Cupos disponibles:</strong> ${disp.cuposDisponibles} de ${disp.maxPersonas} personas en esta fecha.`;
          infoCupos.className = disp.cuposDisponibles > 0 ? "small text-success fw-bold mb-1" : "small text-danger fw-bold mb-1";
        }
      } catch (err) {
        infoCupos.textContent = "Capacidad máxima: " + maxCapacidad + " personas.";
      }
    }

    inputFecha.addEventListener("change", consultarDisponibilidad);
    if (inputFecha.value) consultarDisponibilidad();

    document.getElementById("btn-reservar").addEventListener("click", function () {
      aviso.textContent = "";
      const personas = Number(inputPersonas.value);

      if (!inputFecha.value) {
        aviso.textContent = "Por favor elige una fecha.";
      } else if (inputFecha.value < fechaHoy()) {
        aviso.textContent = "La fecha no puede ser anterior a hoy.";
      } else if (personas < 1 || personas > maxCapacidad) {
        aviso.textContent = "La cantidad de personas debe ser entre 1 y " + maxCapacidad + ".";
      } else {
        window.location.href = "reserva.html?id=" + tour.id +
          "&fecha=" + inputFecha.value + "&personas=" + personas;
      }
    });
  }

  iniciarDetalle();
}

// ---------------------------------------------------------
// 6. FORMULARIO DE RESERVA (reserva.html): HU09 (Persistencia en MySQL)
// ---------------------------------------------------------
const formReserva = document.getElementById("form-reserva");

if (formReserva) {
  const tourId = Number(obtenerParametro("id")) || 1;
  const personas = Number(obtenerParametro("personas")) || 1;
  const fecha = obtenerParametro("fecha") || fechaHoy();

  async function cargarResumenReserva() {
    let tour = null;
    try {
      const res = await fetch(`${API_URL}/tours/${tourId}`);
      if (res.ok) tour = await res.json();
    } catch (e) {}

    if (!tour) tour = tours.find(t => t.id === tourId) || tours[0];

    const totalEstimado = tour.precio * personas;
    const resumenElemento = document.getElementById("resumen");
    if (resumenElemento) {
      resumenElemento.innerHTML = `
        <strong>${tour.nombre}</strong> (${tour.duracion})<br>
        📅 Fecha: <strong>${fecha}</strong> | 👥 Personas: <strong>${personas}</strong><br>
        💵 Total a pagar estimado: <strong>${formatoPrecio(totalEstimado)}</strong>
      `;
    }

    formReserva.addEventListener("submit", async function (e) {
      e.preventDefault();
      const btnEnviar = formReserva.querySelector("button[type='submit']");
      const errorDiv = document.getElementById("mensaje-error") || document.createElement("div");
      errorDiv.id = "mensaje-error";
      errorDiv.className = "alert alert-danger mt-3 d-none";
      formReserva.appendChild(errorDiv);

      if (!formReserva.checkValidity()) {
        formReserva.classList.add("was-validated");
        return;
      }

      const inputNombre = document.getElementById("nombre").value.trim();
      const inputCorreo = document.getElementById("correo").value.trim();
      const inputTelefono = document.getElementById("telefono").value.trim();

      btnEnviar.disabled = true;
      btnEnviar.textContent = "Procesando reserva en base de datos...";

      try {
        const token = await obtenerTokenUsuario();

        const payload = {
          tourId: tour.id,
          fecha: fecha,
          personas: personas,
          nombre: inputNombre,
          correo: inputCorreo,
          telefono: inputTelefono
        };

        const response = await fetch(`${API_URL}/reservas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.status === 201) {
          // Éxito: Guardar datos de confirmación generados por MySQL
          sessionStorage.setItem("sarwiri_confirmacion", JSON.stringify({
            ...data,
            nombre: inputNombre,
            correo: inputCorreo,
            telefono: inputTelefono
          }));
          window.location.href = "confirmacion.html";
        } else {
          errorDiv.textContent = data.error || "No se pudo procesar la reserva.";
          errorDiv.classList.remove("d-none");
          btnEnviar.disabled = false;
          btnEnviar.textContent = "Confirmar reserva";
        }
      } catch (err) {
        console.error("Error al conectar con la API:", err);
        errorDiv.textContent = "Error al conectar con el servidor Backend. Verifique que esté ejecutándose en http://localhost:3000";
        errorDiv.classList.remove("d-none");
        btnEnviar.disabled = false;
        btnEnviar.textContent = "Confirmar reserva";
      }
    });
  }

  cargarResumenReserva();
}

// ---------------------------------------------------------
// 7. PÁGINA DE CONFIRMACIÓN (confirmacion.html): Mostrar datos guardados en MySQL
// ---------------------------------------------------------
const contenedorConfirmacion = document.querySelector(".icono-exito");

if (contenedorConfirmacion) {
  const datosGuardados = sessionStorage.getItem("sarwiri_confirmacion");
  if (datosGuardados) {
    try {
      const reserva = JSON.parse(datosGuardados);
      const seccion = document.querySelector("main section");

      if (seccion) {
        const cardDetalle = document.createElement("div");
        cardDetalle.className = "card text-start shadow-sm my-4 border-success";
        cardDetalle.innerHTML = `
          <div class="card-header bg-success text-white fw-bold">
            ✓ Guardado exitosamente en Base de Datos MySQL
          </div>
          <div class="card-body">
            <h5 class="card-title text-primary">${reserva.tour || "Tour reservado"}</h5>
            <div class="row g-2 mb-2">
              <div class="col-6"><strong>N° de Reserva (ID):</strong> #${reserva.id}</div>
              <div class="col-6"><strong>Estado:</strong> <span class="badge bg-warning text-dark text-capitalize">${reserva.estado}</span></div>
              <div class="col-6"><strong>Fecha:</strong> ${reserva.fecha}</div>
              <div class="col-6"><strong>Personas:</strong> ${reserva.personas}</div>
              <div class="col-6"><strong>Cliente:</strong> ${reserva.nombre || "-"}</div>
              <div class="col-6"><strong>Total calculado en servidor:</strong> <span class="text-success fw-bold">${formatoPrecio(reserva.total)}</span></div>
            </div>
            <p class="small text-muted mb-0">La agencia validará la reserva con código <strong>#${reserva.id}</strong> y se pondrá en contacto al correo ${reserva.correo || ""}.</p>
          </div>
        `;
        seccion.insertBefore(cardDetalle, seccion.querySelector("a.btn-marca"));
      }
    } catch (e) {
      console.warn("No se pudo parsear confirmación:", e);
    }
  }
}

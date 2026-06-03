import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Button } from "../../components/Buttons";
import { IconoRRHH, IconoDinero } from "../../components/Icons";
import List from "../../components/Lista";
import { useNavigate } from "react-router-dom";
import fetchConToken from "../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function RRHH({ usuario = "Empleado", onLogout, onNavegar }) {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const handleNavegar = (ruta, empleado = null) => {
    if (empleado) {
      navigate(`/rrhh/${ruta}/${empleado.id}`);
      return;
    }
    const rutaFinal = ruta.startsWith("/") ? ruta : `/rrhh/${ruta}`;
    navigate(rutaFinal);
  };

  const handleVerEmpleado = (empleado, e) => {
    if (e) e.stopPropagation();
    const idEmpleado = empleado?.id ?? empleado?.id_empleado;
    if (!idEmpleado) return;
    navigate(`/rrhh/gestion-de-empleado/${idEmpleado}`);
  };

  function handleNuevo() {
    navigate("/rrhh/gestion-de-empleado/-1");
  }

  const cargos = [...new Set(empleados.map((emp) => emp.cargo))];

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "cargo", label: "Cargo" },
    { key: "CI", label: "CI" },
    { key: "fecha_inicio", label: "Fecha de Inicio" },
  ];

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const respuesta = await fetchConToken(
          `${API_BASE}/rrhh/empleados/table`,
        );

        const data = await respuesta.json();

        if (!Array.isArray(data)) {
          console.error("Supabase devolvió un error:", data);
          return;
        }

        const formateado = data.map((item) => ({
          id: item.id_empleado ?? "",

          nombre: item.personas?.nombre ?? "",

          apellido: item.personas?.apellido ?? "",

          CI: item.ci ?? "",

          cargo: item.personas_horario_cargo?.[0]?.cargo?.nombre ?? "",

          fecha_inicio: item.personas_horario_cargo?.[0]?.fecha_inicio ?? "",
        }));

        setEmpleados(formateado);
        setLoading(false);
      } catch (error) {
        console.error("ERROR GENERAL:", error);
      }
    };

    cargarEmpleados();
  }, []);

  const empleadosFiltrados = empleados
    .filter((emp) => {
      const texto = search.toLowerCase();

      const coincideBusqueda =
        emp.nombre.toLowerCase().includes(texto) ||
        emp.apellido.toLowerCase().includes(texto) ||
        emp.cargo.toLowerCase().includes(texto) ||
        emp.CI.toLowerCase().includes(texto);

      const coincideCargo = !filtroCargo || emp.cargo === filtroCargo;

      return coincideBusqueda && coincideCargo;
    })

    .sort((a, b) => {
      if (orderBy === "nombre") {
        return a.nombre.localeCompare(b.nombre);
      }

      if (orderBy === "apellido") {
        return a.apellido.localeCompare(b.apellido);
      }

      if (orderBy === "cargo") {
        return a.cargo.localeCompare(b.cargo);
      }

      return 0;
    });

  return (
    <div style={styles.pagina}>
      <Sidebar
        usuario={usuario}
        onNavegar={handleNavegar}
        onLogout={onLogout}
      />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Módulo de RRHH</h1>
          <div style={styles.separador} />
        </header>

        {/* Botones de acciones principales */}

        <section style={styles.acciones}>
          {[
            {
              label: "Gestión de Empleados",
              icon: <IconoRRHH size={36} />,
              id: "gestion-de-empleado",
            },
            {
              label: "Gestión de Salarios",
              icon: <IconoDinero size={36} />,
              id: "gestion-salarial",
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (!empleadoSeleccionado) {
                  alert("Por favor, selecciona un empleado primero");
                  return;
                }
                handleNavegar(item.id, empleadoSeleccionado);
              }}
              style={styles.tarjeta}
            >
              <span style={styles.tarjetaLabel}>{item.label}</span>
              <div style={styles.tarjetaIcono}>{item.icon}</div>
            </button>
          ))}
        </section>

        {/* Lista de empleados y acciones para filtrar etc.*/}
        {loading && <div>Cargando empleados...</div>}
        {!loading && (
          <section style={styles.listaEmpleados}>
            <List
              data={empleadosFiltrados}
              columns={columns}
              selectable
              onRowClick={(emp) => setEmpleadoSeleccionado(emp)}
              controls={[
                {
                  type: "search",
                  placeholder: "Buscar empleado...",
                  value: search,
                  onChange: (e) => setSearch(e.target.value),
                },

                {
                  type: "select",
                  label: "Ordenar por:",
                  placeholder: "Seleccionar",
                  value: orderBy,
                  onChange: (e) => setOrderBy(e.target.value),

                  options: [
                    { key: "nombre", label: "Nombre" },
                    { key: "apellido", label: "Apellido" },
                    { key: "cargo", label: "Cargo" },
                  ],
                },

                {
                  type: "select",
                  label: "Filtrar por:",
                  placeholder: "Cargo",
                  value: filtroCargo,
                  onChange: (e) => setFiltroCargo(e.target.value),

                  options: cargos.map((c) => ({
                    key: c,
                    label: c,
                  })),
                },

                {
                  type: "button",
                  label: "Nuevo",
                  onClick: handleNuevo,
                },
              ]}
            />
          </section>
        )}
      </main>
    </div>
  );
}

const styles = {
  pagina: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    background: "#F9F9F9",
    fontFamily: "Lato, sans-serif",
    overflow: "hidden",
  },
  contenido: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    textAlign: "center",
    padding: 0,
    boxSizing: "border-box",
    gap: 20,
  },
  encabezado: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "21px 0",
  },
  titulo: {
    color: "#000000",
    fontSize: 42,
    fontFamily: "Lato, sans-serif",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textAlign: "center",
    marginTop: 15,
  },
  separador: {
    width: "min(1100px, 80%)",
    height: 4,
    background: "#000000",
  },
  actionContainer: {
    display: "flex",
    alignItems: "center",
    gap: 30,
    background: "#ffffff",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
    border: "3px solid #444444",
  },
  listaEmpleados: {
    width: "100%",
    maxWidth: 860,
    textAlign: "left",
  },
  lista: {
    marginTop: 16,
    paddingLeft: 20,
    display: "grid",
  },
  acciones: {
    width: "100%",
    maxWidth: 860,
    display: "flex",
    justifyContent: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  tarjetaLabel: {
    color: "#444444",
    fontSize: 16,
    fontFamily: "Lato, sans-serif",
    fontWeight: 700,
    textAlign: "left",
  },
  tarjetaIcono: {
    width: 48,
    height: 48,
    background: "#FFCC00",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tarjeta: {
    flex: "1 1 160px",
    maxWidth: 400,
    minHeight: 80,
    padding: "12px 16px",
    background: "white",
    boxShadow: "0px 2px 2px rgba(0,0,0,0.25)",
    borderRadius: 8,
    border: "3px solid #000000",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    cursor: "pointer",
  },
};

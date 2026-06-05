import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import List from "../../../components/Lista";
import { IconoLupa } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function OrdenesPago({ usuario, onNavegar, onLogout }) {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [orden, setOrden] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchConToken(`${API_BASE}/compras/ordenes-pago`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudieron cargar las órdenes de pago");
        }
        setOrdenes((data || []).map((o) => ({
        ...o,
        codigo: o.codigo_orden_pago || "",
        fecha: o.fecha_creacion || "",
        proveedor_id: o.proveedores?.id_proveedor,   // ✅ NUEVO
        proveedor: o.proveedores?.personas?.nombre || "",
        estado: o.estados?.nombre || "",
      })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarOrdenes();
  }, []);


  const ordenesFiltradas = ordenes
    .filter((o) => (o.estado || "").toLowerCase() !== "anulado")
    .filter((o) => {
      const texto = busqueda.toLowerCase();
      return (
        (o.codigo || "").toLowerCase().includes(texto) ||
        (o.estado || "").toLowerCase().includes(texto) ||
        (o.fecha || "").toLowerCase().includes(texto) ||
        (o.proveedor || "").toLowerCase().includes(texto)
      );
    })
    .filter((o) => (!filtroEstado ? true : o.estado === filtroEstado))
    .sort((a, b) => {
      if (orden === "fechaDesc") return new Date(b.fecha) - new Date(a.fecha);
      if (orden === "fechaAsc") return new Date(a.fecha) - new Date(b.fecha);
      if (orden === "codigo") return (a.codigo || "").localeCompare(b.codigo || "");
      return 0;
    });
const handleVerOrden = (orden, e) => {
  if (e) e.stopPropagation();
  navigate("/compras/ordenes-de-pago/seleccion-facturas", {
    state: {
      proveedor: {
        id: orden.proveedor_id,      // ✅ viene del map
        nombre: orden.proveedor,
      }
    }
  });
};
  const columns = [
    { key: "codigo", label: "Código" },
    { key: "proveedor", label: "Proveedor" },
    { key: "estado", label: "Estado" },
    { key: "fecha", label: "Fecha de Creación" },
    {
      key: "acciones",
      label: "Acciones",
      render: (orden) => (

        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVerOrden(orden);
            }}
            style={styles.botonAccion}
          >
            <IconoLupa />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Órdenes de Pago</h1>
          <div style={styles.separador} />
        </header>

        <section style={styles.listaStyle}>
          {loading && <div>Cargando órdenes de pago...</div>}
          {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

          {!loading && !error && (
            <List
              data={ordenesFiltradas}
              columns={columns}
              selectable={false}
              controls={[
                {
                  type: "search",
                  placeholder: "Buscar orden de pago...",
                  value: busqueda,
                  onChange: (e) => setBusqueda(e.target.value)
                },
                {
                  type: "select",
                  placeholder: "Filtrar por estado",
                  value: filtroEstado,
                  onChange: (e) => setFiltroEstado(e.target.value),
                  options: [
                    { key: "Confirmado", label: "Confirmado" },
                    { key: "En Espera", label: "En Espera" },
                    { key: "Cancelado", label: "Cancelado" }
                  ]
                },
                {
                  type: "select",
                  placeholder: "Ordenar por",
                  value: orden,
                  onChange: (e) => setOrden(e.target.value),
                  options: [
                    { key: "fechaDesc", label: "Más recientes" },
                    { key: "fechaAsc", label: "Más antiguos" },
                    { key: "codigo", label: "Código" }
                  ]
                },
                {
                  type: "button",
                  label: "Pagar Facturas",
                  onClick: () =>
                    navigate("/compras/ordenes-de-pago/seleccion-facturas")
                }
              ]}
            />
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  pagina: {
    display: 'flex',
    minHeight: '100vh',
    background: getColor("blanco"),
  },
  contenido: {
    flex: 1,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  encabezado: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '21px 0',
  },
  titulo: {
    color: getColor("negro"),
    fontSize: 42,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textAlign: 'center',
  },
  separador: {
    width: 'min(1100px, 80%)',
    height: 4,
    background: getColor("negro"),
  },
  botonAccion: {
    background: getColor("amarillo"),
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    padding: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

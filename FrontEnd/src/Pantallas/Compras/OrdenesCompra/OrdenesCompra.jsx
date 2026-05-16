import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import List from "../../../components/Lista";
import { IconoLupa } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function OrdenesCompra({ usuario, onNavegar, onLogout }) {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [orden, setOrden] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleVerOrden = (orden, e) => {
    if (e) e.stopPropagation();
    const idOrden = orden?.id_orden ?? orden?.id;
    if (!idOrden) return;
    navigate(`/compras/ordenes-de-compra/${idOrden}`);
  };

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/compras/ordenes-compra`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudieron cargar las órdenes");
        }

        setOrdenes((data.ordenes || []).map((o) => ({
          ...o,
          estado: o.estado || "",
          proveedor: o.proveedor || ""
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

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "estado", label: "Estado" },
    { key: "fecha", label: "Fecha de Creación" },
    {
      key: "acciones",
      label: "Acciones",
      render: (orden) => (
        <button
          onClick={(e) => handleVerOrden(orden, e)}
          style={{
            margin: "0 10px",
            display: "block",
            background: getColor("amarillo"),
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          <IconoLupa />
        </button>
      )
    }
  ];

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Ordenes de Compra</h1>
          <div style={styles.separador} />
        </header>

        <div style={{ width: "100%", maxWidth: 860 }}>
          {loading && <div>Cargando órdenes...</div>}
          {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

          {!loading && !error && (
            <List
              data={ordenesFiltradas}
              columns={columns}
              selectable={false}
              controls={[
                {
                  type: "search",
                  placeholder: "Buscar orden...",
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
                }
              ]}
            />
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  pagina: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F5F5F5',
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
    color: '#000000',
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
    background: '#000000',
  },
};

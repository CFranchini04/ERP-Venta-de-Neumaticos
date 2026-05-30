import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { IconoLupa } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function NotasCredito({ usuario, onNavegar, onLogout }) {
  const navigate = useNavigate();
  const [notasCredito, setNotasCredito] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [orden, setOrden] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleVerNota = (nota, e) => {
    if (e) e.stopPropagation();
    const idNota = nota?.id_nota_credito_venta ?? nota?.id;
    if (!idNota) return;
    navigate(`/ventas/notas-credito/${idNota}`);
  };

  useEffect(() => {
    const cargarNotasCredito = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchConToken(`${API_BASE}/ventas/notas-credito`);

        if (!response.ok && response.status === 404) {
          setNotasCredito([]);
          setLoading(false);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setNotasCredito([]);
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudieron cargar las notas de crédito");
        }

        setNotasCredito(
          (Array.isArray(data) ? data : data.notas_credito || []).map((n) => ({
            ...n,
            estado: n.estados?.nombre || n.estado || "",
            nro_factura: n.facturas_ventas?.codigo_factura || "",
            cliente: [
              n.facturas_ventas?.clientes?.personas?.nombre,
              n.facturas_ventas?.clientes?.personas?.apellido,
            ]
              .filter(Boolean)
              .join(" "),
          }))
        );
      } catch (err) {
        console.error("Error cargando notas de crédito:", err);
        setNotasCredito([]);
      } finally {
        setLoading(false);
      }
    };

    cargarNotasCredito();
  }, []);

  const notasFiltradas = notasCredito
    .filter((n) => {
      const texto = busqueda.toLowerCase();
      return (
        (n.nro_nota_credito || "").toLowerCase().includes(texto) ||
        (n.nro_factura || "").toLowerCase().includes(texto) ||
        (n.cliente || "").toLowerCase().includes(texto) ||
        (n.fecha_emision || "").toLowerCase().includes(texto)
      );
    })
    .filter((n) => (!filtroEstado ? true : n.estado === filtroEstado))
    .sort((a, b) => {
      if (orden === "fechaDesc") return new Date(b.fecha_emision) - new Date(a.fecha_emision);
      if (orden === "fechaAsc") return new Date(a.fecha_emision) - new Date(b.fecha_emision);
      if (orden === "numero") return (a.nro_nota_credito || "").localeCompare(b.nro_nota_credito || "");
      return 0;
    });

  const columns = [
    { key: "nro_nota_credito", label: "Número", width: "15%" },
    { key: "nro_factura", label: "Factura", width: "15%" },
    { key: "cliente", label: "Cliente", width: "28%" },
    { key: "fecha_emision", label: "Fecha", width: "14%" },
    { key: "monto_total", label: "Total", width: "16%" },
    {
      key: "acciones",
      label: "Acciones",
      width: "12%",
      render: (nota) => (
        <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
          <button
            onClick={(e) => handleVerNota(nota, e)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <IconoLupa />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Notas de Crédito</h1>
          <div style={styles.separador} />
        </header>

        <div style={{ width: "100%", maxWidth: 1100 }}>
          {loading && <div>Cargando notas de crédito...</div>}
          {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

          {!loading && !error && (
            <>
              <div style={styles.controles}>
                <div style={styles.grupoControles}>
                  <input
                    type="text"
                    placeholder="Buscar por número, factura o cliente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={styles.buscador}
                  />

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Filtros</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Anulado">Anulado</option>
                  </select>

                  <select
                    value={orden}
                    onChange={(e) => setOrden(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Ordenar por:</option>
                    <option value="fechaDesc">Más recientes</option>
                    <option value="fechaAsc">Más antiguos</option>
                    <option value="numero">Número</option>
                  </select>
                </div>

                <button
                  onClick={() => console.log("Ir a Facturas")}
                  style={styles.botonFacturas}
                >
                  Ir a Facturas
                </button>
              </div>

              <div style={styles.tabla}>
                <div style={styles.tablaHeader}>
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      style={{
                        padding: "12px",
                        fontWeight: "700",
                        width: col.width,
                        textAlign: col.key === "acciones" ? "center" : "left",
                      }}
                    >
                      {col.label}
                    </div>
                  ))}
                </div>

                {notasFiltradas.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                    No hay notas de crédito para mostrar
                  </div>
                ) : (
                  notasFiltradas.map((nota, index) => (
                    <div
                      key={nota.id_nota_credito_venta}
                      style={{
                        ...styles.tablaFila,
                        background: index % 2 === 0 ? "#F9F9F9" : "#FFFFFF",
                      }}
                    >
                      {columns.map((col) => (
                        <div
                          key={col.key}
                          style={{
                            padding: "12px",
                            width: col.width,
                            textAlign: col.key === "acciones" ? "center" : "left",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {col.render
                            ? col.render(nota)
                            : col.key === "monto_total" && nota[col.key]
                            ? `${Number(nota[col.key]).toLocaleString("es-PY")} Gs.`
                            : nota[col.key]}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  pagina: {
    display: "flex",
    minHeight: "100vh",
    background: "#F5F5F5",
  },
  contenido: {
    flex: 1,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflowY: "auto",
  },
  encabezado: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "21px 0",
    marginBottom: 20,
  },
  titulo: {
    color: "#000000",
    fontSize: 42,
    fontFamily: "Lato, sans-serif",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textAlign: "center",
  },
  separador: {
    width: "min(1100px, 80%)",
    height: 4,
    background: "#000000",
  },
  controles: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
    width: "100%",
  },
  grupoControles: {
    display: "flex",
    gap: 12,
    flex: 1,
    minWidth: 400,
  },
  buscador: {
    flex: 1,
    minWidth: 300,
    padding: "10px 15px",
    border: "1px solid #CCCCCC",
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "Lato, sans-serif",
    outline: "none",
    background: "#FFFFFF",
  },
  select: {
    padding: "10px 12px",
    border: "1px solid #CCCCCC",
    borderRadius: 6,
    fontSize: 13,
    background: "#FFFFFF",
  },
  botonFacturas: {
    padding: "10px 20px",
    background: getColor("amarillo"),
    border: "none",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease",
  },
  tabla: {
    background: "#FFFFFF",
    borderRadius: 12,
    border: "1px solid #CCCCCC",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
  },
  tablaHeader: {
    display: "flex",
    background: getColor("amarillo"),
    borderBottom: "2px solid #333333",
    fontWeight: "700",
    fontSize: 13,
    color: "#000000",
    width: "100%",
  },
  tablaFila: {
    display: "flex",
    borderBottom: "1px solid #E0E0E0",
  },
};

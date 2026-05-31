import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { IconoLupa } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function Facturas({ usuario, onNavegar, onLogout }) {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [orden, setOrden] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleVerFactura = (factura, e) => {
    if (e) e.stopPropagation();
    const idFactura = factura?.id_factura ?? factura?.id;
    if (!idFactura) return;
    navigate(`/ventas/facturas/${idFactura}`);
  };

  useEffect(() => {
    const cargarFacturas = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchConToken(`${API_BASE}/ventas/facturas`);
        
        if (!response.ok && response.status === 404) {
          setFacturas([]);
          setLoading(false);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setFacturas([]);
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudieron cargar las facturas");
        }

        setFacturas((Array.isArray(data) ? data : data.facturas || []).map((f) => ({
           ...f,
           estado: f.estados?.nombre || f.estado || "",
           cliente: f.clientes?.personas?.nombre ? `${f.clientes.personas.nombre} ${f.clientes.personas.apellido || ""}`.trim() : "",
           numero_factura: f.codigo_factura || f.nro_factura || `FC-V-${String(f.id_factura).padStart(4, '0')}`,
           presupuesto: f.id_presupuesto ? `PRE-${String(f.id_presupuesto).padStart(6, '0')}` : "-",
           total: f.importe_total ? `${Number(f.importe_total).toLocaleString('es-PY')} Gs.` : "0 Gs.",
           fecha: f.fecha_emision ? new Date(f.fecha_emision).toLocaleDateString('es-ES') : ""
        })));
      } catch (err) {
        console.error("Error cargando facturas:", err);
        setFacturas([]);
      } finally {
        setLoading(false);
      }
    };

    cargarFacturas();
  }, []);

   const facturasFiltradas = facturas
     .filter((f) => {
       const texto = busqueda.toLowerCase();
       return (
         (f.numero_factura || "").toLowerCase().includes(texto) ||
         (f.estado || "").toLowerCase().includes(texto) ||
         (f.fecha || "").toLowerCase().includes(texto) ||
         (f.cliente || "").toLowerCase().includes(texto)
       );
     })
     .filter((f) => (!filtroEstado ? true : f.estado === filtroEstado))
     .sort((a, b) => {
       if (orden === "fechaDesc") return new Date(b.fecha) - new Date(a.fecha);
       if (orden === "fechaAsc") return new Date(a.fecha) - new Date(b.fecha);
       if (orden === "codigo") return (a.numero_factura || "").localeCompare(b.numero_factura || "");
       return 0;
     });

  const getEstadoColor = (estado) => {
    if (estado === "Anulada") return "#E74C3C";
    if (estado === "Confirmado") return "#27AE60";
    if (estado === "Pendiente") return "#F39C12";
    if (estado === "Pagada") return "#3498DB";
    return "#000000";
  };

   const columns = [
     { key: "numero_factura", label: "Número", width: "11%" },
     { key: "cliente", label: "Cliente", width: "20%" },
     { key: "fecha", label: "Fecha", width: "13%" },
     { key: "presupuesto", label: "Presupuesto", width: "13%" },
     { key: "total", label: "Total", width: "17%" },
     {
       key: "estado",
       label: "Estado",
       width: "13%",
       render: (factura) => (
         <span style={{ color: getEstadoColor(factura.estado), fontWeight: "600" }}>
           {factura.estado}
         </span>
       )
     },
     {
       key: "acciones",
       label: "Acciones",
       width: "13%",
       render: (factura) => (
         <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
           <button
             onClick={(e) => handleVerFactura(factura, e)}
             style={{
               background: "none",
               border: "none",
               cursor: "pointer",
               display: "flex",
               justifyContent: "center",
               padding: 0
             }}
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
          <h1 style={styles.titulo}>Facturas</h1>
          <div style={styles.separador} />
        </header>

        <div style={{ width: "100%", maxWidth: 1100 }}>
          {loading && <div>Cargando facturas...</div>}
          {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

          {!loading && !error && (
            <>
              <div style={styles.controles}>
                <div style={styles.grupoControles}>
                  <input
                    type="text"
                    placeholder="Buscar por número, cliente o documento..."
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
                  <option value="Emitida">Emitida</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagada">Pagada</option>
                  <option value="Anulada">Anulada</option>
                </select>

                  <select
                    value={orden}
                    onChange={(e) => setOrden(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Ordenar por:</option>
                    <option value="fechaDesc">Más recientes</option>
                    <option value="fechaAsc">Más antiguos</option>
                    <option value="codigo">Número</option>
                  </select>
                </div>

                <button
                  onClick={() => navigate("/ventas/presupuestos")}
                  style={styles.botonNuevo}
                >
                  Ir a Presupuestos
                </button>
              </div>

              <div style={styles.tabla}>
                <div style={styles.tablaHeader}>
                  {columns.map((col) => (
                    <div 
                      key={col.key} 
                      style={{ 
                        padding: "12px 15px",
                        fontWeight: "700",
                        width: col.width,
                        textAlign: col.key === "acciones" ? "center" : "left"
                      }}
                    >
                      {col.label}
                    </div>
                  ))}
                </div>

                {facturasFiltradas.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                    No hay facturas para mostrar
                  </div>
                ) : (
                  facturasFiltradas.map((factura, index) => (
                    <div
                      key={factura.id_factura}
                      style={{
                        ...styles.tablaFila,
                        background: index % 2 === 0 ? "#F9F9F9" : "#FFFFFF",
                        cursor: "pointer"
                      }}
                      onClick={(e) => handleVerFactura(factura, e)}
                    >
                      {columns.map((col) => (
                        <div 
                          key={col.key} 
                          style={{ 
                            padding: "12px 15px",
                            width: col.width,
                            textAlign: col.key === "acciones" ? "center" : "left",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {col.render ? col.render(factura) : factura[col.key]}
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
    background: "#F5F5F5"
  },
  contenido: {
    flex: 1,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflowY: "auto"
  },
  encabezado: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "21px 0",
    marginBottom: 20
  },
  titulo: {
    color: "#000000",
    fontSize: 42,
    fontFamily: "Lato, sans-serif",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textAlign: "center"
  },
  separador: {
    width: "min(1100px, 80%)",
    height: 4,
    background: "#000000"
  },
  controles: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
    width: "100%"
  },
  grupoControles: {
    display: "flex",
    gap: 12,
    flex: 1,
    minWidth: 400
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
    background: "#FFFFFF"
  },
  select: {
    padding: "10px 12px",
    border: "1px solid #CCCCCC",
    borderRadius: 6,
    fontSize: 13,
    background: "#FFFFFF"
  },
  botonNuevo: {
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
    transition: "all 0.2s ease"
  },
  tabla: {
    background: "#FFFFFF",
    borderRadius: 12,
    border: "1px solid #CCCCCC",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
    overflow: "hidden"
  },
  tablaHeader: {
    display: "flex",
    background: getColor("amarillo"),
    borderBottom: "2px solid #333333",
    fontWeight: "700",
    fontSize: 13,
    color: "#000000",
    width: "100%"
  },
  tablaFila: {
    display: "flex",
    borderBottom: "1px solid #E0E0E0"
  }
};

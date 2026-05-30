import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import List from "../../../components/Lista";
import { IconoLupa } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function Presupuestos({ usuario, onNavegar, onLogout }) {
  const navigate = useNavigate();
  const [presupuestos, setPresupuestos] = useState([]);
  const [facturasMap, setFacturasMap] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [orden, setOrden] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleVerPresupuesto = (presupuesto, e) => {
    if (e) e.stopPropagation();
    const idPresupuesto = presupuesto?.id_presupuesto ?? presupuesto?.id;
    if (!idPresupuesto) return;
    navigate(`/ventas/presupuestos/${idPresupuesto}`);
  };

  useEffect(() => {
    const cargarPresupuestos = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchConToken(`${API_BASE}/ventas/presupuestos`);
        
        if (!response.ok && response.status === 404) {
          setPresupuestos([]);
          setLoading(false);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setPresupuestos([]);
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudieron cargar los presupuestos");
        }

        const presupuestosData = Array.isArray(data) ? data : data.presupuestos || [];
        console.log("Presupuestos recibidos:", presupuestosData);
        setPresupuestos(presupuestosData);

        // Cargar facturas para verificar qué presupuestos tienen factura
        try {
          const facturasResponse = await fetchConToken(`${API_BASE}/ventas/facturas`);
          if (facturasResponse.ok) {
            const facturasData = await facturasResponse.json();
            const facturas = Array.isArray(facturasData) ? facturasData : facturasData.facturas || [];
            const mapa = {};
            facturas.forEach((f) => {
              if (f.id_presupuesto) {
                mapa[f.id_presupuesto] = f;
              }
            });
            setFacturasMap(mapa);
          }
        } catch (err) {
          console.error("Error cargando facturas:", err);
        }
      } catch (err) {
        console.error("Error cargando presupuestos:", err);
        setPresupuestos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarPresupuestos();
  }, []);

   const presupuestosFiltrados = presupuestos
     .filter((p) => {
       const texto = busqueda.toLowerCase();
       return (
         (p.codigo_presupuesto || "").toLowerCase().includes(texto) ||
         (p.estado || "").toLowerCase().includes(texto) ||
         (p.fecha_creacion || "").toLowerCase().includes(texto) ||
         (p.cliente || "").toLowerCase().includes(texto)
       );
     })
     .filter((p) => (!filtroEstado ? true : p.estado === filtroEstado))
     .sort((a, b) => {
       if (orden === "fechaDesc") return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
       if (orden === "fechaAsc") return new Date(a.fecha_creacion) - new Date(b.fecha_creacion);
       if (orden === "codigo") return (a.codigo_presupuesto || "").localeCompare(b.codigo_presupuesto || "");
       return 0;
     });

  const getEstadoColor = (estado) => {
    if (estado === "Anulado") return "#E74C3C";
    if (estado === "Confirmado") return "#27AE60";
    if (estado === "Pendiente") return "#F39C12";
    if (estado === "Borrador") return "#95A5A6";
    return "#000000";
  };

  const isPresupuestoVigente = (presupuesto) => {
    if (!presupuesto.valido_hasta) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const validoHasta = new Date(presupuesto.valido_hasta);
    validoHasta.setHours(0, 0, 0, 0);
    return hoy <= validoHasta;
  };

   const columns = [
     { key: "codigo_presupuesto", label: "Número", width: "12%" },
     { key: "cliente", label: "Cliente", width: "18%" },
     { key: "fecha_creacion", label: "Fecha", width: "14%" },
     { key: "valido_hasta", label: "Válido Hasta", width: "14%" },
     { key: "total", label: "Total", width: "16%" },
     {
       key: "estado",
       label: "Estado",
       width: "14%",
       render: (presupuesto) => (
         <span style={{ color: getEstadoColor(presupuesto.estado), fontWeight: "600" }}>
           {presupuesto.estado}
         </span>
       )
     },
     {
       key: "acciones",
       label: "Acciones",
       width: "12%",
       render: (presupuesto) => {
         const tieneFactura = facturasMap[presupuesto.id_presupuesto];
         
         return (
           <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
             <button
               onClick={(e) => handleVerPresupuesto(presupuesto, e)}
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
             
             {presupuesto.estado === "Confirmado" && tieneFactura ? (
               <button
                 onClick={() => navigate(`/ventas/facturas/${tieneFactura.id_factura}`)}
                 style={{
                   padding: "6px 12px",
                   background: getColor("amarillo"),
                   border: "none",
                   borderRadius: 4,
                   cursor: "pointer",
                   fontSize: 12,
                   fontWeight: "700",
                   color: "#000000"
                 }}
               >
                 Ver Factura
               </button>
             ) : presupuesto.estado === "Pendiente" ? (
               <button
                 onClick={() => navigate(`/ventas/presupuestos/${presupuesto.id_presupuesto}/nueva-factura`)}
                 style={{
                   padding: "6px 12px",
                   background: getColor("amarillo"),
                   border: "none",
                   borderRadius: 4,
                   cursor: "pointer",
                   fontSize: 12,
                   fontWeight: "700",
                   color: "#000000"
                 }}
               >
                 Crear Factura
               </button>
             ) : null}
           </div>
         );
       }
     }
  ];

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Presupuestos</h1>
          <div style={styles.separador} />
        </header>

        <div style={{ width: "100%", maxWidth: 1100 }}>
          {loading && <div>Cargando presupuestos...</div>}
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
                    <option value="codigo">Código</option>
                  </select>
                </div>

                <button
                  onClick={() => navigate("/ventas/presupuestos/nuevo")}
                  style={styles.botonNuevo}
                >
                  Nuevo Presupuesto
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
                        textAlign: col.key === "acciones" ? "center" : "left"
                      }}
                    >
                      {col.label}
                    </div>
                  ))}
                </div>

                {presupuestosFiltrados.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                    No hay presupuestos para mostrar
                  </div>
                ) : (
                  presupuestosFiltrados.map((presupuesto, index) => (
                    <div
                      key={presupuesto.id_presupuesto}
                      style={{
                        ...styles.tablaFila,
                        background: index % 2 === 0 ? "#F9F9F9" : "#FFFFFF"
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
                            textOverflow: "ellipsis"
                          }}
                        >
                          {col.render
                            ? col.render(presupuesto)
                            : (col.key === "total" && presupuesto[col.key])
                            ? `${Number(presupuesto[col.key]).toLocaleString('es-PY')} Gs.`
                            : presupuesto[col.key]}
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

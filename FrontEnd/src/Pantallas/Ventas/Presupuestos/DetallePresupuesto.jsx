import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { IconoLupa, IconoSalir } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function DetallePresupuesto({ usuario, onNavegar, onLogout }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [presupuesto, setPresupuesto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPresupuesto = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchConToken(
          `${API_BASE}/ventas/presupuestos/${id}`,
        );

        if (!response.ok && response.status === 404) {
          setPresupuesto(null);
          setLoading(false);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setPresupuesto(null);
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudo cargar el presupuesto");
        }

        const presupuestoData = data.presupuesto || data;

        const resDetalles = await fetchConToken(
          `${API_BASE}/ventas/presupuestos/${id}/detalle`,
        );
        if (resDetalles.ok) {
          const detallesData = await resDetalles.json();
          presupuestoData.detalles = Array.isArray(detallesData)
            ? detallesData
            : detallesData.detalle || detallesData.detalles || [];
        }

        setPresupuesto(presupuestoData);
      } catch (err) {
        console.error("Error cargando presupuesto:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) cargarPresupuesto();
  }, [id]);

  const getEstadoBadge = (estado) => {
    if (estado === "Anulado")
      return { bg: "#FFE0E0", color: "#E74C3C", border: "#FF6B6B" };
    if (estado === "Confirmado")
      return { bg: "#E0F7E0", color: "#27AE60", border: "#7ED321" };
    if (estado === "Pendiente")
      return { bg: "#FFF8DC", color: "#F39C12", border: "#FFB700" };
    if (estado === "Borrador")
      return { bg: "#E8E8E8", color: "#666", border: "#999" };
    return { bg: "#F5F5F5", color: "#333", border: "#CCC" };
  };

  const calcularTotales = () => {
    if (!presupuesto || !presupuesto.detalles) {
      return { subtotal: 0, iva: 0, total: 0 };
    }
    const subtotal = presupuesto.detalles.reduce((acc, d) => {
      const precio = Number(d.precio_unitario || 0);
      const cantidad = Number(d.cantidad || 0);
      return acc + precio * cantidad;
    }, 0);
    const iva = subtotal * 0.1;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const totales = calcularTotales();

  const handleDescargar = () => {
    if (!presupuesto) return;

    const filas = (presupuesto.detalles || [])
      .map(
        (item) => `
        <tr>
          <td>${item.producto || "-"}</td>
          <td style="text-align:center">${item.cantidad || 0}</td>
          <td style="text-align:right">
            ${Number(item.precio_unitario || 0).toLocaleString("es-PY")} Gs.
          </td>
          <td style="text-align:right">
            ${Number(item.subtotal || 0).toLocaleString("es-PY")} Gs.
          </td>
        </tr>
      `,
      )
      .join("");

    const clienteNombre = presupuesto.cliente?.nombre
      ? `${presupuesto.cliente.nombre} ${presupuesto.cliente.apellido || ""}`.trim()
      : "-";

    const fechaCreacion = presupuesto.fecha_creacion
      ? new Date(presupuesto.fecha_creacion).toLocaleDateString("es-PY")
      : presupuesto.fecha
        ? new Date(presupuesto.fecha).toLocaleDateString("es-PY")
        : "-";

    const validoHasta = presupuesto.valido_hasta
      ? new Date(presupuesto.valido_hasta).toLocaleDateString("es-PY")
      : "-";

    const ventana = window.open("", "_blank", "width=1000,height=800");

    ventana.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Presupuesto ${presupuesto.codigo_presupuesto || ""}</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #222;
          }

          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }

          .header h1 {
            margin: 0;
          }

          .info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 25px;
          }

          .campo {
            margin-bottom: 10px;
          }

          .label {
            font-size: 12px;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
          }

          .valor {
            margin-top: 4px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }

          th {
            background: #f2f2f2;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 10px;
          }

          .totales {
            width: 350px;
            margin-left: auto;
            margin-top: 20px;
          }

          .fila-total {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
          }

          .gran-total {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid black;
            margin-top: 8px;
            padding-top: 8px;
          }

          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>

      <body>

        <div class="header">
          <div>
            <h1>PRESUPUESTO</h1>
          </div>

          <div>
            <strong>${presupuesto.codigo_presupuesto || presupuesto.codigo || "-"}</strong>
          </div>
        </div>

        <div class="info">
          <div class="campo">
            <div class="label">Cliente</div>
            <div class="valor">${clienteNombre}</div>
          </div>

          <div class="campo">
            <div class="label">CI / RUC</div>
            <div class="valor">${presupuesto.cliente?.ci || "-"}</div>
          </div>

          <div class="campo">
            <div class="label">Fecha</div>
            <div class="valor">${fechaCreacion}</div>
          </div>

          <div class="campo">
            <div class="label">Válido hasta</div>
            <div class="valor">${validoHasta}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            ${filas}
          </tbody>
        </table>

        <div class="totales">
          <div class="fila-total">
            <span>Subtotal:</span>
            <span>${Number(totales.subtotal).toLocaleString("es-PY")} Gs.</span>
          </div>

          <div class="fila-total">
            <span>IVA (10%):</span>
            <span>${Number(totales.iva).toLocaleString("es-PY")} Gs.</span>
          </div>

          <div class="fila-total gran-total">
            <span>Total:</span>
            <span>${Number(totales.total).toLocaleString("es-PY")} Gs.</span>
          </div>
        </div>

      </body>
    </html>
  `);

    ventana.document.close();

    setTimeout(() => {
      ventana.focus();
      ventana.print();
    }, 300);
  };

  const estadoBadge = presupuesto ? getEstadoBadge(presupuesto.estado) : {};

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <div style={styles.headerTop}>
            <button
              onClick={() => navigate("/ventas/presupuestos")}
              style={styles.botonVolver}
            >
              <IconoSalir />
            </button>
            <h1 style={styles.titulo}>
              {presupuesto?.codigo ||
                presupuesto?.codigo_presupuesto ||
                "Cargando..."}
            </h1>
            <div style={{ width: 40 }} />
          </div>
          <div style={styles.separador} />
        </header>

        {loading && <div>Cargando presupuesto...</div>}
        {error && <div style={{ color: "red", marginBottom: 20 }}>{error}</div>}

        {!loading && !error && presupuesto && (
          <div style={styles.contenedor}>
            <div style={styles.columnaIzq}>
              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>Datos del Cliente</h3>

                <div style={styles.datosFila}>
                  <div style={styles.datoGrupo}>
                    <label style={styles.datoLabel}>Nombre Completo</label>
                    <p style={styles.datoValor}>
                      {presupuesto.cliente?.nombre
                        ? `${presupuesto.cliente.nombre} ${presupuesto.cliente.apellido || ""}`.trim()
                        : "-"}
                    </p>
                  </div>
                  <div style={styles.datoGrupo}>
                    <label style={styles.datoLabel}>CI/RUC</label>
                    <p style={styles.datoValor}>
                      {presupuesto.cliente?.ci || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>Productos y Servicios</h3>

                <div style={styles.tablaProductos}>
                  <div style={styles.tablaHeaderProducto}>
                    <div style={{ width: "45%" }}>Producto</div>
                    <div style={{ width: "15%", textAlign: "center" }}>
                      Cantidad
                    </div>
                    <div style={{ width: "20%", textAlign: "right" }}>
                      Precio Unitario
                    </div>
                    <div style={{ width: "20%", textAlign: "right" }}>
                      Subtotal
                    </div>
                  </div>

                  {presupuesto.detalles && presupuesto.detalles.length > 0 ? (
                    presupuesto.detalles.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          ...styles.tablaFilaProducto,
                          background: idx % 2 === 0 ? "#F9F9F9" : "#FFFFFF",
                        }}
                      >
                        <div style={{ width: "45%" }}>
                          {item.producto || "-"}
                        </div>
                        <div style={{ width: "15%", textAlign: "center" }}>
                          {item.cantidad}
                        </div>
                        <div style={{ width: "20%", textAlign: "right" }}>
                          {Number(item.precio_unitario || 0).toLocaleString(
                            "es-PY",
                          )}{" "}
                          Gs.
                        </div>
                        <div
                          style={{
                            width: "20%",
                            textAlign: "right",
                            fontWeight: "600",
                          }}
                        >
                          {Number(item.subtotal || 0).toLocaleString("es-PY")}{" "}
                          Gs.
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#999",
                      }}
                    >
                      No hay productos en este presupuesto
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.columnaDer}>
              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>Resumen:</h3>

                <div style={styles.filaResumen}>
                  <span>Fecha:</span>
                  <span style={{ fontWeight: "600" }}>
                    {presupuesto.fecha_creacion
                      ? new Date(presupuesto.fecha_creacion).toLocaleDateString(
                          "es-ES",
                        )
                      : presupuesto.fecha
                        ? new Date(presupuesto.fecha).toLocaleDateString(
                            "es-ES",
                          )
                        : "-"}
                  </span>
                </div>

                <div style={styles.filaResumen}>
                  <span>Válido hasta:</span>
                  <span style={{ fontWeight: "600" }}>
                    {presupuesto.valido_hasta
                      ? new Date(presupuesto.valido_hasta).toLocaleDateString(
                          "es-ES",
                        )
                      : "-"}
                  </span>
                </div>

                <div style={styles.filaResumen}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: "600" }}>
                    {Number(totales.subtotal || 0).toLocaleString("es-PY")} Gs.
                  </span>
                </div>

                <div style={styles.filaResumen}>
                  <span>IVA (10%):</span>
                  <span style={{ fontWeight: "600" }}>
                    {Number(totales.iva || 0).toLocaleString("es-PY")} Gs.
                  </span>
                </div>

                <div style={styles.filaResumenTotal}>
                  <span>Total:</span>
                  <span>
                    {Number(totales.total || 0).toLocaleString("es-PY")} Gs.
                  </span>
                </div>

                {presupuesto.estado === "Pendiente" && (
                  <div
                    style={{
                      ...styles.estadoBadge,
                      background: estadoBadge.bg,
                      borderColor: estadoBadge.border,
                      color: estadoBadge.color,
                    }}
                  >
                    <strong>PRESUPUESTO PENDIENTE</strong>
                    <p style={{ margin: "8px 0 0 0", fontSize: 11 }}>
                      Válido hasta el{" "}
                      {presupuesto.valido_hasta
                        ? new Date(presupuesto.valido_hasta).toLocaleDateString(
                            "es-ES",
                          )
                        : "-"}
                    </p>
                  </div>
                )}

                <button onClick={handleDescargar} style={styles.botonDescargar}>
                  Imprimir Presupuesto
                </button>

                {presupuesto.estado === "Pendiente" && (
                  <button
                    onClick={() =>
                      navigate(`/ventas/presupuestos/${id}/nueva-factura`)
                    }
                    style={styles.botonCrearFactura}
                  >
                    Crear Factura
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
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
    padding: 24,
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
    gap: 12,
    padding: "24px 0",
    marginBottom: 24,
  },
  headerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 20,
    position: "relative",
  },
  botonVolver: {
    position: "absolute",
    left: 0,
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    fontSize: 20,
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
    width: "min(1200px, 90%)",
    height: 4,
    background: "#000000",
  },
  contenedor: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: 24,
    width: "100%",
    maxWidth: 1200,
  },
  columnaIzq: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  columnaDer: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  card: {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    border: "1px solid #CCCCCC",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 18px 0",
    textAlign: "center",
    borderBottom: "2px solid #E0E0E0",
    paddingBottom: 12,
  },
  datosFila: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 16,
  },
  datoGrupo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  datoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  datoValor: {
    fontSize: 13,
    color: "#333333",
    margin: 0,
    fontWeight: "500",
  },
  tablaProductos: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tablaHeaderProducto: {
    display: "flex",
    background: getColor("amarillo"),
    padding: "12px 16px",
    fontWeight: "700",
    fontSize: 12,
    color: "#000000",
    borderBottom: "1px solid #D0D0D0",
  },
  tablaFilaProducto: {
    display: "flex",
    padding: "12px 16px",
    borderBottom: "1px solid #E0E0E0",
    fontSize: 12,
    alignItems: "center",
  },
  filaResumen: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #E0E0E0",
    fontSize: 13,
  },
  filaResumenTotal: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 0",
    borderTop: "2px solid #333333",
    borderBottom: "2px solid #333333",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  estadoBadge: {
    background: "#FFF8DC",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 12,
    border: "2px solid #FFB700",
    textAlign: "center",
    fontWeight: "700",
  },
  botonDescargar: {
    width: "100%",
    padding: "13px",
    background: "#F0F0F0",
    border: "1px solid #CCCCCC",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: "700",
    cursor: "pointer",
    color: "#000000",
    transition: "all 0.2s ease",
    marginBottom: 12,
  },
  botonCrearFactura: {
    width: "100%",
    padding: "13px",
    background: getColor("amarillo"),
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: "700",
    cursor: "pointer",
    color: "#000000",
    transition: "all 0.2s ease",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
};

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { IconoSalir } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function DetalleNotaCredito({ usuario, onNavegar, onLogout }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [nc, setNc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarNC = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchConToken(
          `${API_BASE}/ventas/notas-credito/${id}`,
        );

        if (!response.ok && response.status === 404) {
          setNc(null);
          setLoading(false);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setNc(null);
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudo cargar la nota de crédito");
        }

        setNc(data);
      } catch (err) {
        console.error("Error cargando nota de crédito:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) cargarNC();
  }, [id]);

  const getEstadoBadge = (estado) => {
    if (estado === "Anulada")
      return { bg: "#FFE0E0", color: "#E74C3C", border: "#FF6B6B" };
    if (estado === "Emitida")
      return { bg: "#E0F7E0", color: "#27AE60", border: "#7ED321" };
    if (estado === "Pendiente")
      return { bg: "#FFF8DC", color: "#F39C12", border: "#FFB700" };
    return { bg: "#F5F5F5", color: "#333", border: "#CCC" };
  };

  const calcularTotales = () => {
    if (!nc || !nc.detalles_notas_credito_ventas) {
      return { subtotal: 0, iva: 0, total: 0 };
    }

    const subtotal = nc.detalles_notas_credito_ventas.reduce((acc, d) => {
      return acc + Number(d.subtotal || Number(d.precio_unitario || 0) * Number(d.cantidad || 0));
    }, 0);

    const iva = nc.detalles_notas_credito_ventas.reduce((acc, d) => {
      return acc + Number(d.monto_iva || 0);
    }, 0);

    const total = Number(nc.monto_total || subtotal + iva);
    return { subtotal, iva, total };
  };

  const totales = calcularTotales();

  const handleImprimir = () => {
    if (!nc) return;

    const fmtFecha = (f) =>
      f ? new Date(f).toLocaleDateString("es-ES") : "-";
    const fmtGs = (n) => Number(n || 0).toLocaleString("es-PY") + " Gs.";

    const cliente = nc.facturas_ventas?.clientes || {};
    const persona = cliente.personas || {};
    const nombreCliente =
      `${persona.nombre || ""} ${persona.apellido || ""}`.trim() || "-";

    const estadoNombre = nc.estados?.nombre || "-";

    const filas = (nc.detalles_notas_credito_ventas || [])
      .map((item, idx) => {
        const subtotalFila =
          Number(item.subtotal || 0) ||
          Number(item.precio_unitario || 0) * Number(item.cantidad || 0);
        return `
          <tr>
            <td style="text-align:center">${idx + 1}</td>
            <td>${item.productos?.codigo || item.id_producto || "-"}</td>
            <td>${item.productos?.nombre || "-"}</td>
            <td style="text-align:center">${item.cantidad || 0}</td>
            <td style="text-align:right">${fmtGs(item.precio_unitario)}</td>
            <td style="text-align:right">${fmtGs(item.monto_iva)}</td>
            <td style="text-align:right">${fmtGs(subtotalFila)}</td>
          </tr>
        `;
      })
      .join("");

    const ventana = window.open("", "_blank", "width=1000,height=900");

    ventana.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Nota de Crédito ${nc.nro_nota_credito || ""}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 30px 40px; color: #222; font-size: 12px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
          .empresa h2 { margin: 0 0 4px 0; font-size: 20px; }
          .empresa p { margin: 2px 0; font-size: 11px; color: #555; }
          .nc-box { border: 2px solid #000; padding: 10px 16px; text-align: center; min-width: 220px; }
          .nc-box .titulo { font-size: 18px; font-weight: bold; letter-spacing: 1px; }
          .nc-box .codigo { font-size: 16px; font-weight: bold; margin-top: 4px; }
          .nc-box .nro { font-size: 11px; color: #555; margin-top: 4px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .bloque { border: 1px solid #ccc; border-radius: 6px; padding: 12px 14px; }
          .bloque h3 { margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
          .bloque .row { display: flex; justify-content: space-between; padding: 3px 0; }
          .bloque .row span:first-child { color: #555; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #bbb; padding: 8px 10px; font-size: 11px; }
          th { background: #f2f2f2; text-align: left; }
          tbody tr:nth-child(even) { background: #fafafa; }
          .totales-wrap { display: flex; justify-content: space-between; margin-top: 20px; gap: 20px; }
          .obs { flex: 1; border: 1px dashed #aaa; border-radius: 6px; padding: 10px 12px; font-size: 11px; color: #555; }
          .totales { width: 320px; }
          .totales .fila { display: flex; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid #eee; }
          .totales .total { font-size: 16px; font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000; margin-top: 6px; padding: 10px; }
          .footer { margin-top: 35px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #555; }
          .firma { text-align: center; border-top: 1px solid #000; padding-top: 6px; width: 220px; }
          @media print { body { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="empresa">
            <h2>ERP Venta de Neumáticos</h2>
            <p>RUC: 80012345-6</p>
            <p>Dirección: Av. Siempre Viva 742, Springfield</p>
            <p>Tel: (021) 123-456 — sistemas@de.gestion</p>
          </div>
          <div class="nc-box">
            <div class="titulo">NOTA DE CRÉDITO</div>
            <div class="codigo">${nc.nro_nota_credito || "-"}</div>
            <div class="nro">Timbrado: ${nc.timbrado || "-"}</div>
            <div class="nro">Factura ref.: ${nc.facturas_ventas?.codigo_factura || "-"}</div>
          </div>
        </div>

        <div class="meta">
          <div class="bloque">
            <h3>Datos del Cliente</h3>
            <div class="row"><span>Nombre:</span><span>${nombreCliente}</span></div>
          </div>
          <div class="bloque">
            <h3>Datos del Documento</h3>
            <div class="row"><span>Fecha Emisión:</span><span>${fmtFecha(nc.fecha_emision)}</span></div>
            <div class="row"><span>Estado:</span><span>${estadoNombre}</span></div>
            <div class="row"><span>Motivo:</span><span>${nc.motivo || "-"}</span></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:5%; text-align:center">#</th>
              <th style="width:10%">Cód.</th>
              <th>Descripción</th>
              <th style="width:10%; text-align:center">Cant.</th>
              <th style="width:15%; text-align:right">Precio Unit.</th>
              <th style="width:12%; text-align:right">IVA</th>
              <th style="width:15%; text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${filas || `<tr><td colspan="7" style="text-align:center; color:#999">Sin productos</td></tr>`}
          </tbody>
        </table>

        <div class="totales-wrap">
          <div class="obs">
            <strong>Motivo:</strong>
            <p style="margin: 6px 0 0 0;">${nc.motivo || "Sin observaciones."}</p>
          </div>
          <div class="totales">
            <div class="fila"><span>Subtotal:</span><span>${fmtGs(totales.subtotal)}</span></div>
            <div class="fila"><span>IVA (10%):</span><span>${fmtGs(totales.iva)}</span></div>
            <div class="total fila"><span>TOTAL A ACREDITAR:</span><span>${fmtGs(totales.total)}</span></div>
          </div>
        </div>

        <div class="footer">
          <div><p>Documento generado: ${new Date().toLocaleString("es-ES")}</p></div>
          <div class="firma">Firma autorizada</div>
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

  const estadoBadge = nc ? getEstadoBadge(nc.estados?.nombre) : { bg: "", color: "", border: "" };
  const idFactura = nc?.id_factura_venta;

  const clienteNombre = nc?.facturas_ventas?.clientes?.personas
    ? `${nc.facturas_ventas.clientes.personas.nombre || ""} ${nc.facturas_ventas.clientes.personas.apellido || ""}`.trim()
    : "-";

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <div style={styles.headerTop}>
            <button
              onClick={() => navigate("/ventas/notas-credito")}
              style={styles.botonVolver}
            >
              <IconoSalir />
            </button>
            <h1 style={styles.titulo}>
              {nc?.nro_nota_credito || "Cargando..."}
            </h1>
            <div style={{ width: 40 }} />
          </div>
          <div style={styles.separador} />
        </header>

        {loading && <div>Cargando nota de crédito...</div>}
        {error && <div style={{ color: "red", marginBottom: 20 }}>{error}</div>}

        {!loading && !error && nc && (
          <div style={styles.contenedor}>
            <div style={styles.columnaIzq}>
              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>Datos del Documento</h3>
                <div style={styles.datosFila}>
                  <div style={styles.datoGrupo}>
                    <label style={styles.datoLabel}>Cliente</label>
                    <p style={styles.datoValor}>{clienteNombre}</p>
                  </div>
                  <div style={styles.datoGrupo}>
                    <label style={styles.datoLabel}>Factura de Referencia</label>
                    <p style={styles.datoValor}>
                      {nc.facturas_ventas?.codigo_factura || "-"}
                      {idFactura && (
                        <button
                          onClick={() => navigate(`/ventas/facturas/${idFactura}`)}
                          style={styles.botonLinkFactura}
                        >
                          Ver factura
                        </button>
                      )}
                    </p>
                  </div>
                  <div style={styles.datoGrupo}>
                    <label style={styles.datoLabel}>Timbrado</label>
                    <p style={styles.datoValor}>{nc.timbrado || "-"}</p>
                  </div>
                  <div style={styles.datoGrupo}>
                    <label style={styles.datoLabel}>Motivo</label>
                    <p style={styles.datoValor}>{nc.motivo || "-"}</p>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>Ítems Acreditados</h3>

                <div style={styles.tablaProductos}>
                  <div style={styles.tablaHeaderProducto}>
                    <div style={{ width: "10%" }}>ID</div>
                    <div style={{ width: "30%" }}>Producto</div>
                    <div style={{ width: "12%", textAlign: "center" }}>Cantidad</div>
                    <div style={{ width: "18%", textAlign: "right" }}>Precio Unit.</div>
                    <div style={{ width: "15%", textAlign: "right" }}>IVA</div>
                    <div style={{ width: "15%", textAlign: "right" }}>Subtotal</div>
                  </div>

                  {nc.detalles_notas_credito_ventas &&
                  nc.detalles_notas_credito_ventas.length > 0 ? (
                    nc.detalles_notas_credito_ventas.map((item, idx) => {
                      const subtotalFila =
                        Number(item.subtotal || 0) ||
                        Number(item.precio_unitario || 0) * Number(item.cantidad || 0);
                      return (
                        <div
                          key={item.id_detalle_nc || idx}
                          style={{
                            ...styles.tablaFilaProducto,
                            background: idx % 2 === 0 ? "#F9F9F9" : "#FFFFFF",
                          }}
                        >
                          <div style={{ width: "10%" }}>
                            {item.productos?.id_producto || item.id_producto || "-"}
                          </div>
                          <div style={{ width: "30%" }}>
                            {item.productos?.nombre || "-"}
                          </div>
                          <div style={{ width: "12%", textAlign: "center" }}>
                            {item.cantidad}
                          </div>
                          <div style={{ width: "18%", textAlign: "right" }}>
                            {Number(item.precio_unitario || 0).toLocaleString("es-PY")} Gs.
                          </div>
                          <div style={{ width: "15%", textAlign: "right" }}>
                            {Number(item.monto_iva || 0).toLocaleString("es-PY")} Gs.
                          </div>
                          <div style={{ width: "15%", textAlign: "right", fontWeight: "600" }}>
                            {Number(subtotalFila).toLocaleString("es-PY")} Gs.
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                      No hay ítems en esta nota de crédito
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.columnaDer}>
              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>Resumen:</h3>

                <div style={styles.filaResumen}>
                  <span>Fecha Emisión:</span>
                  <span style={{ fontWeight: "600" }}>
                    {nc.fecha_emision
                      ? new Date(nc.fecha_emision).toLocaleDateString("es-ES")
                      : "-"}
                  </span>
                </div>

                <div style={styles.filaResumen}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: "600" }}>
                    {Number(totales.subtotal).toLocaleString("es-PY")} Gs.
                  </span>
                </div>

                <div style={styles.filaResumen}>
                  <span>IVA (10%):</span>
                  <span style={{ fontWeight: "600" }}>
                    {Number(totales.iva).toLocaleString("es-PY")} Gs.
                  </span>
                </div>

                <div style={styles.filaResumenTotal}>
                  <span>Total acreditado:</span>
                  <span>{Number(totales.total).toLocaleString("es-PY")} Gs.</span>
                </div>

                {nc.estados?.nombre && (
                  <div
                    style={{
                      ...styles.estadoBadge,
                      background: estadoBadge.bg,
                      borderColor: estadoBadge.border,
                      color: estadoBadge.color,
                    }}
                  >
                    <strong>{nc.estados.nombre.toUpperCase()}</strong>
                  </div>
                )}

                <button onClick={handleImprimir} style={styles.botonImprimir}>
                  Imprimir Nota de Crédito
                </button>

                {idFactura && (
                  <button
                    onClick={() => navigate(`/ventas/facturas/${idFactura}`)}
                    style={styles.botonVerFactura}
                  >
                    Ver Factura Original
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
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  botonLinkFactura: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#3498DB",
    fontSize: 12,
    textDecoration: "underline",
    padding: 0,
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
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 12,
    border: "2px solid",
    textAlign: "center",
    fontWeight: "700",
  },
  botonImprimir: {
    width: "100%",
    padding: "13px",
    background: "#F0F0F0",
    border: "1px solid #CCCCCC",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: "700",
    cursor: "pointer",
    color: "#000000",
    marginBottom: 12,
  },
  botonVerFactura: {
    width: "100%",
    padding: "13px",
    background: getColor("amarillo"),
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: "700",
    cursor: "pointer",
    color: "#000000",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
};
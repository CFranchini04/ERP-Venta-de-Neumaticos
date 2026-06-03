  import React, { useEffect, useState } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  import Sidebar from "../../../components/Sidebar";
  import { IconoFactura } from "../../../components/Icons";
  import { getColor } from "../../../components/Colors";
  import fetchConToken from "../../../token";

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

  export default function NuevaFactura({ usuario, onNavegar, onLogout }) {
    const { id: presupuestoId } = useParams();
    const navigate = useNavigate();
    
    const [presupuesto, setPresupuesto] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [timbrado, setTimbrado] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [generando, setGenerando] = useState(false);

    useEffect(() => {
      const cargarPresupuesto = async () => {
        try {
          setLoading(true);
          setError("");

          // Obtener presupuesto
          const resPresupuesto = await fetchConToken(
            `${API_BASE}/ventas/presupuestos/${presupuestoId}`
          );
          if (!resPresupuesto.ok) throw new Error("No se pudo cargar el presupuesto");
          const datosPresupuesto = await resPresupuesto.json();

          // Obtener detalles
          const resDetalles = await fetchConToken(
            `${API_BASE}/ventas/presupuestos/${presupuestoId}/detalle`
          );
          if (!resDetalles.ok) throw new Error("No se pudieron cargar los detalles");
          const datosDetalles = await resDetalles.json();

          setPresupuesto(datosPresupuesto);
          setDetalles(Array.isArray(datosDetalles) ? datosDetalles : []);
          setTimbrado(datosPresupuesto?.timbrado || "");
        } catch (err) {
          console.error("Error cargando presupuesto:", err);
          setError(err.message || "Error al cargar el presupuesto");
        } finally {
          setLoading(false);
        }
      };

      if (presupuestoId) cargarPresupuesto();
    }, [presupuestoId]);

    const calcularTotal = () => {
      return detalles.reduce((sum, d) => {
        const cantidad = Number(d.cantidad) || 0;
        const precio = parseFloat(d.precio_unitario) || 0;
        return sum + (cantidad * precio);
      }, 0);
    };

    const calcularIVA = () => {
      return calcularTotal() * 0.1; // 10% IVA
    };

    const total = calcularTotal();
    const iva = calcularIVA();
    const totalConIVA = total + iva;

    const handleGenerarFactura = async () => {
      try {
        setGenerando(true);
        setError("");

        if (!presupuesto?.id_presupuesto) {
          throw new Error("Presupuesto inválido");
        }

        if (detalles.length === 0) {
          throw new Error("No hay detalles para facturar");
        }

        if (!timbrado || timbrado === "") {
          throw new Error("El timbrado es requerido para crear la factura");
        }

        const fechaHoy = new Date().toISOString().split("T")[0];
        
        const numeroFactura = `FC-V-${String(presupuesto.id_presupuesto).padStart(4, "0")}`;

        const detallesValidos = detalles.filter(d => d.id_producto && d.cantidad && d.precio_unitario);
        
        if (detallesValidos.length === 0) {
          throw new Error("Los detalles no tienen los datos requeridos (id_producto, cantidad, precio_unitario)");
        }

        const datosFactura = {
          id_presupuesto: presupuesto.id_presupuesto,
          id_cliente: presupuesto.id_cliente || null,
          nro_factura: numeroFactura,
          codigo_factura: numeroFactura,
          fecha_emision: fechaHoy,
          fecha_vencimiento: fechaHoy,
          importe_total: totalConIVA,
          timbrado: Number(timbrado),
          id_estado: 2,
          detalles: detallesValidos.map((d) => ({
            id_producto: Number(d.id_producto),
            cantidad: Number(d.cantidad),
            precio_unitario: parseFloat(d.precio_unitario),
          })),
        };

        console.log("Enviando datos de factura:", datosFactura);

        const response = await fetchConToken(`${API_BASE}/ventas/facturas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosFactura),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Error al generar factura");
        }

        console.log("Respuesta factura:", result);

        let idFactura =
          result.id_factura_venta ??
          result.id_factura ??
          result.id ??
          result.factura?.id_factura_venta ??
          result.factura?.id_factura ??
          result.factura?.id;

        if (!idFactura && numeroFactura) {
          const resByCodigo = await fetchConToken(
            `${API_BASE}/ventas/facturas/codigo/${numeroFactura}`,
          );
          if (resByCodigo.ok) {
            const fac = await resByCodigo.json();
            idFactura = fac.id_factura_venta ?? fac.id_factura ?? fac.id;
          }
        }

        if (!idFactura) {
          throw new Error("No se pudo obtener el ID de la factura recién creada");
        }

        navigate(`/ventas/facturas/${idFactura}`);
      } catch (err) {
        console.error("Error generando factura:", err);
        setError(err.message || "Error al generar la factura");
      } finally {
        setGenerando(false);
      }
    };

    if (loading) {
      return (
        <div style={styles.pagina}>
          <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />
          <main style={styles.contenido}>
            <div>Cargando presupuesto...</div>
          </main>
        </div>
      );
    }

    if (!presupuesto) {
      return (
        <div style={styles.pagina}>
          <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />
          <main style={styles.contenido}>
            <div style={{ color: "red" }}>Presupuesto no encontrado</div>
            <button onClick={() => navigate("/ventas/presupuestos")}>
              Volver a Presupuestos
            </button>
          </main>
        </div>
      );
    }

    return (
      <div style={styles.pagina}>
        <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

        <main style={styles.contenido}>
          <header style={styles.encabezado}>
            <h1 style={styles.titulo}>Nueva Factura</h1>
            <div style={styles.separador} />
          </header>

          <div style={styles.contenedorPrincipal}>
            {error && (
              <div style={{ ...styles.alerta, background: "#FFEBEE", color: "#C62828", marginBottom: 20 }}>
                {error}
              </div>
            )}

            {/* Sección: Datos del Cliente */}
            <div style={styles.seccion}>
              <h2 style={styles.tituloSeccion}>Datos del Cliente</h2>
              <div style={styles.gridDatos}>
                <div style={styles.campo}>
                  <label style={styles.etiqueta}>Nombre Completo</label>
                  <div style={styles.valor}>
                    {presupuesto.cliente
                      ? `${presupuesto.cliente.nombre || ""} ${presupuesto.cliente.apellido || ""}`.trim()
                      : "-"}
                  </div>
                </div>
                <div style={styles.campo}>
                  <label style={styles.etiqueta}>Cédula/RUC</label>
                  <div style={styles.valor}>{presupuesto.cliente?.ci || "-"}</div>
                </div>
                <div style={styles.campo}>
                  <label style={styles.etiqueta}>Fecha de Presupuesto</label>
                  <div style={styles.valor}>{presupuesto.fecha || "-"}</div>
                </div>
                <div style={styles.campo}>
                  <label style={styles.etiqueta}>Timbrado *</label>
                  <input
                    type="text"
                    value={timbrado}
                    onChange={(e) => setTimbrado(e.target.value)}
                    placeholder={presupuesto?.timbrado ? String(presupuesto.timbrado) : "sin timbrado"}
                    style={{
                      ...styles.input,
                      borderColor: !timbrado ? "#C62828" : "#ccc",
                      backgroundColor: !timbrado ? "#FFF3E0" : "#FFF"
                    }}
                  />
                  {!timbrado && (
                    <div style={{ color: "#C62828", fontSize: 12, marginTop: 5 }}>
                      El cliente no tiene timbrado asignado
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Productos y Servicios */}
            <div style={styles.seccion}>
              <h2 style={styles.tituloSeccion}>Productos y Servicios</h2>
              <div style={styles.tablaProductos}>
                <div style={styles.filaHeader}>
                  <div style={{ ...styles.celda, fontWeight: "700", width: "40%" }}>
                    Producto
                  </div>
                  <div style={{ ...styles.celda, fontWeight: "700", width: "15%", textAlign: "center" }}>
                    Cantidad
                  </div>
                  <div style={{ ...styles.celda, fontWeight: "700", width: "20%", textAlign: "right" }}>
                    Precio Unitario
                  </div>
                  <div style={{ ...styles.celda, fontWeight: "700", width: "25%", textAlign: "right" }}>
                    Subtotal
                  </div>
                </div>
                {detalles.map((detalle, idx) => {
                  const cantidad = Number(detalle.cantidad) || 0;
                  const precio = parseFloat(detalle.precio_unitario) || 0;
                  const subtotal = cantidad * precio;
                  return (
                    <div key={idx} style={{ ...styles.fila, background: idx % 2 === 0 ? "#F9F9F9" : "#FFF" }}>
                      <div style={{ ...styles.celda, width: "40%" }}>
                        {detalle.producto}
                      </div>
                      <div style={{ ...styles.celda, width: "15%", textAlign: "center" }}>
                        {cantidad}
                      </div>
                      <div style={{ ...styles.celda, width: "20%", textAlign: "right" }}>
                        {Number(precio).toLocaleString("es-PY")} Gs.
                      </div>
                      <div style={{ ...styles.celda, width: "25%", textAlign: "right" }}>
                        {Number(subtotal).toLocaleString("es-PY")} Gs.
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sección: Resumen */}
            <div style={styles.seccionResumen}>
              <h2 style={styles.tituloSeccion}>Resumen</h2>
              <div style={styles.resumenDatos}>
                <div style={styles.filaDato}>
                  <span>Subtotal:</span>
                  <span style={styles.valor}>{Number(total).toLocaleString("es-PY")} Gs.</span>
                </div>
                <div style={styles.filaDato}>
                  <span>IVA (10%):</span>
                  <span style={styles.valor}>{Number(iva).toLocaleString("es-PY")} Gs.</span>
                </div>
                <div style={{ ...styles.filaDato, ...styles.filaDatoTotal }}>
                  <span style={{ fontWeight: "700", fontSize: 16 }}>Total:</span>
                  <span style={{ ...styles.valor, fontWeight: "700", fontSize: 18, color: getColor("amarillo") }}>
                    {Number(totalConIVA).toLocaleString("es-PY")} Gs.
                  </span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div style={styles.botonesContainer}>
              <button
                onClick={() => navigate("/ventas/presupuestos")}
                style={styles.botonCancelar}
                disabled={generando}
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerarFactura}
                style={styles.botonGenerar}
                disabled={generando || detalles.length === 0 || !timbrado}
              >
                {generando ? "Generando..." : "Generar Factura"}
              </button>
            </div>
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
      margin: 0,
    },
    separador: {
      width: "min(1100px, 80%)",
      height: 1,
      background: "#000000",
    },
    contenedorPrincipal: {
      width: "100%",
      maxWidth: 1100,
      display: "flex",
      flexDirection: "column",
      gap: 20,
    },
    seccion: {
      background: "#FFFFFF",
      border: "1px solid #CCCCCC",
      borderRadius: 12,
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    seccionResumen: {
      background: "#FFFFFF",
      border: "1px solid #CCCCCC",
      borderRadius: 12,
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    tituloSeccion: {
      fontSize: 18,
      fontWeight: "700",
      margin: "0 0 16px 0",
      color: "#333333",
    },
    gridDatos: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },
    campo: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
    },
    etiqueta: {
      fontSize: 12,
      fontWeight: "600",
      color: "#666666",
    },
    valor: {
      fontSize: 14,
      color: "#333333",
      padding: "8px 0",
    },
    tablaProductos: {
      border: "1px solid #CCCCCC",
      borderRadius: 8,
      overflow: "hidden",
    },
    filaHeader: {
      display: "flex",
      background: "#F5F5F5",
      borderBottom: "1px solid #CCCCCC",
    },
    fila: {
      display: "flex",
      borderBottom: "1px solid #EEEEEE",
      padding: "12px 0",
    },
    celda: {
      padding: "0 12px",
      display: "flex",
      alignItems: "center",
    },
    resumenDatos: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    filaDato: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 14,
      padding: "8px 0",
    },
    filaDatoTotal: {
      borderTop: "2px solid #CCCCCC",
      paddingTop: "12px",
      marginTop: "8px",
    },
    infoBox: {
      background: getColor("amarillo"),
      border: `2px solid ${getColor("amarillo")}`,
      borderRadius: 12,
      padding: "16px",
      color: "#333333",
      fontSize: 13,
    },
    alerta: {
      borderRadius: 8,
      padding: "12px 16px",
      fontSize: 14,
    },
    botonesContainer: {
      display: "flex",
      gap: 12,
      justifyContent: "flex-end",
    },
    botonCancelar: {
      padding: "10px 20px",
      background: "#E0E0E0",
      border: "1px solid #999999",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: "600",
      color: "#333333",
    },
    botonGenerar: {
      padding: "10px 20px",
      background: getColor("amarillo"),
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: "700",
      color: "#000000",
    },
    input: {
      padding: "8px 12px",
      border: "1px solid #CCCCCC",
      borderRadius: 4,
      fontSize: 14,
      fontFamily: "inherit",
      width: "100%",
      boxSizing: "border-box",
    },
  };

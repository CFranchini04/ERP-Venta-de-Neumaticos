import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { IconoMenos, IconoSalir } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";
import { crearAsientoAPI, fetchCuentas } from '../../../Pantallas/Contabilidad/contabilidadHelpers';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function NuevaNotaCredito({ usuario, onNavegar, onLogout }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [factura, setFactura] = useState(null);
  const [items, setItems] = useState([]);
  const [motivo, setMotivo] = useState("");
  const [nroNotaCredito, setNroNotaCredito] = useState("");
  const [timbrado, setTimbrado] = useState("");
  const ID_ESTADO_EMITIDA = 1;

  useEffect(() => {
    const cargarFactura = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetchConToken(`${API_BASE}/ventas/facturas/${id}`);
        if (!res.ok) {
          if (res.status === 404) { setError("Factura no encontrada."); return; }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "No se pudo cargar la factura.");
        }
        const data = await res.json();
        const facturaData = data.factura || data;
        setFactura(facturaData);
        const detalles = facturaData.detalles_facturas_ventas || [];
        setItems(detalles.map((d) => ({
          id_producto: d.productos?.id_producto || d.id_producto,
          nombre: d.productos?.nombre || "-",
          cantidadOriginal: Number(d.cantidad || 0),
          cantidad: Number(d.cantidad || 0),
          precio_unitario: Number(d.precio_unitario || 0),
          subtotal: Number(d.precio_unitario || 0) * Number(d.cantidad || 0),
          _uid: `${d.id_producto || d.id_detalle}-${Math.random()}`,
        })));
      } catch (err) {
        setError(err.message || "Error al cargar la factura.");
      } finally {
        setLoading(false);
      }
    };
    if (id) cargarFactura();
  }, [id]);

  const handleCantidad = (uid, nuevaCantidad) => {
    setItems((prev) => prev.map((item) => {
      if (item._uid !== uid) return item;
      const cant = Math.max(1, Math.min(nuevaCantidad, item.cantidadOriginal));
      return { ...item, cantidad: cant, subtotal: cant * item.precio_unitario };
    }));
  };

  const handleEliminarItem = (uid) => {
    setItems((prev) => prev.filter((item) => item._uid !== uid));
  };

  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0);
  const iva = subtotal * 0.1;
  const total = subtotal + iva;
  const fechaHoy = new Date().toISOString().split("T")[0];

  const clienteNombre = factura?.clientes?.personas
    ? `${factura.clientes.personas.nombre || ""} ${factura.clientes.personas.apellido || ""}`.trim()
    : "-";
  const clienteCI = factura?.clientes?.personas?.ruc || factura?.clientes?.ci || "-";

  const generarAsientoNC = async (fechaEmision, subtotalNC, ivaNC, totalNC, nroNC) => {
    try {
      const todasCuentas = await fetchCuentas()
      const buscarPorCodigo = (codigo) => todasCuentas.find(c => c.codigo == codigo)

      // NC de venta — asiento inverso a la venta
      const cuentaDeudores = buscarPorCodigo('1.1.3.1.01') // Deudores por ventas
      const cuentaVentas = buscarPorCodigo('4.1.1.1.01') // Ventas
      const cuentaIVA = buscarPorCodigo('2.1.1.4.01') // IVA Débito Fiscal

      if (!cuentaDeudores) throw new Error('No se encontró cuenta Deudores por ventas (1.1.3.1.01)')
      if (!cuentaVentas) throw new Error('No se encontró cuenta Ventas (4.1.1.1.01)')
      if (!cuentaIVA) throw new Error('No se encontró cuenta IVA Débito Fiscal (2.1.1.4.01)')

      await crearAsientoAPI({
        fecha: fechaEmision,
        concepto: `Nota de Crédito ${nroNC} - Ref. Factura ${factura?.codigo_factura || id}`,
        lineas: [
          // DEBE — ventas se reduce (inverso a la venta)
          {
            codigo: "1.1.4.1.01",
            cuenta: "MERCADERIAS DE REVENTA", debe: subtotalNC, haber: 0
          },
          // DEBE — IVA débito se reduce
          {
            codigo: "2.1.1.4.01",
            cuenta: "I.V.A. DEBITO FISCAL", debe: ivaNC, haber: 0
          },
          // HABER — deudores se reduce
          {
            codigo: "1.1.1.1.01",
            cuenta: "CAJA EN MONEDA NACIONAL", debe: 0, haber: totalNC
          },
        ],
        id_periodo_fiscal: null,
        id_estado: 1,
      })
    } catch (err) {
      throw new Error(`Error generando asiento: ${err.message}`)
    }
  }

  const handleGuardar = async () => {
    if (!nroNotaCredito.trim()) { setError("Ingresá el número de nota de crédito."); return; }
    if (!timbrado.trim()) { setError("Ingresá el timbrado."); return; }
    if (items.length === 0) { setError("Agregá al menos un ítem a la nota de crédito."); return; }

    setGuardando(true);
    setError("");

    try {
      const montoTotal = Math.round(total);

      const payload = {
        id_factura_venta: parseInt(id),
        nro_nota_credito: nroNotaCredito.trim(),
        timbrado: timbrado.trim(),
        fecha_emision: fechaHoy,
        monto_total: montoTotal,
        motivo: motivo.trim() || null,
        id_estado: ID_ESTADO_EMITIDA,
        detalles: items.map((i) => {
          const subtotalItem = i.cantidad * i.precio_unitario;
          const monto_iva = Math.round(subtotalItem * 0.1);
          return { id_producto: i.id_producto, cantidad: i.cantidad, precio_unitario: i.precio_unitario, subtotal: subtotalItem, monto_iva };
        }),
      };

      const res = await fetchConToken(`${API_BASE}/ventas/notas-credito`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear la nota de crédito.");
      }

      const data = await res.json();

      // Generar asiento contable
      await generarAsientoNC(fechaHoy, subtotal, Math.round(iva), montoTotal, nroNotaCredito.trim())

      const idNC = data.nc?.id_nota_credito_venta;
      if (idNC) {
        navigate(`/ventas/notas-credito/${idNC}`);
      } else {
        navigate(`/ventas/facturas/${id}`);
      }
    } catch (err) {
      setError(err.message || "Error al guardar la nota de crédito.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <div style={styles.headerTop}>
            <button onClick={() => navigate(`/ventas/facturas/${id}`)} style={styles.botonVolver}>
              <IconoSalir />
            </button>
            <h1 style={styles.titulo}>Nueva Nota de Crédito</h1>
            <div style={{ width: 40 }} />
          </div>
          <div style={styles.separador} />
        </header>

        {loading && <div style={styles.estadoTexto}>Cargando datos de la factura...</div>}
        {!loading && error && !factura && <div style={styles.errorMsg}>{error}</div>}

        {!loading && factura && (
          <div style={styles.contenedorForm}>
            <div style={styles.doColumnas}>
              <div style={styles.columnaIzq}>

                <div style={styles.card}>
                  <h3 style={styles.cardTitulo}>Factura de Referencia</h3>
                  <div style={styles.infoFactura}>
                    <div style={styles.infoGrupo}>
                      <span style={styles.infoLabel}>Código</span>
                      <span style={styles.infoValor}>{factura.codigo_factura || "-"}</span>
                    </div>
                    <div style={styles.infoGrupo}>
                      <span style={styles.infoLabel}>N° Factura</span>
                      <span style={styles.infoValor}>{factura.nro_factura || "-"}</span>
                    </div>
                    <div style={styles.infoGrupo}>
                      <span style={styles.infoLabel}>Cliente</span>
                      <span style={styles.infoValor}>{clienteNombre}</span>
                    </div>
                    <div style={styles.infoGrupo}>
                      <span style={styles.infoLabel}>CI / RUC</span>
                      <span style={styles.infoValor}>{clienteCI}</span>
                    </div>
                    <div style={styles.infoGrupo}>
                      <span style={styles.infoLabel}>Fecha Emisión</span>
                      <span style={styles.infoValor}>
                        {factura.fecha_emision ? new Date(factura.fecha_emision).toLocaleDateString("es-ES") : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitulo}>Datos del Documento</h3>
                  <div style={styles.dosCampos}>
                    <div style={styles.grupoInput}>
                      <label style={styles.label}>N° Nota de Crédito *</label>
                      <input type="text" value={nroNotaCredito} onChange={(e) => setNroNotaCredito(e.target.value)} placeholder="Ej: 001-001-0000001" style={styles.inputTexto} />
                    </div>
                    <div style={styles.grupoInput}>
                      <label style={styles.label}>Timbrado *</label>
                      <input type="text" value={timbrado} onChange={(e) => setTimbrado(e.target.value)} placeholder="Ej: 12345678" style={styles.inputTexto} />
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={styles.grupoInput}>
                      <label style={styles.label}>Motivo</label>
                      <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: Devolución de mercadería, error en precio, producto defectuoso..." style={styles.textarea} rows={3} />
                    </div>
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitulo}>Ítems a Acreditar</h3>
                  <p style={styles.ayuda}>Podés ajustar la cantidad o eliminar ítems. La cantidad no puede superar la de la factura original.</p>
                  <div style={styles.tablaProductos}>
                    <div style={styles.tablaHeader}>
                      <div style={{ flex: 2 }}>Producto</div>
                      <div style={{ flex: 1, textAlign: "center" }}>Cant. (orig.)</div>
                      <div style={{ flex: 1, textAlign: "center" }}>Cant. NC</div>
                      <div style={{ flex: 1, textAlign: "right" }}>Precio Unit.</div>
                      <div style={{ flex: 1, textAlign: "right" }}>Subtotal</div>
                      <div style={{ width: 40 }} />
                    </div>
                    {items.length === 0 ? (
                      <div style={styles.tablaVacia}>No quedan ítems en la nota de crédito.</div>
                    ) : (
                      items.map((item, idx) => (
                        <div key={item._uid} style={{ ...styles.tablaFila, background: idx % 2 === 0 ? "#F9F9F9" : "#FFFFFF" }}>
                          <div style={{ flex: 2 }}>{item.nombre}</div>
                          <div style={{ flex: 1, textAlign: "center", color: "#999", fontSize: 12 }}>{item.cantidadOriginal}</div>
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <div style={styles.grupoNumerico}>
                              <button onClick={() => handleCantidad(item._uid, item.cantidad - 1)} style={styles.botonNumerico}>−</button>
                              <input type="number" value={item.cantidad} onChange={(e) => handleCantidad(item._uid, parseInt(e.target.value) || 1)} style={styles.inputNumerico} min="1" max={item.cantidadOriginal} />
                              <button onClick={() => handleCantidad(item._uid, item.cantidad + 1)} style={styles.botonNumerico}>+</button>
                            </div>
                          </div>
                          <div style={{ flex: 1, textAlign: "right" }}>{Number(item.precio_unitario).toLocaleString("es-PY")} Gs.</div>
                          <div style={{ flex: 1, textAlign: "right", fontWeight: "600" }}>{Number(item.subtotal).toLocaleString("es-PY")} Gs.</div>
                          <button onClick={() => handleEliminarItem(item._uid)} style={styles.botonEliminar} title="Quitar ítem"><IconoMenos /></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.columnaDer}>
                <div style={styles.card}>
                  <h3 style={styles.cardTitulo}>Resumen:</h3>
                  <div style={styles.filaResumen}>
                    <span>Fecha:</span>
                    <span style={{ fontWeight: "600" }}>{fechaHoy}</span>
                  </div>
                  <div style={styles.filaResumen}>
                    <span>Factura Ref.:</span>
                    <span style={{ fontWeight: "600" }}>{factura.codigo_factura || `#${id}`}</span>
                  </div>
                  <div style={styles.filaResumen}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: "600" }}>{Number(subtotal).toLocaleString("es-PY")} Gs.</span>
                  </div>
                  <div style={styles.filaResumen}>
                    <span>IVA (10%):</span>
                    <span style={{ fontWeight: "600" }}>{Number(iva).toLocaleString("es-PY")} Gs.</span>
                  </div>
                  <div style={styles.filaResumenTotal}>
                    <span>Total a acreditar:</span>
                    <span>{Number(total).toLocaleString("es-PY")} Gs.</span>
                  </div>
                  <div style={styles.cardInfoNC}>
                    <strong>¿Qué es una Nota de Crédito?</strong>
                    <p style={{ margin: "8px 0 0 0", fontSize: 12 }}>Documento que reduce el importe de la factura original. Puede ser total o parcial según los ítems seleccionados.</p>
                  </div>
                  {error && <div style={styles.errorMsg}>{error}</div>}
                  <button onClick={handleGuardar} disabled={guardando || items.length === 0} style={{ ...styles.botonGuardar, opacity: guardando || items.length === 0 ? 0.6 : 1, cursor: guardando || items.length === 0 ? "not-allowed" : "pointer" }}>
                    {guardando ? "Guardando..." : "Emitir Nota de Crédito"}
                  </button>
                  <button onClick={() => navigate(`/ventas/facturas/${id}`)} style={styles.botonCancelar}>Cancelar</button>
                </div>
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
    width: "min(1100px, 80%)",
    height: 4,
    background: "#000000",
  },
  contenedorForm: {
    width: "100%",
    maxWidth: 1200,
  },
  doColumnas: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: 20,
  },
  columnaIzq: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  columnaDer: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  card: {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #CCCCCC",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 15px 0",
    textAlign: "center",
    borderBottom: "2px solid #E0E0E0",
    paddingBottom: 10,
  },
  infoFactura: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  infoGrupo: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValor: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "500",
  },
  dosCampos: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  inputTexto: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #CCCCCC",
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
    outline: "none",
    background: "#FAFAFA",
    boxSizing: "border-box",
  },
  grupoInput: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333333",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #CCCCCC",
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
    outline: "none",
    background: "#FAFAFA",
    resize: "vertical",
    boxSizing: "border-box",
  },
  ayuda: {
    fontSize: 12,
    color: "#777777",
    margin: "0 0 12px 0",
    lineHeight: 1.5,
  },
  tablaProductos: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tablaHeader: {
    display: "flex",
    background: getColor("amarillo"),
    padding: "10px",
    fontWeight: "700",
    fontSize: 12,
    color: "#000000",
    borderBottom: "1px solid #D0D0D0",
    alignItems: "center",
  },
  tablaFila: {
    display: "flex",
    padding: "10px",
    borderBottom: "1px solid #E0E0E0",
    fontSize: 13,
    color: "#333333",
    alignItems: "center",
  },
  tablaVacia: {
    padding: "20px",
    textAlign: "center",
    color: "#999999",
    fontSize: 13,
  },
  grupoNumerico: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "#FAFAFA",
    borderRadius: 6,
    border: "1px solid #CCCCCC",
    padding: "2px",
  },
  botonNumerico: {
    width: 26,
    height: 26,
    background: getColor("amarillo"),
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  inputNumerico: {
    width: 44,
    padding: "3px",
    border: "none",
    borderRadius: 4,
    textAlign: "center",
    fontSize: 13,
    outline: "none",
    background: "transparent",
  },
  botonEliminar: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    color: "#666666",
    padding: 4,
    display: "flex",
    alignItems: "center",
    width: 40,
    justifyContent: "center",
  },
  filaResumen: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #E0E0E0",
    fontSize: 14,
  },
  filaResumenTotal: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderTop: "2px solid #333333",
    borderBottom: "2px solid #333333",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
  },
  cardInfoNC: {
    background: getColor("amarillo"),
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 12,
    lineHeight: 1.5,
  },
  errorMsg: {
    background: "#FFE0E0",
    color: "#C00000",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    fontSize: 13,
    fontWeight: "700",
  },
  botonGuardar: {
    width: "100%",
    padding: "13px",
    background: getColor("amarillo"),
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 10,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  botonCancelar: {
    width: "100%",
    padding: "12px",
    background: "#F0F0F0",
    border: "1px solid #CCCCCC",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: "700",
    cursor: "pointer",
    color: "#333333",
  },
  estadoTexto: {
    color: "#666",
    fontSize: 14,
    marginTop: 40,
  },
};
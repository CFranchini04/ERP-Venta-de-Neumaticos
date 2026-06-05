import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { IconoMenos } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";
import { crearAsientoAPI, fetchCuentas } from '../../../Pantallas/Contabilidad/contabilidadHelpers';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function NuevaVentaDirecta({ usuario, onNavegar, onLogout }) {
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [idCliente, setIdCliente] = useState("");
  const [clientesDisponibles, setClientesDisponibles] = useState([]);

  const [productos, setProductos] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const clientesFiltrados = clientesDisponibles.filter((c) => {
    const q = busquedaCliente.trim().toLowerCase();
    if (!q) return true;
    const nombre = `${c.nombre || ""} ${c.apellido || ""}`.toLowerCase();
    const ci = (c.ci || "").toString().toLowerCase();
    return nombre.includes(q) || ci.includes(q);
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resProductos = await fetchConToken(`${API_BASE}/ventas/presupuestos/productos/search`);
        if (resProductos.ok) {
          const dataProductos = await resProductos.json();
          setProductosDisponibles(Array.isArray(dataProductos) ? dataProductos : []);
        }
        const resClientes = await fetchConToken(`${API_BASE}/ventas/presupuestos/clientes/all`);
        if (resClientes.ok) {
          const dataClientes = await resClientes.json();
          setClientesDisponibles(Array.isArray(dataClientes) ? dataClientes : []);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };
    cargarDatos();
  }, []);

  const handleAgregarProducto = () => {
    if (cantidad < 1 || !productoSeleccionado) return;
    const p = productosDisponibles.find(x => x.id_producto === parseInt(productoSeleccionado));
    if (!p) return;
    const precioUnitario = p.precio_venta || 0;
    const subtotal = precioUnitario * cantidad;
    setProductos(prev => [...prev, {
      id_producto: p.id_producto,
      nombre: p.nombre,
      cantidad,
      precio_unitario: precioUnitario,
      subtotal,
      _uid: Date.now() + Math.random(),
    }]);
    setProductoSeleccionado("");
    setCantidad(1);
  };

  const handleEliminarProducto = (uid) => {
    setProductos(prev => prev.filter(p => p._uid !== uid));
  };

  const subtotal = productos.reduce((acc, p) => acc + p.subtotal, 0);
  const iva = subtotal * 0.1;
  const total = subtotal + iva;

  const fechaHoy = new Date().toISOString().split("T")[0];
  const clienteSeleccionado = clientesDisponibles.find(c => c.id_cliente === parseInt(idCliente));

  const generarAsientoVenta = async (fechaEmision, subtotalVenta, ivaVenta, totalVenta, nroFactura) => {
    try {
      const todasCuentas = await fetchCuentas()
      const buscarPorCodigo = (codigo) => todasCuentas.find(c => c.codigo == codigo)

      const cuentaDeudores = buscarPorCodigo('1.1.3.1.01') // Deudores por ventas
      const cuentaVentas = buscarPorCodigo('4.1.1.1.01') // Ventas
      const cuentaIVA = buscarPorCodigo('2.1.1.4.01') // IVA Débito Fiscal

      if (!cuentaDeudores) throw new Error('No se encontró cuenta Deudores por ventas (1.1.3.1.01)')
      if (!cuentaVentas) throw new Error('No se encontró cuenta Ventas (4.1.1.1.01)')
      if (!cuentaIVA) throw new Error('No se encontró cuenta IVA Débito Fiscal (2.1.1.4.01)')

      await crearAsientoAPI({
        fecha: fechaEmision,
        concepto: `Venta directa - Factura ${nroFactura}`,
        lineas: [
          // DEBE — deudores por el total
          {
            codigo: "1.1.1.1.01",
            cuenta: "CAJA EN MONEDA NACIONAL", debe: totalVenta, haber: 0
          },
          // HABER — ventas por el subtotal sin IVA
          {
            codigo: "1.1.4.1.01",
            cuenta: "MERCADERIAS DE REVENTA", debe: 0, haber: subtotalVenta
          },
          // HABER — IVA débito fiscal
          {
            codigo: "2.1.1.4.01",
            cuenta: "I.V.A. DEBITO FISCAL", debe: 0, haber: ivaVenta
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
    if (!idCliente) { setError("Selecciona un cliente"); return; }
    if (productos.length === 0) { setError("Agrega al menos un producto"); return; }

    setLoading(true);
    setError("");

    try {
      const fechaEmision = new Date().toISOString().split("T")[0];
      const fechaVencimiento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      let siguienteNro = 1;
      try {
        const resFacturas = await fetchConToken(`${API_BASE}/ventas/facturas`);
        if (resFacturas.ok) {
          const listaFacturas = await resFacturas.json();
          const arr = Array.isArray(listaFacturas) ? listaFacturas : [];
          const numeros = arr
            .map(f => {
              const match = String(f.nro_factura || f.codigo_factura || "").toUpperCase().match(/FC-V-(\d+)/);
              return match ? parseInt(match[1], 10) : 0;
            })
            .filter(n => Number.isFinite(n));
          if (numeros.length > 0) siguienteNro = Math.max(...numeros) + 1;
        }
      } catch (e) {
        console.error("No se pudo calcular el siguiente nro de factura:", e);
      }

      const correlativo = String(siguienteNro).padStart(4, "0");
      const nroFactura = `FC-V-${correlativo}`;
      const codigoFactura = `FC-V-${correlativo}`;

      const detallesPayload = productos.map(p => ({
        id_producto: p.id_producto,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario,
      }));

      // 1. Crear presupuesto
      const resPresupuesto = await fetchConToken(`${API_BASE}/ventas/presupuestos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cliente: parseInt(idCliente), fecha_creacion: fechaEmision }),
      });
      if (!resPresupuesto.ok) {
        const errorData = await resPresupuesto.json();
        throw new Error(errorData.message || "Error al crear presupuesto base");
      }
      const dataPresupuesto = await resPresupuesto.json();
      const idPresupuesto = dataPresupuesto.id_presupuesto ?? dataPresupuesto.presupuesto?.id_presupuesto ?? dataPresupuesto.id;
      if (!idPresupuesto) throw new Error("El backend no devolvió id_presupuesto al crear el presupuesto base");

      // 2. Crear detalles del presupuesto
      const detallesPresupuestoPayload = productos.map(p => ({
        id_presupuesto: idPresupuesto,
        id_producto: p.id_producto,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario,
      }));
      await fetchConToken(`${API_BASE}/ventas/presupuestos/detalle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detallesPresupuestoPayload),
      });

      // 3. Crear factura
      const resFactura = await fetchConToken(`${API_BASE}/ventas/facturas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: parseInt(idCliente),
          id_presupuesto: idPresupuesto,
          timbrado: null,
          nro_factura: nroFactura,
          fecha_emision: fechaEmision,
          importe_total: total,
          fecha_vencimiento: fechaVencimiento,
          id_estado: 1,
          codigo_factura: codigoFactura,
          detalles: detallesPayload,
        }),
      });
      if (!resFactura.ok) {
        const errorData = await resFactura.json();
        throw new Error(errorData.message || "Error al crear factura");
      }
      const dataFactura = await resFactura.json();

      // 4. Generar asiento contable
      await generarAsientoVenta(fechaEmision, subtotal, iva, total, nroFactura)

      let idFactura =
        dataFactura.id_factura_venta ?? dataFactura.id_factura ?? dataFactura.id ??
        dataFactura.factura?.id_factura_venta ?? dataFactura.factura?.id_factura ?? dataFactura.factura?.id;

      if (!idFactura && codigoFactura) {
        const resByCodigo = await fetchConToken(`${API_BASE}/ventas/facturas/codigo/${codigoFactura}`);
        if (resByCodigo.ok) {
          const fac = await resByCodigo.json();
          idFactura = fac.id_factura_venta ?? fac.id_factura ?? fac.id;
        }
      }

      if (!idFactura) throw new Error("No se pudo obtener el ID de la factura recién creada");

      navigate(`/ventas/facturas/${idFactura}`);
    } catch (err) {
      setError(err.message || "Error al generar factura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Nueva Venta</h1>
          <div style={styles.separador} />
        </header>

        <div style={styles.contenedorForm}>
          <div style={styles.doColumnas}>
            <div style={styles.columnaIzq}>
              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>Seleccionar Cliente</h3>
                <div style={styles.grupoInput}>
                  <label style={styles.label}>Cliente *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={busquedaCliente}
                      onChange={(e) => { setBusquedaCliente(e.target.value); setMostrarListaClientes(true); setIdCliente(""); }}
                      onFocus={() => setMostrarListaClientes(true)}
                      onBlur={() => setTimeout(() => setMostrarListaClientes(false), 150)}
                      placeholder="Buscar cliente por nombre o CI..."
                      style={styles.buscadorCliente}
                    />
                    {mostrarListaClientes && clientesFiltrados.length > 0 && (
                      <div style={styles.listaDropdown}>
                        {clientesFiltrados.slice(0, 50).map((c) => {
                          const nombre = `${c.nombre || ""} ${c.apellido || ""}`.trim() || `ID ${c.id_cliente}`;
                          return (
                            <div key={c.id_cliente} onMouseDown={() => { setIdCliente(String(c.id_cliente)); setBusquedaCliente(nombre); setMostrarListaClientes(false); }} style={styles.listaItem}>
                              <span>{nombre}</span>
                              {c.ci && <span style={{ fontSize: 12, color: "#666" }}>CI: {c.ci}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {mostrarListaClientes && clientesFiltrados.length === 0 && (
                      <div style={styles.listaDropdown}>
                        <div style={{ ...styles.listaItem, color: "#999", cursor: "default" }}>Sin resultados</div>
                      </div>
                    )}
                  </div>
                </div>
                {clienteSeleccionado && (
                  <div style={styles.cardInfo}>
                    <strong>Información del Cliente</strong>
                    <p style={{ margin: "8px 0 0 0", fontSize: 12 }}>
                      {`${clienteSeleccionado.nombre || ""} ${clienteSeleccionado.apellido || ""}`.trim()} — CI/RUC: {clienteSeleccionado.ci || "N/A"}
                    </p>
                  </div>
                )}
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>Productos y Servicios</h3>
                <div style={styles.selectoresProducto}>
                  <select value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)} style={styles.selectProducto}>
                    <option value="">Seleccionar Productos...</option>
                    {productosDisponibles.map((p) => (
                      <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                    ))}
                  </select>
                  <div style={styles.grupoNumerico}>
                    <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} style={styles.botonNumerico}>−</button>
                    <input type="number" value={cantidad} onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))} style={styles.inputNumerico} min="1" />
                    <button onClick={() => setCantidad(cantidad + 1)} style={styles.botonNumerico}>+</button>
                  </div>
                  <button onClick={handleAgregarProducto} style={styles.botonMas}>+</button>
                </div>
                <div style={styles.tablaProductos}>
                  <div style={styles.tablaHeaderProducto}>
                    <div style={{ flex: 2 }}>Producto</div>
                    <div style={{ flex: 1, textAlign: "center" }}>Cantidad</div>
                    <div style={{ flex: 1, textAlign: "right" }}>Precio Unit.</div>
                    <div style={{ flex: 1, textAlign: "right" }}>Subtotal</div>
                    <div style={{ width: 40 }}></div>
                  </div>
                  {productos.length === 0 ? (
                    <div style={styles.tablaVacia}>No hay productos seleccionados...</div>
                  ) : (
                    productos.map((p, idx) => (
                      <div key={p._uid} style={{ ...styles.tablaFilaProducto, background: idx % 2 === 0 ? "#F9F9F9" : "#FFFFFF" }}>
                        <div style={{ flex: 2 }}>{p.nombre}</div>
                        <div style={{ flex: 1, textAlign: "center" }}>{p.cantidad}</div>
                        <div style={{ flex: 1, textAlign: "right" }}>{Number(p.precio_unitario || 0).toLocaleString("es-PY")} Gs.</div>
                        <div style={{ flex: 1, textAlign: "right", fontWeight: "600" }}>{Number(p.subtotal || 0).toLocaleString("es-PY")} Gs.</div>
                        <button onClick={() => handleEliminarProducto(p._uid)} style={styles.botonEliminar}><IconoMenos /></button>
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
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: "600" }}>{Number(subtotal || 0).toLocaleString("es-PY")} Gs.</span>
                </div>
                <div style={styles.filaResumen}>
                  <span>IVA (10%):</span>
                  <span style={{ fontWeight: "600" }}>{Number(iva || 0).toLocaleString("es-PY")} Gs.</span>
                </div>
                <div style={styles.filaResumenTotal}>
                  <span>Total:</span>
                  <span>{Number(total || 0).toLocaleString("es-PY")} Gs.</span>
                </div>
                {error && <div style={styles.errorMsg}>{error}</div>}
                <button onClick={handleGuardar} disabled={loading} style={{ ...styles.botonGuardar, opacity: loading ? 0.6 : 1 }}>
                  {loading ? "Generando..." : "Generar Factura"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  pagina: { display: "flex", minHeight: "100vh", background: "#F5F5F5" },
  contenido: { flex: 1, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto" },
  encabezado: { width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "21px 0", marginBottom: 20 },
  titulo: { color: "#000000", fontSize: 42, fontFamily: "Lato, sans-serif", fontWeight: 700, lineHeight: 1.2, margin: 0, textAlign: "center" },
  separador: { width: "min(1100px, 80%)", height: 4, background: "#000000" },
  contenedorForm: { width: "100%", maxWidth: 1200 },
  doColumnas: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 },
  columnaIzq: { display: "flex", flexDirection: "column", gap: 20 },
  columnaDer: { display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "#FFFFFF", borderRadius: 16, padding: 20, border: "1px solid #CCCCCC", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)" },
  cardTitulo: { fontSize: 15, fontWeight: "700", color: "#000000", margin: "0 0 15px 0", textAlign: "center", borderBottom: "2px solid #E0E0E0", paddingBottom: 10 },
  grupoInput: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, fontWeight: "700", color: "#333333" },
  selectoresProducto: { display: "flex", gap: 10, alignItems: "center", marginBottom: 15 },
  selectProducto: { flex: 1, padding: "10px", border: "1px solid #CCCCCC", borderRadius: 6, fontSize: 14, fontFamily: "Lato, sans-serif", outline: "none", background: "#FAFAFA" },
  grupoNumerico: { display: "flex", alignItems: "center", gap: 5, background: "#FAFAFA", borderRadius: 6, border: "1px solid #CCCCCC", padding: "2px" },
  botonNumerico: { width: 30, height: 30, background: getColor("amarillo"), border: "none", borderRadius: 4, cursor: "pointer", fontSize: 16, fontWeight: "700", color: "#000000" },
  inputNumerico: { width: 50, padding: "5px", border: "none", borderRadius: 4, textAlign: "center", fontSize: 14, outline: "none", background: "transparent" },
  botonMas: { width: 30, height: 30, background: getColor("amarillo"), border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16, fontWeight: "700", color: "#000000" },
  tablaProductos: { display: "flex", flexDirection: "column", border: "1px solid #E0E0E0", borderRadius: 8, overflow: "hidden" },
  tablaHeaderProducto: { display: "flex", background: getColor("amarillo"), padding: "10px", fontWeight: "700", fontSize: 13, color: "#000000", borderBottom: "1px solid #D0D0D0" },
  tablaFilaProducto: { display: "flex", padding: "10px", borderBottom: "1px solid #E0E0E0", fontSize: 13, color: "#333333", alignItems: "center" },
  tablaVacia: { padding: "20px", textAlign: "center", color: "#999999", fontSize: 13 },
  botonEliminar: { background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#666666", padding: 4, display: "flex", alignItems: "center" },
  filaResumen: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #E0E0E0", fontSize: 14 },
  filaResumenTotal: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "2px solid #333333", borderBottom: "2px solid #333333", fontSize: 16, fontWeight: "700", marginBottom: 15 },
  cardInfo: { background: getColor("amarillo"), padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 12, lineHeight: 1.5 },
  errorMsg: { background: "#FFE0E0", color: "#C00000", padding: 10, borderRadius: 6, marginBottom: 15, fontSize: 13, fontWeight: "700" },
  botonGuardar: { width: "100%", padding: "12px", background: getColor("amarillo"), border: "none", borderRadius: 6, fontSize: 14, fontWeight: "700", cursor: "pointer", color: "#000000" },
  buscadorCliente: { width: "100%", padding: "12px", border: "1px solid #CCCCCC", borderRadius: 6, fontSize: 15, fontFamily: "Lato, sans-serif", outline: "none", background: "#FAFAFA" },
  listaDropdown: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#FFFFFF", border: "1px solid #CCCCCC", borderRadius: 6, maxHeight: 240, overflowY: "auto", zIndex: 10, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" },
  listaItem: { padding: "10px 12px", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #F0F0F0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
};
import React, { useMemo, useState, useEffect } from "react";
import { IconoCerrar } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

/**
 * CargarCotizacionModal
 *
 * Props:
 *   open          {boolean}   Controla visibilidad
 *   onClose       {function}  Cerrar sin guardar
 *   onGuardado    {function}  Callback al guardar exitosamente (recibe la cotizacion creada)
 *   idPedido      {number}    ID del pedido al que se le carga la cotización
 *   productos     {array}     Lista de items del pedido: { id_producto, producto, cantidad, ... }
 *   proveedores   {array}     Lista de proveedores: { id, nombre }
 */
export default function CargarCotizacionModal({
  open,
  onClose,
  onGuardado,
  idPedido,
  productos = [],
  proveedores = [],
}) {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [detalles, setDetalles] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Reiniciar estado al abrir el modal
  useEffect(() => {
    if (open) {
      setProveedorSeleccionado("");
      setError("");
      setDetalles(
        productos.map((p) => ({
          id_producto: p.id_producto,
          producto: p.producto,
          cantidad: p.cantidad,
          precioUnitario: "",
          esMejorOpcion: false,
          observacion: "",
        }))
      );
    }
  }, [open, productos]);

  const handlePrecioChange = (index, valor) => {
    setError("");
    const copia = [...detalles];
    // Evitar negativos
    copia[index].precioUnitario = Number(valor) < 0 ? "0" : valor;
    setDetalles(copia);
  };

  const handleObservacionChange = (index, valor) => {
    const copia = [...detalles];
    copia[index].observacion = valor;
    setDetalles(copia);
  };

  const totalEstimado = useMemo(() => {
    return detalles.reduce((acc, item) => {
      return acc + Number(item.cantidad || 0) * Number(item.precioUnitario || 0);
    }, 0);
  }, [detalles]);

  if (!open) return null;

  const handleGuardar = async () => {
    if (!proveedorSeleccionado) {
      setError("Debes seleccionar un proveedor.");
      return;
    }
    const sinPrecio = detalles.some(
      (item) => !item.precioUnitario || Number(item.precioUnitario) <= 0
    );
    if (sinPrecio) {
      setError("Todos los productos deben tener un precio mayor a cero.");
      return;
    }

    setError("");
    setGuardando(true);

    try {
      const codigoCotizacion = `COT_${Date.now()}`;
      const hoy = new Date().toISOString().split("T")[0];

      const payload = {
        id_pedido: idPedido,
        id_proveedor: Number(proveedorSeleccionado),
        fecha_respuesta: hoy,
        observacion: "",
        id_estado: 1,
        codigo_cotizacion: codigoCotizacion,
        detalles: detalles.map((d) => ({
          id_producto: d.id_producto,
          cantidad: Number(d.cantidad),
          precio_unitario: Number(d.precioUnitario),
          es_mejor_opcion: d.esMejorOpcion ?? false,
          observacion: d.observacion ?? "",
        })),
      };

      const res = await fetchConToken(`${API_BASE}/compras/cotizaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar la cotización");

      if (onGuardado) onGuardado(data);
      onClose();
    } catch (err) {
      setError(err.message || "Error al guardar cotización");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={styles.headerTitulo}>Cargar Cotización de Proveedor</h2>
          <button style={styles.botonCerrar} onClick={onClose}>
            <IconoCerrar />
          </button>
        </div>

        {/* BODY */}
        <div style={styles.body}>

          {/* SELECT PROVEEDOR */}
          <div style={styles.campo}>
            <label style={styles.label}>Proveedor *</label>
            <select
              style={styles.select}
              value={proveedorSeleccionado}
              onChange={(e) => { setProveedorSeleccionado(e.target.value); setError(""); }}
            >
              <option value="">— Seleccionar proveedor —</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* TABLA DE PRODUCTOS */}
          <div style={styles.tablaContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Cantidad</th>
                  <th style={styles.th}>Precio Unitario (Gs.)</th>
                  <th style={styles.th}>Subtotal</th>
                  <th style={styles.th}>Observación</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((item, index) => {
                  const subtotal =
                    Number(item.cantidad || 0) * Number(item.precioUnitario || 0);
                  return (
                    <tr key={index} style={{ borderBottom: "1px solid #eee", background: index % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ ...styles.td, textAlign: "left", fontWeight: 500 }}>
                        {item.producto}
                      </td>
                      <td style={styles.td}>{item.cantidad}</td>
                      <td style={styles.td}>
                        <input
                          type="number"
                          min="0"
                          style={styles.input}
                          value={item.precioUnitario}
                          onChange={(e) => handlePrecioChange(index, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td style={{ ...styles.td, fontWeight: subtotal > 0 ? 600 : 400, color: subtotal > 0 ? "#1D1D1D" : "#aaa" }}>
                        {subtotal > 0 ? subtotal.toLocaleString("es-PY") : "—"}
                      </td>
                      <td style={styles.td}>
                        <input
                          type="text"
                          style={{ ...styles.input, width: 150, fontSize: 12 }}
                          value={item.observacion}
                          onChange={(e) => handleObservacionChange(index, e.target.value)}
                          placeholder="Opcional..."
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TOTAL */}
          <div style={styles.totalContainer}>
            <strong>Total estimado:</strong>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#1D1D1D" }}>
              {totalEstimado.toLocaleString("es-PY")} Gs.
            </span>
          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {/* FOOTER */}
        <div style={styles.footer}>
          <button style={styles.botonCancelar} onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button
            style={{ ...styles.botonGuardar, opacity: guardando ? 0.6 : 1, cursor: guardando ? "not-allowed" : "pointer" }}
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar Cotización"}
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
  },
  modal: {
    width: "950px", maxWidth: "95vw", maxHeight: "92vh",
    background: "#fff", borderRadius: 16, overflow: "hidden",
    display: "flex", flexDirection: "column",
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
  },
  header: {
    background: getColor("amarillo"), padding: "18px 24px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  headerTitulo: { margin: 0, fontSize: 24, fontWeight: 700, fontFamily: "Lato, sans-serif" },
  botonCerrar: { border: "none", background: "transparent", cursor: "pointer" },
  body: { padding: 24, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", flex: 1 },
  campo: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontWeight: 700, fontSize: 14, fontFamily: "Lato, sans-serif", color: "#333" },
  select: { padding: "10px 12px", borderRadius: 8, border: "1.5px solid #ccc", fontSize: 14, fontFamily: "Lato, sans-serif", background: "#FAFAFA", outline: "none", cursor: "pointer" },
  tablaContainer: { border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: getColor("amarillo"), padding: "12px 14px", textAlign: "center", fontSize: 14, fontFamily: "Lato, sans-serif", fontWeight: 700 },
  td: { padding: "10px 14px", textAlign: "center", fontSize: 14, fontFamily: "Lato, sans-serif" },
  input: { padding: "8px 10px", borderRadius: 6, border: "1.5px solid #DADADA", width: 130, outline: "none", fontSize: 14, fontFamily: "Lato, sans-serif", boxSizing: "border-box", background: "#FAFAFA" },
  totalContainer: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, fontSize: 16, fontFamily: "Lato, sans-serif" },
  error: { background: "#fff0f0", border: "1px solid #E30613", borderRadius: 8, padding: "10px 24px", color: "#E30613", fontSize: 14, fontFamily: "Lato, sans-serif", margin: "0 24px" },
  footer: { padding: "16px 24px", borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: 12 },
  botonCancelar: { padding: "10px 24px", borderRadius: 999, border: "1px solid #999", background: "#fff", cursor: "pointer", fontFamily: "Lato, sans-serif" },
  botonGuardar: { padding: "10px 28px", borderRadius: 999, border: "none", background: getColor("amarillo"), fontWeight: "bold", cursor: "pointer", fontFamily: "Lato, sans-serif", fontSize: 15 },
};
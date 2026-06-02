import React, { useMemo, useState, useEffect } from "react";
import { IconoCerrar } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

/**
 * CargarCotizacionModal
 *
 * Props:
 *   open               {boolean}
 *   onClose            {function}
 *   onGuardado         {function}
 *   idCotizacion       {number}   ID de la cabecera de cotizacion ya existente
 *   productos          {array}    [{ id_producto, producto, cantidad, ... }]
 *   proveedores        {array}    [{ id, nombre }]
 *   detallesExistentes {array}    [{ id_proveedor, id_producto, precio_unitario, cantidad }]
 *                                 Filas ya cargadas en esta cotizacion (para detección de duplicados)
 */
export default function CargarCotizacionModal({
  open,
  onClose,
  onGuardado,
  idCotizacion,
  productos = [],
  proveedores = [],
  detallesExistentes = [],
}) {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [detalles, setDetalles] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Set of proveedor IDs that already have at least one row in this cotizacion
  const proveedoresConCotizacion = useMemo(() => {
    const ids = new Set();
    detallesExistentes.forEach((d) => { if (d.id_proveedor) ids.add(String(d.id_proveedor)); });
    return ids;
  }, [detallesExistentes]);

  const esSobreescritura = proveedorSeleccionado !== "" && proveedoresConCotizacion.has(proveedorSeleccionado);

  useEffect(() => {
    if (open) {
      setProveedorSeleccionado("");
      setError("");
      setDetalles(
        productos.map((p) => ({
          id_producto: p.id_producto,
          producto: p.producto ?? p.nombre ?? "—",
          cantidad: p.cantidad,
          precioUnitario: "",
          esMejorOpcion: false,
          observacion: "",
          incluido: true,
        }))
      );
    }
  }, [open, productos]);

  // When proveedor changes to one that already has rows, pre-fill prices from existing rows
  useEffect(() => {
    if (!proveedorSeleccionado || detallesExistentes.length === 0) return;
    const existentesDeEsteProv = detallesExistentes.filter(
      (d) => String(d.id_proveedor) === String(proveedorSeleccionado)
    );
    if (existentesDeEsteProv.length === 0) return;

    setDetalles((prev) =>
      prev.map((item) => {
        const existente = existentesDeEsteProv.find((e) => e.id_producto === item.id_producto);
        if (existente) {
          return { ...item, precioUnitario: String(existente.precio_unitario ?? ""), incluido: true };
        }
        return item;
      })
    );
  }, [proveedorSeleccionado]);

  const toggleIncluido = (index) => {
    setError("");
    setDetalles((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], incluido: !copia[index].incluido, precioUnitario: "", observacion: "" };
      return copia;
    });
  };

  const handlePrecioChange = (index, valor) => {
    setError("");
    setDetalles((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], precioUnitario: Number(valor) < 0 ? "0" : valor };
      return copia;
    });
  };

  const handleObservacionChange = (index, valor) => {
    setDetalles((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], observacion: valor };
      return copia;
    });
  };

  const productosIncluidos = detalles.filter((d) => d.incluido);

  const totalEstimado = useMemo(() => {
    return productosIncluidos.reduce(
      (acc, item) => acc + Number(item.cantidad || 0) * Number(item.precioUnitario || 0),
      0
    );
  }, [detalles]);

  if (!open) return null;

  const handleGuardar = async () => {
    if (!proveedorSeleccionado) {
      setError("Debes seleccionar un proveedor.");
      return;
    }
    if (!idCotizacion) {
      setError("No se encontró la cotización asociada al pedido.");
      return;
    }
    if (productosIncluidos.length === 0) {
      setError("Debes incluir al menos un producto en la cotización.");
      return;
    }
    const sinPrecio = productosIncluidos.some(
      (item) => !item.precioUnitario || Number(item.precioUnitario) <= 0
    );
    if (sinPrecio) {
      setError("Todos los productos incluidos deben tener un precio mayor a cero.");
      return;
    }

    setError("");
    setGuardando(true);

    try {
      const hoy = new Date().toISOString().split("T")[0];

      const res = await fetchConToken(
        `${API_BASE}/compras/cotizaciones/${idCotizacion}/detalle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sobreescribir: esSobreescritura,
            detalles: productosIncluidos.map((d) => ({
              id_producto: d.id_producto,
              cantidad: Number(d.cantidad),
              precio_unitario: Number(d.precioUnitario),
              es_mejor_opcion: d.esMejorOpcion ?? false,
              observacion: d.observacion ?? "",
              id_proveedor: Number(proveedorSeleccionado),
              fecha_respuesta: hoy,
            })),
          }),
        }
      );

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

  const contadorIncluidos = productosIncluidos.length;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div style={styles.header}>
          <h2 style={styles.headerTitulo}>Cargar Cotización de Proveedor</h2>
          <button style={styles.botonCerrar} onClick={onClose}>
            <IconoCerrar />
          </button>
        </div>

        <div style={styles.body}>

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
                  {p.nombre}{proveedoresConCotizacion.has(String(p.id)) ? " ✎ (ya cotizado)" : ""}
                </option>
              ))}
            </select>
          </div>

          {esSobreescritura && (
            <div style={styles.avisoSobreescritura}>
              <strong>⚠ Este proveedor ya tiene una cotización cargada.</strong> Al guardar, se sobreescribirán los precios anteriores con los nuevos valores. Los precios existentes fueron pre-cargados para facilitar la edición.
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Lato, sans-serif", fontSize: 13, color: "#555" }}>
            <span>
              Productos incluidos en esta cotización:{" "}
              <strong style={{ color: contadorIncluidos > 0 ? "#237804" : "#E30613" }}>
                {contadorIncluidos}/{detalles.length}
              </strong>
            </span>
            <span style={{ color: "#888" }}>— Desmarcá los productos que este proveedor no cotice.</span>
          </div>

          <div style={styles.tablaContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: 40 }}>✓</th>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Cantidad</th>
                  <th style={styles.th}>Precio Unitario (Gs.)</th>
                  <th style={styles.th}>Subtotal</th>
                  <th style={styles.th}>Observación</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((item, index) => {
                  const subtotal = Number(item.cantidad || 0) * Number(item.precioUnitario || 0);
                  const excluido = !item.incluido;
                  return (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid #eee",
                        background: excluido ? "#f5f5f5" : index % 2 === 0 ? "#fff" : "#fafafa",
                        opacity: excluido ? 0.55 : 1,
                        transition: "opacity 0.15s, background 0.15s",
                      }}
                    >
                      <td style={{ ...styles.td, width: 40 }}>
                        <div
                          onClick={() => toggleIncluido(index)}
                          style={{
                            width: 20, height: 20, margin: "0 auto",
                            border: `2px solid ${item.incluido ? "#1D1D1D" : "#bbb"}`,
                            borderRadius: 4,
                            background: item.incluido ? getColor("amarillo") : "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.15s",
                          }}
                        >
                          {item.incluido && <span style={{ fontSize: 12, fontWeight: 900, color: "#1D1D1D" }}>✓</span>}
                        </div>
                      </td>
                      <td onClick={() => toggleIncluido(index)} style={{ ...styles.td, textAlign: "left", fontWeight: 500, color: excluido ? "#aaa" : "#1D1D1D", cursor: "pointer", userSelect: "none" }}>
                        {item.producto}
                      </td>
                      <td style={styles.td}>{item.cantidad}</td>
                      <td style={styles.td}>
                        <input
                          type="number"
                          min="0"
                          disabled={excluido}
                          style={{ ...styles.input, background: excluido ? "#eee" : "#FAFAFA", cursor: excluido ? "not-allowed" : "text", color: excluido ? "#aaa" : "#1D1D1D" }}
                          value={item.precioUnitario}
                          onChange={(e) => handlePrecioChange(index, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td style={{ ...styles.td, fontWeight: subtotal > 0 ? 600 : 400, color: excluido ? "#ccc" : subtotal > 0 ? "#1D1D1D" : "#aaa" }}>
                        {subtotal > 0 ? subtotal.toLocaleString("es-PY") : "—"}
                      </td>
                      <td style={styles.td}>
                        <input
                          type="text"
                          disabled={excluido}
                          style={{ ...styles.input, width: 140, fontSize: 12, background: excluido ? "#eee" : "#FAFAFA", cursor: excluido ? "not-allowed" : "text", color: excluido ? "#aaa" : "#1D1D1D" }}
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

          <div style={styles.totalContainer}>
            <strong>Total estimado ({contadorIncluidos} producto{contadorIncluidos !== 1 ? "s" : ""}):</strong>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#1D1D1D" }}>
              {totalEstimado.toLocaleString("es-PY")} Gs.
            </span>
          </div>

        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.footer}>
          <button style={styles.botonCancelar} onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button
            style={{
              ...styles.botonGuardar,
              opacity: guardando ? 0.6 : 1,
              cursor: guardando ? "not-allowed" : "pointer",
              background: esSobreescritura ? "#F59E0B" : getColor("amarillo"),
            }}
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : esSobreescritura ? "Sobreescribir Cotización" : "Guardar Cotización"}
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { width: "980px", maxWidth: "95vw", maxHeight: "92vh", background: "#fff", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" },
  header: { background: getColor("amarillo"), padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerTitulo: { margin: 0, fontSize: 24, fontWeight: 700, fontFamily: "Lato, sans-serif" },
  botonCerrar: { border: "none", background: "transparent", cursor: "pointer" },
  body: { padding: 24, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", flex: 1 },
  campo: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontWeight: 700, fontSize: 14, fontFamily: "Lato, sans-serif", color: "#333" },
  select: { padding: "10px 12px", borderRadius: 8, border: "1.5px solid #ccc", fontSize: 14, fontFamily: "Lato, sans-serif", background: "#FAFAFA", outline: "none", cursor: "pointer" },
  avisoSobreescritura: { background: "#FFF3CD", border: "1.5px solid #F0A500", borderRadius: 8, padding: "10px 16px", color: "#856404", fontSize: 13, fontFamily: "Lato, sans-serif", lineHeight: 1.5 },
  tablaContainer: { border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: getColor("amarillo"), padding: "12px 14px", textAlign: "center", fontSize: 14, fontFamily: "Lato, sans-serif", fontWeight: 700 },
  td: { padding: "10px 14px", textAlign: "center", fontSize: 14, fontFamily: "Lato, sans-serif" },
  input: { padding: "8px 10px", borderRadius: 6, border: "1.5px solid #DADADA", width: 130, outline: "none", fontSize: 14, fontFamily: "Lato, sans-serif", boxSizing: "border-box" },
  totalContainer: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, fontSize: 16, fontFamily: "Lato, sans-serif" },
  error: { background: "#fff0f0", border: "1px solid #E30613", borderRadius: 8, padding: "10px 24px", color: "#E30613", fontSize: 14, fontFamily: "Lato, sans-serif", margin: "0 24px" },
  footer: { padding: "16px 24px", borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: 12 },
  botonCancelar: { padding: "10px 24px", borderRadius: 999, border: "1px solid #999", background: "#fff", cursor: "pointer", fontFamily: "Lato, sans-serif" },
  botonGuardar: { padding: "10px 28px", borderRadius: 999, border: "none", fontWeight: "bold", fontFamily: "Lato, sans-serif", fontSize: 15 },
};

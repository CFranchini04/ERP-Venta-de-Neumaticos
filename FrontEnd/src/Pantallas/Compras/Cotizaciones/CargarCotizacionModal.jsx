// CargarCotizacionModal.jsx
// Modal para cargar cotizaciones desde DetallePedido.
// Autocompleta productos del pedido, permite elegir proveedor, ingresar precios
// y hace POST a /api/compras/cotizaciones creando cabecera + detalles.

import React, { useMemo, useState, useEffect } from "react";
import { IconoCerrar } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function CargarCotizacionModal({
  open,
  onClose,
  // Array de productos del detalle del pedido: { id_producto, producto, cantidad, precio }
  productosPedido = [],
  // id del pedido al que pertenece esta cotización
  idPedido,
  // Callback tras guardar exitoso: recibe la cotización creada
  onGuardar,
}) {
  const [proveedores, setProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [fechaRespuesta, setFechaRespuesta] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [observacion, setObservacion] = useState("");
  const [detalles, setDetalles] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [cargandoProv, setCargandoProv] = useState(false);

  // Cargar proveedores al abrir el modal
  useEffect(() => {
    if (!open) return;

    // Resetear estado al abrir
    setProveedorSeleccionado("");
    setFechaRespuesta(new Date().toISOString().split("T")[0]);
    setObservacion("");
    setError("");

    // Autocompletar filas con los productos del pedido
    setDetalles(
      productosPedido.map((p) => ({
        id_producto: p.id_producto,
        nombre: p.producto,
        cantidad: Number(p.cantidad) || 1,
        precio_unitario: "",
        es_mejor_opcion: false,
        observacion: "",
      }))
    );

    // Fetch proveedores
    const cargarProveedores = async () => {
      try {
        setCargandoProv(true);
        const res = await fetch(`${API_BASE}/compras/proveedores`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProveedores(
            data.map((p) => ({
              id: p.id_proveedor,
              nombre:
                `${p.personas?.nombre ?? ""} ${p.personas?.apellido ?? ""}`.trim() ||
                `Proveedor #${p.id_proveedor}`,
            }))
          );
        }
      } catch (err) {
        console.error("Error cargando proveedores:", err);
      } finally {
        setCargandoProv(false);
      }
    };

    cargarProveedores();
  }, [open, productosPedido]);

  // Total estimado calculado en tiempo real
  const totalEstimado = useMemo(
    () =>
      detalles.reduce(
        (acc, d) => acc + Number(d.cantidad || 0) * Number(d.precio_unitario || 0),
        0
      ),
    [detalles]
  );

  if (!open) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCampoDetalle = (index, campo, valor) => {
    setError("");
    setDetalles((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  };

  const handleMejorOpcion = (index) => {
    setDetalles((prev) =>
      prev.map((d, i) => ({ ...d, es_mejor_opcion: i === index ? !d.es_mejor_opcion : d.es_mejor_opcion }))
    );
  };

  // ── Validación y POST ──────────────────────────────────────────────────────

  const handleGuardar = async () => {
    if (!proveedorSeleccionado) {
      setError("Debes seleccionar un proveedor.");
      return;
    }
    if (!fechaRespuesta) {
      setError("La fecha de respuesta es obligatoria.");
      return;
    }
    const sinPrecio = detalles.some(
      (d) => !d.precio_unitario || Number(d.precio_unitario) <= 0
    );
    if (sinPrecio) {
      setError("Todos los productos deben tener un precio unitario mayor a 0.");
      return;
    }

    setError("");
    setGuardando(true);

    try {
      // Generar código único para la cotización
      const codigoCotizacion = `COT_${Date.now()}`;

      const payload = {
        id_pedido: Number(idPedido),
        id_proveedor: Number(proveedorSeleccionado),
        fecha_respuesta: fechaRespuesta,
        observacion: observacion.trim() || null,
        id_estado: 1, // Estado inicial (por definir en tu tabla estados)
        codigo_cotizacion: codigoCotizacion,
        detalles: detalles.map((d) => ({
          id_producto: d.id_producto,
          cantidad: Number(d.cantidad),
          precio_unitario: Number(d.precio_unitario),
          es_mejor_opcion: d.es_mejor_opcion,
          observacion: d.observacion?.trim() || null,
        })),
      };

      const res = await fetch(`${API_BASE}/compras/cotizaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al crear la cotización");
      }

      if (onGuardar) onGuardar(data);
      onClose();
    } catch (err) {
      setError(err.message || "Error inesperado al guardar");
    } finally {
      setGuardando(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={styles.headerTitulo}>Cargar Cotización</h2>
          <button style={styles.botonCerrar} onClick={onClose} title="Cerrar">
            <IconoCerrar />
          </button>
        </div>

        {/* BODY */}
        <div style={styles.body}>

          {/* Fila: Proveedor + Fecha */}
          <div style={styles.fila}>
            <div style={styles.campo}>
              <label style={styles.label}>Proveedor *</label>
              {cargandoProv ? (
                <div style={styles.cargando}>Cargando proveedores...</div>
              ) : (
                <select
                  style={styles.select}
                  value={proveedorSeleccionado}
                  onChange={(e) => {
                    setError("");
                    setProveedorSeleccionado(e.target.value);
                  }}
                >
                  <option value="">— Seleccionar proveedor —</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Fecha de Respuesta *</label>
              <input
                type="date"
                style={styles.inputText}
                value={fechaRespuesta}
                onChange={(e) => {
                  setError("");
                  setFechaRespuesta(e.target.value);
                }}
              />
            </div>
          </div>

          {/* Observación general */}
          <div style={styles.campo}>
            <label style={styles.label}>Observación general</label>
            <textarea
              style={{ ...styles.inputText, height: 60, resize: "vertical" }}
              placeholder="Observación opcional sobre la cotización..."
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />
          </div>

          {/* Tabla de productos */}
          <div style={styles.tablaContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Cantidad</th>
                  <th style={styles.th}>Precio Unitario (Gs.) *</th>
                  <th style={styles.th}>Subtotal</th>
                  <th style={styles.th}>Mejor opción</th>
                  <th style={styles.th}>Observación</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((item, index) => {
                  const subtotal =
                    Number(item.cantidad || 0) * Number(item.precio_unitario || 0);

                  return (
                    <tr
                      key={index}
                      style={{
                        ...styles.tr,
                        background: item.es_mejor_opcion ? "#FFFDE7" : index % 2 === 0 ? "#fff" : "#FAFAFA",
                      }}
                    >
                      {/* Nombre producto (solo lectura) */}
                      <td style={{ ...styles.td, fontWeight: 600, minWidth: 160 }}>
                        {item.nombre}
                      </td>

                      {/* Cantidad */}
                      <td style={styles.td}>
                        <input
                          type="number"
                          min="1"
                          style={{ ...styles.inputNumber, width: 70 }}
                          value={item.cantidad}
                          onChange={(e) => {
                            const v = Math.max(1, Number(e.target.value));
                            handleCampoDetalle(index, "cantidad", v);
                          }}
                        />
                      </td>

                      {/* Precio unitario */}
                      <td style={styles.td}>
                        <input
                          type="number"
                          min="0"
                          style={{ ...styles.inputNumber, width: 140 }}
                          placeholder="0"
                          value={item.precio_unitario}
                          onChange={(e) => {
                            const v = e.target.value;
                            handleCampoDetalle(
                              index,
                              "precio_unitario",
                              v < 0 ? 0 : v
                            );
                          }}
                        />
                      </td>

                      {/* Subtotal (calculado) */}
                      <td style={{ ...styles.td, fontWeight: 600, textAlign: "right", minWidth: 120 }}>
                        {subtotal.toLocaleString("es-PY")} Gs.
                      </td>

                      {/* Mejor opción */}
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={item.es_mejor_opcion}
                          onChange={() => handleMejorOpcion(index)}
                          style={{ width: 18, height: 18, cursor: "pointer" }}
                        />
                      </td>

                      {/* Observación por producto */}
                      <td style={styles.td}>
                        <input
                          type="text"
                          style={{ ...styles.inputNumber, width: 160 }}
                          placeholder="Opcional..."
                          value={item.observacion}
                          onChange={(e) =>
                            handleCampoDetalle(index, "observacion", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div style={styles.totalContainer}>
            <span style={{ fontFamily: "Lato, sans-serif", fontSize: 16 }}>
              <strong>Total estimado:</strong>{" "}
              {totalEstimado.toLocaleString("es-PY")} Gs.
            </span>
          </div>

          {/* Error */}
          {error && <div style={styles.error}>{error}</div>}
        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          <button
            style={styles.botonCancelar}
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            style={{
              ...styles.botonGuardar,
              opacity: guardando ? 0.6 : 1,
              cursor: guardando ? "not-allowed" : "pointer",
            }}
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

// ── Estilos ──────────────────────────────────────────────────────────────────

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    width: "1100px",
    maxWidth: "96vw",
    maxHeight: "92vh",
    background: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
  },
  header: {
    background: getColor("amarillo"),
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  },
  headerTitulo: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    fontFamily: "Lato, sans-serif",
    color: "#000",
  },
  botonCerrar: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: 4,
  },
  body: {
    padding: "20px 24px",
    overflowY: "auto",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  fila: {
    display: "flex",
    gap: 16,
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "Lato, sans-serif",
    color: "#333",
  },
  select: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1.5px solid #DADADA",
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
    background: "#FAFAFA",
    cursor: "pointer",
  },
  inputText: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1.5px solid #DADADA",
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
    background: "#FAFAFA",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  inputNumber: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },
  cargando: {
    padding: "10px 12px",
    color: "#888",
    fontFamily: "Lato, sans-serif",
    fontSize: 14,
  },
  tablaContainer: {
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    overflow: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 700,
  },
  th: {
    background: getColor("amarillo"),
    padding: "12px 14px",
    textAlign: "center",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "Lato, sans-serif",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #eee",
    transition: "background 0.1s",
  },
  td: {
    padding: "10px 12px",
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
    verticalAlign: "middle",
  },
  totalContainer: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "8px 4px",
  },
  error: {
    background: "#fff0f0",
    border: "1px solid #E30613",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#E30613",
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid #EBEBEB",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    flexShrink: 0,
    background: "#fff",
  },
  botonCancelar: {
    padding: "10px 24px",
    borderRadius: 999,
    border: "1.5px solid #999",
    background: "#fff",
    cursor: "pointer",
    fontSize: 15,
    fontFamily: "Lato, sans-serif",
  },
  botonGuardar: {
    padding: "10px 28px",
    borderRadius: 999,
    border: "none",
    background: getColor("amarillo"),
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "Lato, sans-serif",
  },
};
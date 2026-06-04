import React, { useEffect, useState } from "react";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

const Req = () => <span style={{ color: "red", marginLeft: 2 }}>*</span>;

// Badge de estado de entrega
const BadgeEntrega = ({ totalDevuelto, cantidad }) => {
  if (totalDevuelto >= cantidad)
    return <span style={bs.anulado}>Devuelto</span>;
  if (totalDevuelto > 0)
    return <span style={bs.parcial}>Parcial</span>;
  return <span style={bs.entregado}>Entregado</span>;
};

const bs = {
  entregado: {
    display: "inline-block", fontSize: 10, borderRadius: 4,
    padding: "2px 7px", fontWeight: "bold",
    background: "#E8F5E9", color: "#388e3c",
  },
  parcial: {
    display: "inline-block", fontSize: 10, borderRadius: 4,
    padding: "2px 7px", fontWeight: "bold",
    background: "#FFF8E1", color: "#c8890a",
  },
  anulado: {
    display: "inline-block", fontSize: 10, borderRadius: 4,
    padding: "2px 7px", fontWeight: "bold",
    background: "#FFEBEE", color: "#c0392b",
  },
};

export default function ModalNotaCredito({ factura, idOrden, onClose, onGuardado }) {
  const [form, setForm] = useState({
    nro_nota_credito: "",
    timbrado: "",
    fecha: "",
    motivo: "",
  });
  const [codigo, setCodigo] = useState("");
  const [lineas, setLineas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const idFactura = factura.id_factura_compra ?? factura.id;
  const idProveedorFactura = factura.id_proveedor;

  useEffect(() => {
    const init = async () => {
      try {
        const [resCod, resFactura] = await Promise.all([
          fetchConToken(`${API_BASE}/compras/notas-credito/next-codigo`),
          fetchConToken(`${API_BASE}/compras/facturas/${idFactura}`),
        ]);

        if (resCod.ok) {
          const d = await resCod.json();
          setCodigo(d.codigo_nota_credito);
        }

if (resFactura.ok) {
  const d = await resFactura.json();
  const detalles = d.detalles_facturas_compras || [];

  // ── Filtrar placeholders (precio = 0) ───────────────────────────────
  const detallesSinPlaceholder = detalles.filter(
    (det) => Number(det.precio_unitario) > 0
  );

  // ── Filtrar por proveedor de la factura ──────────────────────────
  const detallesFiltrados = idProveedorFactura
    ? detallesSinPlaceholder.filter(
        (det) =>
          !det.id_proveedor ||
          Number(det.id_proveedor) === Number(idProveedorFactura)
      )
    : detallesSinPlaceholder;

  // ── Calcular cuánto ya fue devuelto por notas anteriores ─────────
  const notasAnteriores = d.notas_credito_compras || [];
  const devueltoPorProducto = {};
  for (const nota of notasAnteriores) {
    for (const nd of nota.detalles_notas_credito_compras || []) {
      devueltoPorProducto[nd.id_producto] =
        (devueltoPorProducto[nd.id_producto] ?? 0) + Number(nd.cantidad);
    }
  }

  setLineas(
    detallesFiltrados.map((det) => {
      const yaDevuelto = devueltoPorProducto[det.id_producto] ?? 0;
      const disponibleDevolver = Math.max(0, Number(det.cantidad) - yaDevuelto);
      return {
        ...det,
        nombre: det.productos?.nombre ?? `Producto ${det.id_producto}`,
        yaDevuelto,
        disponibleDevolver,
        cantidadDevolver: 0,
      };
    })
  );
}
      } catch (err) {
        setError("Error al cargar datos: " + err.message);
      }
    };
    init();
  }, [idFactura]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleCantidad = (idx, valor) => {
    setLineas((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        const cant = Math.min(Math.max(0, Number(valor)), l.disponibleDevolver);
        return { ...l, cantidadDevolver: cant };
      })
    );
  };

  // Determinar si la devolución que se está armando es total
  const esDevolucionTotal = lineas.length > 0 && lineas.every(
    (l) => l.cantidadDevolver + l.yaDevuelto >= Number(l.cantidad)
  );

  const montoTotal = lineas.reduce((acc, l) => {
    const sub = l.cantidadDevolver * Number(l.precio_unitario);
    return acc + sub + sub * 0.1;
  }, 0);

  const handleGuardar = async () => {
    setError("");
    if (!form.nro_nota_credito)
      return setError("El Nro. de Nota es obligatorio.");
    if (!form.timbrado) return setError("El timbrado es obligatorio.");
    if (!form.fecha) return setError("La fecha es obligatoria.");
    if (!form.motivo) return setError("El motivo es obligatorio.");

    const detallesAEnviar = lineas
      .filter((l) => l.cantidadDevolver > 0)
      .map((l) => ({
        id_producto: l.id_producto,
        id_orden_compra_detalle: l.id_orden_compra_detalle ?? null,
        cantidad: l.cantidadDevolver,
        precio_unitario: Number(l.precio_unitario),
        monto_iva: l.cantidadDevolver * Number(l.precio_unitario) * 0.1,
      }));

    if (detallesAEnviar.length === 0)
      return setError("Debés incluir al menos un producto con cantidad mayor a 0.");

    try {
      setGuardando(true);
      const body = {
        id_factura_compra: idFactura,
        nro_nota_credito: form.nro_nota_credito,
        timbrado: form.timbrado,
        fecha: form.fecha,
        monto_total: montoTotal,
        motivo: form.motivo,
        detalles: detallesAEnviar,
      };

      const res = await fetchConToken(`${API_BASE}/compras/notas-credito`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar");

      onGuardado?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      style={ms.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={ms.modal}>
        <div style={ms.header}>
          <div>
            <h2 style={ms.headerTitulo}>Nueva Nota de Crédito</h2>
            <span style={ms.headerSub}>
              Factura: {factura.nro_factura || factura.codigo}
            </span>
          </div>
          <button style={ms.btnX} onClick={onClose}>✕</button>
        </div>

        <div style={ms.cuerpo}>
          {/* ── Advertencia dinámica ── */}
          <div style={{
            background: esDevolucionTotal ? "#FFEBEE" : "#FFF8E1",
            border: `2px solid ${esDevolucionTotal ? "#EF9A9A" : "#FFD54F"}`,
            borderRadius: 8, padding: "12px 16px", fontSize: 13,
            color: esDevolucionTotal ? "#c0392b" : "#c8890a",
          }}>
            {esDevolucionTotal ? (
              <>⚠️ Estás devolviendo <strong>todos los productos</strong> — la factura quedará <strong>anulada</strong> y el stock será revertido.</>
            ) : (
              <>ℹ️ Devolución <strong>parcial</strong> — la factura <strong>mantendrá su estado</strong> — podés emitir notas adicionales por los productos restantes.</>
            )}
          </div>

          {/* ── Información Básica ── */}
          <div style={ms.seccion}>
            <p style={ms.seccionTitulo}>Información Básica</p>
            <div style={ms.grilla2}>
              <div style={ms.campo}>
                <label style={ms.label}>Código</label>
                <div style={ms.inputReadonly}>{codigo || "Generando..."}</div>
              </div>
              <div style={ms.campo}>
                <label style={ms.label}>Nro. Nota de Crédito <Req /></label>
                <input style={ms.input} name="nro_nota_credito"
                  value={form.nro_nota_credito} onChange={handleChange}
                  placeholder="001-001-0000001" />
              </div>
              <div style={ms.campo}>
                <label style={ms.label}>Timbrado <Req /></label>
                <input style={ms.input} name="timbrado"
                  value={form.timbrado} onChange={handleChange}
                  placeholder="Nro. de timbrado" />
              </div>
              <div style={ms.campo}>
                <label style={ms.label}>Fecha <Req /></label>
                <input style={ms.input} type="date" name="fecha"
                  value={form.fecha} onChange={handleChange} />
              </div>
              <div style={{ ...ms.campo, gridColumn: "1 / -1" }}>
                <label style={ms.label}>Motivo de devolución <Req /></label>
                <input style={ms.input} name="motivo"
                  value={form.motivo} onChange={handleChange}
                  placeholder="Descripción del motivo..." />
              </div>
            </div>
          </div>

          {/* ── Productos ── */}
          <div style={ms.seccion}>
            <p style={ms.seccionTitulo}>Productos a Devolver</p>
            <p style={ms.hint}>
              Ingresá la cantidad a devolver por cada producto. Los productos
              con estado <strong>Devuelto</strong> ya fueron completamente
              revertidos en notas anteriores.
            </p>

            {lineas.length === 0 ? (
              <p style={ms.hint}>Cargando productos...</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={ms.tabla}>
                  <thead>
                    <tr>
                      {["Producto", "Estado", "Facturado", "Ya devuelto", "A devolver", "Precio Unit.", "Subtotal"].map(
                        (h) => <th key={h} style={ms.th}>{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {lineas.map((l, idx) => {
                      const subtotal = l.cantidadDevolver * Number(l.precio_unitario);
                      const agotado = l.disponibleDevolver === 0;
                      return (
                        <tr key={idx} style={agotado ? ms.trAgotado : ms.tr}>
                          <td style={ms.td}>
                            <span style={ms.nombreProd}>{l.nombre}</span>
                          </td>
                          <td style={ms.td}>
                            <BadgeEntrega
                              totalDevuelto={l.yaDevuelto}
                              cantidad={Number(l.cantidad)}
                            />
                          </td>
                          <td style={{ ...ms.td, textAlign: "center" }}>
                            {l.cantidad}
                          </td>
                          <td style={{
                            ...ms.td, textAlign: "center",
                            color: l.yaDevuelto > 0 ? "#c0392b" : "#aaa",
                            fontWeight: l.yaDevuelto > 0 ? "bold" : "normal",
                          }}>
                            {l.yaDevuelto > 0 ? l.yaDevuelto : "—"}
                          </td>
                          <td style={{ ...ms.td, textAlign: "center" }}>
                            <input
                              type="number"
                              min={0}
                              max={l.disponibleDevolver}
                              value={l.cantidadDevolver}
                              disabled={agotado}
                              onChange={(e) => handleCantidad(idx, e.target.value)}
                              style={{
                                ...ms.inputNum,
                                background: agotado ? "#f0f0f0" : "#fff",
                                color: agotado ? "#aaa" : "#222",
                              }}
                            />
                          </td>
                          <td style={{ ...ms.td, textAlign: "right" }}>
                            Gs. {Number(l.precio_unitario).toLocaleString("es-PY")}
                          </td>
                          <td style={{ ...ms.td, textAlign: "right", fontWeight: "bold" }}>
                            Gs. {subtotal.toLocaleString("es-PY")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={ms.totalRow}>
              <span>Monto Total (con IVA):</span>
              <span style={ms.totalValor}>
                Gs. {montoTotal.toLocaleString("es-PY")}
              </span>
            </div>
          </div>

          {error && <p style={ms.error}>{error}</p>}
        </div>

        <div style={ms.footer}>
          <button style={ms.btnCancelar} onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button
            style={{ ...ms.btnGuardar, background: esDevolucionTotal ? "#c0392b" : "#e67e22" }}
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : esDevolucionTotal
              ? "Anular Factura"
              : "Emitir Nota de Crédito Parcial"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Estilos modal ────────────────────────────────────────────────────────────
const ms = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: {
    background: "#fff", borderRadius: 12, width: "100%", maxWidth: 860,
    maxHeight: "92vh", overflowY: "auto",
    boxShadow: "0 8px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column",
  },
  header: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    padding: "18px 24px", borderBottom: "2px solid #F0F0F0",
    position: "sticky", top: 0, background: "#fff", zIndex: 1,
  },
  headerTitulo: { margin: 0, fontSize: 20, fontFamily: "Lato", fontWeight: "bold" },
  headerSub: { fontSize: 13, color: "#777", marginTop: 2, display: "block" },
  btnX: {
    background: "none", border: "none", fontSize: 18,
    cursor: "pointer", color: "#555", lineHeight: 1, padding: 4,
  },
  cuerpo: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24 },
  seccion: { display: "flex", flexDirection: "column", gap: 12 },
  seccionTitulo: {
    margin: 0, fontSize: 13, fontWeight: "bold", textTransform: "uppercase",
    letterSpacing: "0.08em", color: "#444",
    borderBottom: "1px solid #E8E8E8", paddingBottom: 6,
  },
  grilla2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" },
  campo: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 13, fontWeight: "600", color: "#333" },
  input: {
    padding: "8px 10px", borderRadius: 6, border: "1px solid #CCC",
    fontSize: 14, fontFamily: "Lato", outline: "none",
    width: "100%", boxSizing: "border-box", background: "#FAFAFA",
  },
  inputReadonly: {
    padding: "8px 10px", borderRadius: 6, border: "1px solid #E0E0E0",
    fontSize: 14, fontFamily: "Lato", background: "#F0F4FF",
    color: "#3355CC", fontWeight: "bold", letterSpacing: "0.04em",
  },
  hint: { margin: 0, fontSize: 13, color: "#888" },
  tabla: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    background: "#F5F5F5", padding: "8px 10px", textAlign: "left",
    fontWeight: "bold", borderBottom: "2px solid #E0E0E0", whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #F0F0F0" },
  trAgotado: { borderBottom: "1px solid #F0F0F0", opacity: 0.5 },
  td: { padding: "8px 10px", verticalAlign: "middle" },
  nombreProd: { fontWeight: "600", display: "block" },
  inputNum: {
    width: 70, padding: "5px 6px", border: "1px solid #CCC",
    borderRadius: 5, textAlign: "center", fontSize: 13, fontFamily: "Lato",
  },
  totalRow: {
    display: "flex", justifyContent: "flex-end", alignItems: "center",
    gap: 16, marginTop: 10, paddingTop: 10,
    borderTop: "2px solid #E0E0E0", fontSize: 15,
  },
  totalValor: { fontWeight: "bold", fontSize: 18, color: "#222" },
  error: { color: "red", fontSize: 13, margin: 0 },
  footer: {
    display: "flex", justifyContent: "flex-end", gap: 12,
    padding: "16px 24px", borderTop: "2px solid #F0F0F0",
    position: "sticky", bottom: 0, background: "#fff",
  },
  btnCancelar: {
    padding: "9px 20px", borderRadius: 6, border: "1px solid #CCC",
    background: "#fff", cursor: "pointer", fontSize: 14, fontFamily: "Lato", color: "#333",
  },
  btnGuardar: {
    padding: "9px 20px", borderRadius: 6, border: "none",
    cursor: "pointer", fontSize: 14, fontFamily: "Lato",
    fontWeight: "bold", color: "#fff",
  },
};
import React, { useEffect, useState } from "react";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

// ─── Utilidades ───────────────────────────────────────────────────────────────
const calcularEntregado = (idOrdenDetalle, facturas) => {
  let total = 0;
  for (const f of facturas || []) {
    if (!f.nro_factura || f.nro_factura.toString().trim() === "") continue;
    for (const d of f.detalles_facturas_compras || f.detalles || []) {
      if (Number(d.precio_unitario) === 0) continue;
      if (d.id_orden_compra_detalle === idOrdenDetalle) {
        total += Number(d.cantidad) || 0;
      }
    }
  }
  return total;
};

// ─── Helpers UI ───────────────────────────────────────────────────────────────
const Req = () => <span style={{ color: "red", marginLeft: 2 }}>*</span>;

const InfoChip = ({ label, valor }) => (
  <div style={ms.chip}>
    <span style={ms.chipLabel}>{label}</span>
    <span style={ms.chipValor}>{valor ?? "-"}</span>
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export default function ModalCargarFactura({ orden, onClose, onGuardado }) {
  // Si no viene orden, entramos en modo selector de código
  const modoSelectorCodigo = !orden;

  const [idOrden, setIdOrden] = useState(orden?.id_orden ?? orden?.id ?? null);

  // ── Estado del selector de código (solo modoSelectorCodigo) ──────────────
  const [codigosDisponibles, setCodigosDisponibles]   = useState([]);
  const [codigoSeleccionado, setCodigoSeleccionado]   = useState("");
  const [loadingCodigos, setLoadingCodigos]           = useState(false);
  const [errorSelector, setErrorSelector]             = useState("");
  const [facturaEncontrada, setFacturaEncontrada]     = useState(null); // factura placeholder cargada
  const [buscandoCodigo, setBuscandoCodigo]           = useState(false);

  // ── Estado principal del formulario ──────────────────────────────────────
  const [form, setForm] = useState({
    nro_factura:       "",
    timbrado:          "",
    fecha_emision:     "",
    fecha_vencimiento: "",
    id_proveedor:      "",
  });

  const [codigoFactura, setCodigoFactura]     = useState("");
  const [proveedorInfo, setProveedorInfo]     = useState(null);
  const [loadingProveedor, setLoadingProveedor] = useState(false);
  const [lineas, setLineas]                   = useState([]);
  const [proveedores, setProveedores]         = useState([]);
  const [guardando, setGuardando]             = useState(false);
  const [error, setError]                     = useState("");
  const [facturaPlaceholderId, setFacturaPlaceholderId] = useState(null);

  // ── 1. Modo normal: init igual que antes ─────────────────────────────────
  useEffect(() => {
    if (modoSelectorCodigo) return; // lo maneja el otro useEffect

    const init = async () => {
      try {
        const [resCod, resProv, resOrden] = await Promise.all([
          fetchConToken(`${API_BASE}/compras/facturas/next-codigo`),
          fetchConToken(`${API_BASE}/compras/proveedores`),
          fetchConToken(`${API_BASE}/compras/ordenes-compra/${idOrden}`),
        ]);

        if (resCod.ok) {
          const d = await resCod.json();
          setCodigoFactura(d.codigo_factura);
        }

        if (resProv.ok) {
          const d = await resProv.json();
          setProveedores(d || []);
        }

        if (resOrden.ok) {
          const d = await resOrden.json();
          const ordenData = d.orden || d;
          const facturasPrevias = ordenData.facturas || [];
          const placeholder = facturasPrevias.find(
            (f) => !f.nro_factura || f.nro_factura.toString().trim() === ""
          );
          if (placeholder) {
            setFacturaPlaceholderId(placeholder.id_factura_compra ?? placeholder.id);
          }
          const detalles = ordenData.detalle || ordenData.detalles_ordenes_compras || [];
          const lineasIniciales = detalles
            .filter((det) => (det.estado || "").toLowerCase() !== "anulado")
            .map((det) => {
              const entregado = calcularEntregado(
                det.id_detalle_orden ?? det.id_orden_compra_detalle,
                facturasPrevias
              );
              const pendiente = Math.max(0, (det.cantidad || 0) - entregado);
              return {
                ...det,
                cantidadEntregada: entregado,
                cantidadPendiente: pendiente,
                cantidadFacturar:  0,
                precio_unitario:   det.precio_unitario ?? det.precio ?? 0,
                porcentaje_iva:    det.porcentaje_iva ?? 10,
              };
            });
          setLineas(lineasIniciales);
          if (ordenData.id_proveedor) {
            setForm((p) => ({ ...p, id_proveedor: String(ordenData.id_proveedor) }));
          }
        }
      } catch (err) {
        setError("Error al inicializar el formulario: " + err.message);
      }
    };
    init();
  }, [idOrden, modoSelectorCodigo]);

  // ── 2. Modo selector: cargar lista de códigos placeholder disponibles ─────
  useEffect(() => {
    if (!modoSelectorCodigo) return;
    const cargarCodigos = async () => {
      try {
        setLoadingCodigos(true);
        // Traemos todas las facturas de la tabla y filtramos las placeholder
        // (sin nro_factura = pendientes de confirmar)
        const res = await fetchConToken(`${API_BASE}/compras/facturas`);
        if (!res.ok) throw new Error("No se pudo cargar la lista de facturas");
        const data = await res.json();
        const placeholders = (data || []).filter(
          (f) => !f.nro_factura || f.nro_factura.toString().trim() === ""
        );
        setCodigosDisponibles(placeholders);
      } catch (err) {
        setErrorSelector(err.message);
      } finally {
        setLoadingCodigos(false);
      }
    };
    cargarCodigos();
  }, [modoSelectorCodigo]);

  // ── 3. Cuando se elige un código, buscar la factura y poblar el formulario ─
  const handleSeleccionarCodigo = async (codigo) => {
    setCodigoSeleccionado(codigo);
    setFacturaEncontrada(null);
    setLineas([]);
    setError("");
    setErrorSelector("");
    if (!codigo) return;

    try {
      setBuscandoCodigo(true);

      const res = await fetchConToken(
        `${API_BASE}/compras/facturas/codigo/${encodeURIComponent(codigo)}`
      );
      if (!res.ok) throw new Error("No se encontró la factura con ese código");
      const factura = await res.json();

      setFacturaEncontrada(factura);
      setFacturaPlaceholderId(factura.id_factura_compra);
      setCodigoFactura(factura.codigo_factura);

      // Proveedor automático
      const idProv = factura.id_proveedor
        ?? factura.proveedores?.id_proveedor
        ?? "";
      setForm((p) => ({ ...p, id_proveedor: String(idProv) }));

      // Orden asociada
      const idOrd =
        factura.id_orden_compra ??
        factura.ordenes_compras?.id_orden ??
        null;
      setIdOrden(idOrd);

      if (idOrd) {
        // Cargar los detalles de la orden para mostrar la tabla de productos
        const resOrden = await fetchConToken(
          `${API_BASE}/compras/ordenes-compra/${idOrd}`
        );
        if (resOrden.ok) {
          const d       = await resOrden.json();
          const ordenData = d.orden || d;
          const facturasPrevias = ordenData.facturas || [];
          const detalles = ordenData.detalle || ordenData.detalles_ordenes_compras || [];
          const lineasIniciales = detalles
            .filter((det) => (det.estado || "").toLowerCase() !== "anulado")
            .map((det) => {
              const entregado = calcularEntregado(
                det.id_detalle_orden ?? det.id_orden_compra_detalle,
                facturasPrevias
              );
              const pendiente = Math.max(0, (det.cantidad || 0) - entregado);
              return {
                ...det,
                cantidadEntregada: entregado,
                cantidadPendiente: pendiente,
                cantidadFacturar:  0,
                precio_unitario:   det.precio_unitario ?? det.precio ?? 0,
                porcentaje_iva:    det.porcentaje_iva ?? 10,
              };
            });
          setLineas(lineasIniciales);
        }
      }
    } catch (err) {
      setErrorSelector(err.message);
      setFacturaEncontrada(null);
    } finally {
      setBuscandoCodigo(false);
    }
  };

  // ── Cargar info del proveedor cuando cambia id_proveedor ─────────────────
  useEffect(() => {
    if (!form.id_proveedor) { setProveedorInfo(null); return; }
    const cargar = async () => {
      try {
        setLoadingProveedor(true);
        const res = await fetchConToken(
          `${API_BASE}/compras/proveedores/${form.id_proveedor}`
        );
        if (res.ok) {
          const d    = await res.json();
          const prov = Array.isArray(d) ? d[0] : d;
          setProveedorInfo(prov);
        }
      } catch {
        setProveedorInfo(null);
      } finally {
        setLoadingProveedor(false);
      }
    };
    cargar();
  }, [form.id_proveedor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleCantidadFacturar = (idx, valor) => {
    setLineas((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        const cant = Math.min(Math.max(0, Number(valor)), l.cantidadPendiente);
        return { ...l, cantidadFacturar: cant };
      })
    );
  };

  const importeTotal = lineas.reduce((acc, l) => {
    const sub = l.cantidadFacturar * l.precio_unitario;
    const iva = sub * (l.porcentaje_iva / 100);
    return acc + sub + iva;
  }, 0);

  const handleGuardar = async () => {
    setError("");
    if (!form.nro_factura)   return setError("El Nro. de Factura es obligatorio.");
    if (!form.id_proveedor)  return setError("Seleccioná un proveedor.");
    if (!form.timbrado)      return setError("El timbrado es obligatorio.");
    if (!facturaPlaceholderId) return setError("No se encontró la factura asociada.");

    const detallesAEnviar = lineas
      .filter((l) => l.cantidadFacturar > 0)
      .map((l) => ({
        id_producto:             l.id_producto,
        id_orden_compra_detalle: l.id_detalle_orden ?? l.id_orden_compra_detalle,
        cantidad:                l.cantidadFacturar,
        precio_unitario:         l.precio_unitario,
        porcentaje_iva:          l.porcentaje_iva,
        monto_iva:               l.cantidadFacturar * l.precio_unitario * (l.porcentaje_iva / 100),
        subtotal:                l.cantidadFacturar * l.precio_unitario,
      }));

    if (detallesAEnviar.length === 0)
      return setError("Debés incluir al menos un producto con cantidad mayor a 0.");

    try {
      setGuardando(true);
      const body = {
        id_proveedor:      Number(form.id_proveedor),
        id_orden_compra:   idOrden,
        timbrado:          form.timbrado,
        nro_factura:       form.nro_factura,
        fecha_emision:     form.fecha_emision     || null,
        fecha_vencimiento: form.fecha_vencimiento || null,
        importe_total:     importeTotal,
        codigo_factura:    codigoFactura,
        detalles:          detallesAEnviar,
      };

      const res = await fetchConToken(
        `${API_BASE}/compras/facturas/${facturaPlaceholderId}/confirmar`,
        {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        }
      );
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

  const persona = proveedorInfo?.personas;

  // ── Título dinámico del header ────────────────────────────────────────────
  const tituloOrden = modoSelectorCodigo
    ? facturaEncontrada
      ? facturaEncontrada.ordenes_compras?.codigo_orden ?? "Orden cargada"
      : "Seleccioná un código"
    : (orden?.codigo ?? orden?.codigo_orden ?? idOrden);

  // Si estamos en modo selector y aún no encontramos factura, bloqueamos el form
  const formularioBloqueado = modoSelectorCodigo && !facturaEncontrada;

  return (
    <div style={ms.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={ms.modal}>

        {/* ── Header ── */}
        <div style={ms.header}>
          <div>
            <h2 style={ms.headerTitulo}>Nueva Factura</h2>
            <span style={ms.headerSub}>Orden: {tituloOrden}</span>
          </div>
          <button style={ms.btnX} onClick={onClose}>✕</button>
        </div>

        <div style={ms.cuerpo}>

          {/* ── Selector de código (solo modoSelectorCodigo) ── */}
          {modoSelectorCodigo && (
            <div style={ms.seccion}>
              <p style={ms.seccionTitulo}>Seleccionar Factura Pendiente</p>
              <p style={ms.hint}>
                Elegí el código de la factura que querés confirmar.
                El proveedor se completará automáticamente.
              </p>

              {loadingCodigos ? (
                <p style={ms.hint}>Cargando facturas disponibles...</p>
              ) : (
                <div style={ms.campo}>
                  <label style={ms.label}>
                    Código de Factura<Req />
                  </label>
                  <select
                    style={ms.input}
                    value={codigoSeleccionado}
                    onChange={(e) => handleSeleccionarCodigo(e.target.value)}
                    disabled={buscandoCodigo}
                  >
                    <option value="">-- Seleccionar --</option>
                    {codigosDisponibles.map((f) => (
                      <option key={f.id_factura_compra} value={f.codigo_factura}>
                        {f.codigo_factura}
                        {f.ordenes_compras?.codigo_orden
                          ? ` — Orden: ${f.ordenes_compras.codigo_orden}`
                          : ""}
                      </option>
                    ))}
                  </select>
                  {buscandoCodigo && (
                    <p style={ms.hint}>Buscando factura...</p>
                  )}
                  {errorSelector && (
                    <p style={ms.error}>{errorSelector}</p>
                  )}
                </div>
              )}

              {/* Confirmación visual de lo que se encontró */}
              {facturaEncontrada && !buscandoCodigo && (
                <div style={ms.confirmacionBox}>
                  <span style={ms.confirmacionIcono}>✓</span>
                  <div>
                    <p style={ms.confirmacionTitulo}>Factura encontrada</p>
                    <p style={ms.confirmacionSub}>
                      Orden:{" "}
                      <strong>
                        {facturaEncontrada.ordenes_compras?.codigo_orden ?? idOrden}
                      </strong>
                      {" · "}
                      Proveedor completado automáticamente
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Información Básica (bloqueada hasta elegir código en modo selector) ── */}
          <div style={{ ...ms.seccion, opacity: formularioBloqueado ? 0.4 : 1, pointerEvents: formularioBloqueado ? "none" : "auto" }}>
            <p style={ms.seccionTitulo}>Información Básica</p>
            <div style={ms.grilla2}>
              <div style={ms.campo}>
                <label style={ms.label}>Código de Factura</label>
                <div style={ms.inputReadonly}>
                  {codigoFactura || <span style={{ color: "#aaa" }}>Generando...</span>}
                </div>
              </div>

              <div style={ms.campo}>
                <label style={ms.label}>Nro. de Factura <Req /></label>
                <input
                  style={ms.input}
                  name="nro_factura"
                  value={form.nro_factura}
                  onChange={handleChange}
                  placeholder="001-001-0000001"
                />
              </div>

              <div style={ms.campo}>
                <label style={ms.label}>Timbrado <Req /></label>
                <input
                  style={ms.input}
                  name="timbrado"
                  value={form.timbrado}
                  onChange={handleChange}
                  placeholder="Nro. de timbrado"
                />
              </div>

              <div style={ms.campo}>
                <label style={ms.label}>Estado</label>
                <div style={ms.inputReadonly}>Confirmado</div>
              </div>

              <div style={ms.campo}>
                <label style={ms.label}>Fecha de Emisión</label>
                <input
                  style={ms.input}
                  type="date"
                  name="fecha_emision"
                  value={form.fecha_emision}
                  onChange={handleChange}
                />
              </div>

              <div style={ms.campo}>
                <label style={ms.label}>Fecha de Vencimiento</label>
                <input
                  style={ms.input}
                  type="date"
                  name="fecha_vencimiento"
                  value={form.fecha_vencimiento}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* ── Información del Proveedor ── */}
          <div style={{ ...ms.seccion, opacity: formularioBloqueado ? 0.4 : 1, pointerEvents: formularioBloqueado ? "none" : "auto" }}>
            <p style={ms.seccionTitulo}>Información del Proveedor</p>

            <div style={ms.campo}>
              <label style={ms.label}>Proveedor</label>
              {/* En modo selector el proveedor es readonly (viene de la factura) */}
              {modoSelectorCodigo ? (
                <div style={ms.inputReadonly}>
                  {loadingProveedor
                    ? "Cargando..."
                    : proveedorInfo
                    ? `${proveedorInfo.personas?.nombre ?? ""} ${proveedorInfo.personas?.apellido ?? ""}`.trim()
                    : codigoSeleccionado
                    ? "Cargando proveedor..."
                    : "-"}
                </div>
              ) : (
                <div style={ms.inputReadonly}>
                  {proveedores.find((p) => String(p.id_proveedor) === String(form.id_proveedor))
                    ? `${proveedores.find((p) => String(p.id_proveedor) === String(form.id_proveedor))?.personas?.nombre} ${proveedores.find((p) => String(p.id_proveedor) === String(form.id_proveedor))?.personas?.apellido}`
                    : proveedorInfo
                    ? `${proveedorInfo.personas?.nombre ?? ""} ${proveedorInfo.personas?.apellido ?? ""}`.trim()
                    : "Cargando..."}
                </div>
              )}
            </div>

            {loadingProveedor && <p style={ms.hint}>Cargando datos del proveedor...</p>}

            {!loadingProveedor && proveedorInfo && (
              <div style={ms.infoGrid}>
                <InfoChip label="RUC"          valor={persona?.ruc} />
                <InfoChip label="Teléfono"     valor={persona?.telefono} />
                <InfoChip label="Correo"       valor={persona?.correo} />
                <InfoChip label="Dirección"    valor={persona?.direccion} />
                <InfoChip label="Tipo Persona" valor={persona?.tipo_persona} />
                <InfoChip
                  label="Plazo Entrega"
                  valor={proveedorInfo?.plazo_entrega ? `${proveedorInfo.plazo_entrega} días` : null}
                />
              </div>
            )}
          </div>

          {/* ── Productos de la Orden ── */}
          <div style={{ ...ms.seccion, opacity: formularioBloqueado ? 0.4 : 1, pointerEvents: formularioBloqueado ? "none" : "auto" }}>
            <p style={ms.seccionTitulo}>Productos de la Orden</p>
            <p style={ms.hint}>
              Ingresá la cantidad que el proveedor entrega en esta factura. No puede superar el pendiente.
            </p>

            {lineas.length === 0 ? (
              <p style={ms.hint}>
                {formularioBloqueado ? "Seleccioná un código para ver los productos." : "Cargando productos..."}
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={ms.tabla}>
                  <thead>
                    <tr>
                      {["Producto","Solicitado","Entregado","Pendiente","A Facturar","Precio Unit.","Subtotal"].map((h) => (
                        <th key={h} style={ms.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lineas.map((l, idx) => {
                      const subtotal = l.cantidadFacturar * l.precio_unitario;
                      const pendiente = l.cantidadPendiente;
                      return (
                        <tr key={idx} style={pendiente === 0 ? ms.trCerrado : ms.tr}>
                          <td style={ms.td}>
                            <span style={ms.nombreProd}>
                              {l.producto ?? l.productos?.nombre ?? `Producto ${idx + 1}`}
                            </span>
                            {pendiente === 0 && <span style={ms.badge}>Completado</span>}
                          </td>
                          <td style={{ ...ms.td, textAlign: "center" }}>{l.cantidad}</td>
                          <td style={{ ...ms.td, textAlign: "center" }}>{l.cantidadEntregada}</td>
                          <td style={{ ...ms.td, textAlign: "center", fontWeight: "bold", color: pendiente > 0 ? "#c8890a" : "#4caf50" }}>
                            {pendiente}
                          </td>
                          <td style={{ ...ms.td, textAlign: "center" }}>
                            <input
                              type="number"
                              min={0}
                              max={pendiente}
                              value={l.cantidadFacturar}
                              disabled={pendiente === 0}
                              onChange={(e) => handleCantidadFacturar(idx, e.target.value)}
                              style={{ ...ms.inputNum, background: pendiente === 0 ? "#f0f0f0" : "#fff", color: pendiente === 0 ? "#aaa" : "#222" }}
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
              <span>Importe Total (con IVA):</span>
              <span style={ms.totalValor}>Gs. {importeTotal.toLocaleString("es-PY")}</span>
            </div>
          </div>

          {error && <p style={ms.error}>{error}</p>}
        </div>

        {/* ── Footer ── */}
        <div style={ms.footer}>
          <button style={ms.btnCancelar} onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button
            style={{ ...ms.btnGuardar, opacity: formularioBloqueado ? 0.5 : 1, cursor: formularioBloqueado ? "not-allowed" : "pointer" }}
            onClick={handleGuardar}
            disabled={guardando || formularioBloqueado}
          >
            {guardando ? "Guardando..." : "Guardar Factura"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const ms = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 12, width: "100%", maxWidth: 820, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "18px 24px", borderBottom: "2px solid #F0F0F0", position: "sticky", top: 0, background: "#fff", zIndex: 1 },
  headerTitulo: { margin: 0, fontSize: 20, fontFamily: "Lato", fontWeight: "bold" },
  headerSub: { fontSize: 13, color: "#777", marginTop: 2, display: "block" },
  btnX: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#555", lineHeight: 1, padding: 4 },
  cuerpo: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24 },
  seccion: { display: "flex", flexDirection: "column", gap: 12 },
  seccionTitulo: { margin: 0, fontSize: 13, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", borderBottom: "1px solid #E8E8E8", paddingBottom: 6 },
  grilla2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" },
  campo: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 13, fontWeight: "600", color: "#333" },
  input: { padding: "8px 10px", borderRadius: 6, border: "1px solid #CCC", fontSize: 14, fontFamily: "Lato", outline: "none", width: "100%", boxSizing: "border-box", background: "#FAFAFA" },
  inputReadonly: { padding: "8px 10px", borderRadius: 6, border: "1px solid #E0E0E0", fontSize: 14, fontFamily: "Lato", background: "#F0F4FF", color: "#3355CC", fontWeight: "bold", letterSpacing: "0.04em" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  chip: { background: "#F9F9F9", border: "1px solid #E0E0E0", borderRadius: 6, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 2 },
  chipLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#888", fontWeight: "600" },
  chipValor: { fontSize: 14, fontWeight: "bold", color: "#222" },
  hint: { margin: 0, fontSize: 13, color: "#888" },
  tabla: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { background: "#F5F5F5", padding: "8px 10px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #E0E0E0", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #F0F0F0" },
  trCerrado: { borderBottom: "1px solid #F0F0F0", opacity: 0.5 },
  td: { padding: "8px 10px", verticalAlign: "middle" },
  nombreProd: { fontWeight: "600", display: "block" },
  badge: { display: "inline-block", marginTop: 2, fontSize: 10, background: "#E8F5E9", color: "#388e3c", borderRadius: 4, padding: "1px 6px", fontWeight: "bold" },
  inputNum: { width: 70, padding: "5px 6px", border: "1px solid #CCC", borderRadius: 5, textAlign: "center", fontSize: 13, fontFamily: "Lato" },
  totalRow: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16, marginTop: 10, paddingTop: 10, borderTop: "2px solid #E0E0E0", fontSize: 15 },
  totalValor: { fontWeight: "bold", fontSize: 18, color: "#222" },
  error: { color: "red", fontSize: 13, margin: 0 },
  footer: { display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px", borderTop: "2px solid #F0F0F0", position: "sticky", bottom: 0, background: "#fff" },
  btnCancelar: { padding: "9px 20px", borderRadius: 6, border: "1px solid #CCC", background: "#fff", cursor: "pointer", fontSize: 14, fontFamily: "Lato", color: "#333" },
  btnGuardar: { padding: "9px 20px", borderRadius: 6, border: "none", background: "#222", color: "#fff", fontSize: 14, fontFamily: "Lato", fontWeight: "bold" },
  confirmacionBox: { display: "flex", alignItems: "flex-start", gap: 12, background: "#F0FFF4", border: "1px solid #C6F6D5", borderRadius: 8, padding: "12px 16px" },
  confirmacionIcono: { fontSize: 20, color: "#38A169", lineHeight: 1, marginTop: 2 },
  confirmacionTitulo: { margin: 0, fontWeight: "bold", fontSize: 14, color: "#276749" },
  confirmacionSub: { margin: "2px 0 0", fontSize: 13, color: "#2F855A" },
};
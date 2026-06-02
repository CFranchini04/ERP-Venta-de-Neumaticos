import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getColor } from "../../../components/Colors";
import List from "../../../components/Lista";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

// ─── Utilidades ──────────────────────────────────────────────────────────────

const calcularEntregado = (idOrdenDetalle, facturas) => {
  let total = 0;
  for (const f of facturas || []) {
    for (const d of f.detalles_facturas_compras || f.detalles || []) {
      if (d.id_orden_compra_detalle === idOrdenDetalle) {
        total += Number(d.cantidad) || 0;
      }
    }
  }
  return total;
};

// ─── Modal ───────────────────────────────────────────────────────────────────
function ModalCargarFactura({ orden, onClose, onGuardado }) {
  const idOrden = orden?.id_orden ?? orden?.id;

  const [form, setForm] = useState({
    nro_factura: "",
    timbrado: "",
    fecha_emision: "",
    fecha_vencimiento: "",
    id_estado: "",
    id_proveedor: "",
  });

  const [codigoFactura, setCodigoFactura] = useState("");

  const [proveedorInfo, setProveedorInfo] = useState(null);
  const [loadingProveedor, setLoadingProveedor] = useState(false);

  const [lineas, setLineas] = useState([]);

  const [proveedores, setProveedores] = useState([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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

          const detalles =
            ordenData.detalle || ordenData.detalles_ordenes_compras || [];
          const lineasIniciales = detalles.map((det) => {
            const entregado = calcularEntregado(
              det.id_detalle_orden ?? det.id_orden_compra_detalle,
              facturasPrevias,
            );
            const pendiente = Math.max(0, (det.cantidad || 0) - entregado);
            return {
              ...det,
              cantidadEntregada: entregado,
              cantidadPendiente: pendiente,
              cantidadFacturar: 0,
              precio_unitario: det.precio_unitario ?? det.precio ?? 0,
              porcentaje_iva: det.porcentaje_iva ?? 10,
            };
          });
          setLineas(lineasIniciales);

          if (ordenData.id_proveedor) {
            setForm((p) => ({
              ...p,
              id_proveedor: String(ordenData.id_proveedor),
            }));
          }
        }
      } catch (err) {
        setError("Error al inicializar el formulario: " + err.message);
      }
    };
    init();
  }, [idOrden]);

  useEffect(() => {
    if (!form.id_proveedor) {
      setProveedorInfo(null);
      return;
    }
    const cargar = async () => {
      try {
        setLoadingProveedor(true);
        const res = await fetchConToken(
          `${API_BASE}/compras/proveedores/${form.id_proveedor}`,
        );
        if (res.ok) {
          const d = await res.json();
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
      }),
    );
  };

  const importeTotal = lineas.reduce((acc, l) => {
    const sub = l.cantidadFacturar * l.precio_unitario;
    const iva = sub * (l.porcentaje_iva / 100);
    return acc + sub + iva;
  }, 0);

  const handleGuardar = async () => {
    setError("");
    if (!form.nro_factura)
      return setError("El Nro. de Factura es obligatorio.");
    if (!form.id_proveedor) return setError("Seleccioná un proveedor.");
    if (!form.id_estado) return setError("Seleccioná un estado.");
    if (!form.timbrado) return setError("El timbrado es obligatorio.");

    const detallesAEnviar = lineas
      .filter((l) => l.cantidadFacturar > 0)
      .map((l) => ({
        id_producto: l.id_producto,
        id_orden_compra_detalle:
          l.id_detalle_orden ?? l.id_orden_compra_detalle,
        cantidad: l.cantidadFacturar,
        precio_unitario: l.precio_unitario,
        porcentaje_iva: l.porcentaje_iva,
        monto_iva:
          l.cantidadFacturar * l.precio_unitario * (l.porcentaje_iva / 100),
        subtotal: l.cantidadFacturar * l.precio_unitario,
      }));

    if (detallesAEnviar.length === 0)
      return setError(
        "Debes incluir al menos un producto con cantidad mayor a 0.",
      );

    try {
      setGuardando(true);
      const body = {
        id_proveedor: Number(form.id_proveedor),
        id_orden_compra: idOrden,
        timbrado: form.timbrado,
        nro_factura: form.nro_factura,
        fecha_emision: form.fecha_emision || null,
        fecha_vencimiento: form.fecha_vencimiento || null,
        importe_total: importeTotal,
        id_estado: Number(form.id_estado),
        codigo_factura: codigoFactura,
        detalles: detallesAEnviar,
      };

      const res = await fetchConToken(`${API_BASE}/compras/facturas`, {
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

  const persona = proveedorInfo?.personas;

  return (
    <div
      style={ms.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={ms.modal}>
        {/* ── Header ── */}
        <div style={ms.header}>
          <div>
            <h2 style={ms.headerTitulo}>Nueva Factura</h2>
            <span style={ms.headerSub}>
              Orden: {orden?.codigo ?? orden?.codigo_orden ?? idOrden}
            </span>
          </div>
          <button style={ms.btnX} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={ms.cuerpo}>
          {/* ── Información Básica ── */}
          <div style={ms.seccion}>
            <p style={ms.seccionTitulo}>Información Básica</p>
            <div style={ms.grilla2}>
              {/* Código generado */}
              <div style={ms.campo}>
                <label style={ms.label}>Código de Factura</label>
                <div style={ms.inputReadonly}>
                  {codigoFactura || (
                    <span style={{ color: "#aaa" }}>Generando...</span>
                  )}
                </div>
              </div>

              {/* Nro factura */}
              <div style={ms.campo}>
                <label style={ms.label}>
                  Nro. de Factura <Req />
                </label>
                <input
                  style={ms.input}
                  name="nro_factura"
                  value={form.nro_factura}
                  onChange={handleChange}
                  placeholder="001-001-0000001"
                />
              </div>

              {/* Timbrado */}
              <div style={ms.campo}>
                <label style={ms.label}>
                  Timbrado <Req />
                </label>
                <input
                  style={ms.input}
                  name="timbrado"
                  value={form.timbrado}
                  onChange={handleChange}
                  placeholder="Nro. de timbrado"
                />
              </div>

              {/* Estado */}
              <div style={ms.campo}>
                <label style={ms.label}>
                  Estado <Req />
                </label>
                <select
                  style={ms.input}
                  name="id_estado"
                  value={form.id_estado}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar estado</option>
                  <option value="2">Pendiente</option>
                  <option value="3">Confirmado</option>
                </select>
              </div>

              {/* Fecha emisión */}
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

              {/* Fecha vencimiento */}
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
          <div style={ms.seccion}>
            <p style={ms.seccionTitulo}>Información del Proveedor</p>

            <div style={ms.campo}>
              <label style={ms.label}>
                Seleccionar Proveedor <Req />
              </label>
              <select
                style={ms.input}
                name="id_proveedor"
                value={form.id_proveedor}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                {proveedores.map((p) => (
                  <option key={p.id_proveedor} value={p.id_proveedor}>
                    {p.personas?.nombre} {p.personas?.apellido}
                  </option>
                ))}
              </select>
            </div>

            {loadingProveedor && (
              <p style={ms.hint}>Cargando datos del proveedor...</p>
            )}

            {!loadingProveedor && proveedorInfo && (
              <div style={ms.infoGrid}>
                <InfoChip label="RUC" valor={persona?.ruc} />
                <InfoChip label="Teléfono" valor={persona?.telefono} />
                <InfoChip label="Correo" valor={persona?.correo} />
                <InfoChip label="Dirección" valor={persona?.direccion} />
                <InfoChip label="Tipo Persona" valor={persona?.tipo_persona} />
                <InfoChip
                  label="Plazo Entrega"
                  valor={
                    proveedorInfo?.plazo_entrega
                      ? `${proveedorInfo.plazo_entrega} días`
                      : null
                  }
                />
              </div>
            )}
          </div>

          {/* ── Productos de la Orden ── */}
          <div style={ms.seccion}>
            <p style={ms.seccionTitulo}>Productos de la Orden</p>
            <p style={ms.hint}>
              Ingresa la cantidad que el proveedor entrega en esta factura. No
              puede superar el pendiente.
            </p>

            {lineas.length === 0 ? (
              <p style={ms.hint}>Cargando productos...</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={ms.tabla}>
                  <thead>
                    <tr>
                      {[
                        "Producto",
                        "Solicitado",
                        "Entregado",
                        "Pendiente",
                        "A Facturar",
                        "Precio Unit.",
                        "Subtotal",
                      ].map((h) => (
                        <th key={h} style={ms.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lineas.map((l, idx) => {
                      const subtotal = l.cantidadFacturar * l.precio_unitario;
                      const pendiente = l.cantidadPendiente;
                      return (
                        <tr
                          key={idx}
                          style={pendiente === 0 ? ms.trCerrado : ms.tr}
                        >
                          <td style={ms.td}>
                            <span style={ms.nombreProd}>
                              {l.producto ??
                                l.productos?.nombre ??
                                `Producto ${idx + 1}`}
                            </span>
                            {pendiente === 0 && (
                              <span style={ms.badge}>Completado</span>
                            )}
                          </td>
                          <td style={{ ...ms.td, textAlign: "center" }}>
                            {l.cantidad}
                          </td>
                          <td style={{ ...ms.td, textAlign: "center" }}>
                            {l.cantidadEntregada}
                          </td>
                          <td
                            style={{
                              ...ms.td,
                              textAlign: "center",
                              fontWeight: "bold",
                              color: pendiente > 0 ? "#c8890a" : "#4caf50",
                            }}
                          >
                            {pendiente}
                          </td>
                          <td style={{ ...ms.td, textAlign: "center" }}>
                            <input
                              type="number"
                              min={0}
                              max={pendiente}
                              value={l.cantidadFacturar}
                              disabled={pendiente === 0}
                              onChange={(e) =>
                                handleCantidadFacturar(idx, e.target.value)
                              }
                              style={{
                                ...ms.inputNum,
                                background:
                                  pendiente === 0 ? "#f0f0f0" : "#fff",
                                color: pendiente === 0 ? "#aaa" : "#222",
                              }}
                            />
                          </td>
                          <td style={{ ...ms.td, textAlign: "right" }}>
                            Gs.{" "}
                            {Number(l.precio_unitario).toLocaleString("es-PY")}
                          </td>
                          <td
                            style={{
                              ...ms.td,
                              textAlign: "right",
                              fontWeight: "bold",
                            }}
                          >
                            Gs. {subtotal.toLocaleString("es-PY")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total */}
            <div style={ms.totalRow}>
              <span>Importe Total (con IVA):</span>
              <span style={ms.totalValor}>
                Gs. {importeTotal.toLocaleString("es-PY")}
              </span>
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
            style={ms.btnGuardar}
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar Factura"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────
const Req = () => <span style={{ color: "red", marginLeft: 2 }}>*</span>;

const InfoChip = ({ label, valor }) => (
  <div style={ms.chip}>
    <span style={ms.chipLabel}>{label}</span>
    <span style={ms.chipValor}>{valor ?? "-"}</span>
  </div>
);

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function InformacionOrden({
  usuario,
  orden,
  onVolver,
  onLogout,
  onNavegar,
}) {
  const [tabActiva, setTabActiva] = useState("detalle");
  const [ordenCompleta, setOrdenCompleta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  const { id: idParam } = useParams();
  const idOrden = orden?.id_orden ?? orden?.id ?? idParam;

  const cargarOrden = async () => {
    if (!idOrden) return;
    try {
      setLoading(true);
      setError("");
      const response = await fetchConToken(
        `${API_BASE}/compras/ordenes-compra/${idOrden}`,
      );
      const dataOrden = await response.json();
      if (!response.ok)
        throw new Error(dataOrden.message || "No se pudo cargar la orden");
      setOrdenCompleta({
        ...dataOrden.orden,
        detalle: dataOrden.orden?.detalle || [],
        facturas: dataOrden.orden?.facturas || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOrden();
  }, [idOrden]);

  const ordenActual = ordenCompleta || orden;

  const columnsDetalle = [
    { key: "producto", label: "Producto" },
    { key: "categoria", label: "Categoría" },
    { key: "marca", label: "Marca" },
    { key: "estado", label: "Estado" },
    { key: "cantidad", label: "Cantidad" },
    { key: "precio", label: "Precio" },
    { key: "total", label: "Total" },
  ];

  const columnsFacturas = [
    { key: "codigo", label: "Código" },
    { key: "proveedor", label: "Proveedor" },
    { key: "nro_factura", label: "Nro. Factura" },
    { key: "fecha_emision", label: "Fecha Emisión" },
    { key: "fecha_vencimiento", label: "Fecha Vencimiento" },
    { key: "estado", label: "Estado" },
    { key: "importe_total", label: "Importe Total" },
  ];

  if (!ordenActual) return <div>No hay orden seleccionada</div>;

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Ordenes de Compra</h1>
          <div style={styles.separador} />
        </header>

        {error && <div style={{ color: "red" }}>{error}</div>}

        <div style={styles.contenedorEncabezado}>
          <h3 style={styles.subtitulo}>Información de la Orden</h3>
          <div style={styles.subcontenedor}>
            <div style={styles.item}>
              <strong>Código:</strong>{" "}
              {ordenActual.codigo ?? ordenActual.codigo_orden ?? "-"}
            </div>
            <div style={styles.item}>
              <strong>Estado:</strong> {ordenActual.estado || "-"}
            </div>
            <div style={styles.item}>
              <strong>Fecha:</strong> {ordenActual.fecha ?? "-"}
            </div>
            <div style={styles.item}>
              <strong>Proveedor:</strong> {ordenActual.proveedor ?? "-"}
            </div>
          </div>
        </div>

        <div style={styles.detalle}>
          <div style={styles.tabs}>
            <div
              onClick={() => setTabActiva("detalle")}
              style={tabActiva === "detalle" ? styles.tabActiva : styles.tab}
            >
              Detalle de Orden
            </div>
            <div
              onClick={() => setTabActiva("facturas")}
              style={tabActiva === "facturas" ? styles.tabActiva : styles.tab}
            >
              Facturas
            </div>
          </div>

          {loading && <div>Cargando...</div>}

          {!loading && tabActiva === "detalle" && (
            <List
              data={ordenActual.detalle || []}
              columns={columnsDetalle}
              controls={[
                {
                  type: "search",
                  placeholder: "Buscar producto...",
                  value: search,
                  onChange: (e) => setSearch(e.target.value),
                },
                {
                  type: "select",
                  label: "Ordenar por:",
                  placeholder: "Seleccionar",
                  value: orderBy,
                  onChange: (e) => setOrderBy(e.target.value),
                  options: columnsDetalle.map((c) => ({
                    key: c.key,
                    label: c.label,
                  })),
                },
              ]}
            />
          )}

          {!loading && tabActiva === "facturas" && (
            <List
              data={ordenActual.facturas || []}
              columns={columnsFacturas}
              controls={[
                {
                  type: "search",
                  placeholder: "Buscar factura...",
                  value: search,
                  onChange: (e) => setSearch(e.target.value),
                },
                {
                  type: "select",
                  label: "Ordenar por:",
                  placeholder: "Seleccionar",
                  value: orderBy,
                  onChange: (e) => setOrderBy(e.target.value),
                  options: columnsFacturas.map((c) => ({
                    key: c.key,
                    label: c.label,
                  })),
                },
                {
                  type: "button",
                  label: "Cargar Facturas",
                  onClick: () => setModalAbierto(true),
                },
              ]}
            />
          )}
        </div>
      </main>

      {modalAbierto && (
        <ModalCargarFactura
          orden={ordenActual}
          onClose={() => setModalAbierto(false)}
          onGuardado={cargarOrden}
        />
      )}
    </div>
  );
}

// ─── Estilos página ───────────────────────────────────────────────────────────
const styles = {
  pagina: { display: "flex", minHeight: "100vh", background: "#F5F5F5" },
  contenido: {
    flex: 1,
    padding: 30,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  encabezado: { width: "100%", textAlign: "center" },
  titulo: { fontSize: 42, fontFamily: "Lato", margin: 0 },
  contenedorEncabezado: {
    width: "100%",
    maxWidth: 1100,
    border: "2px solid #000",
    borderRadius: 8,
    padding: 20,
    background: "#fff",
  },
  subtitulo: {
    textAlign: "center",
    marginBottom: 15,
    fontSize: 18,
    fontWeight: "bold",
  },
  subcontenedor: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
  },
  item: {
    flex: "1 1 200px",
    background: "#F9F9F9",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    textAlign: "center",
  },
  detalle: {
    width: "100%",
    maxWidth: 1100,
    border: "2px solid #000",
    borderRadius: 8,
    padding: 20,
    background: "#fff",
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    marginBottom: 10,
    gap: 4,
  },
  tab: {
    background: getColor("gris-claro"),
    padding: "12px 20px",
    textAlign: "center",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    cursor: "pointer",
    fontFamily: "Lato",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  tabActiva: {
    background: "#fff",
    padding: "12px 20px",
    textAlign: "center",
    boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottom: `5px solid ${getColor("amarillo")}`,
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "Lato",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

// ─── Estilos modal ────────────────────────────────────────────────────────────
const ms = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 820,
    maxHeight: "92vh",
    overflowY: "auto",
    boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "18px 24px",
    borderBottom: "2px solid #F0F0F0",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 1,
  },
  headerTitulo: {
    margin: 0,
    fontSize: 20,
    fontFamily: "Lato",
    fontWeight: "bold",
  },
  headerSub: { fontSize: 13, color: "#777", marginTop: 2, display: "block" },
  btnX: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#555",
    lineHeight: 1,
    padding: 4,
  },
  cuerpo: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  seccion: { display: "flex", flexDirection: "column", gap: 12 },
  seccionTitulo: {
    margin: 0,
    fontSize: 13,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#444",
    borderBottom: "1px solid #E8E8E8",
    paddingBottom: 6,
  },
  grilla2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px 20px",
  },
  campo: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 13, fontWeight: "600", color: "#333" },
  input: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #CCC",
    fontSize: 14,
    fontFamily: "Lato",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: "#FAFAFA",
  },
  inputReadonly: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #E0E0E0",
    fontSize: 14,
    fontFamily: "Lato",
    background: "#F0F4FF",
    color: "#3355CC",
    fontWeight: "bold",
    letterSpacing: "0.04em",
  },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  chip: {
    background: "#F9F9F9",
    border: "1px solid #E0E0E0",
    borderRadius: 6,
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  chipLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#888",
    fontWeight: "600",
  },
  chipValor: { fontSize: 14, fontWeight: "bold", color: "#222" },
  hint: { margin: 0, fontSize: 13, color: "#888" },
  // Tabla productos
  tabla: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    background: "#F5F5F5",
    padding: "8px 10px",
    textAlign: "left",
    fontWeight: "bold",
    borderBottom: "2px solid #E0E0E0",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #F0F0F0" },
  trCerrado: { borderBottom: "1px solid #F0F0F0", opacity: 0.5 },
  td: { padding: "8px 10px", verticalAlign: "middle" },
  nombreProd: { fontWeight: "600", display: "block" },
  badge: {
    display: "inline-block",
    marginTop: 2,
    fontSize: 10,
    background: "#E8F5E9",
    color: "#388e3c",
    borderRadius: 4,
    padding: "1px 6px",
    fontWeight: "bold",
  },
  inputNum: {
    width: 70,
    padding: "5px 6px",
    border: "1px solid #CCC",
    borderRadius: 5,
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Lato",
  },
  totalRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTop: "2px solid #E0E0E0",
    fontSize: 15,
  },
  totalValor: { fontWeight: "bold", fontSize: 18, color: "#222" },
  // Footer
  error: { color: "red", fontSize: 13, margin: 0 },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    padding: "16px 24px",
    borderTop: "2px solid #F0F0F0",
    position: "sticky",
    bottom: 0,
    background: "#fff",
  },
  btnCancelar: {
    padding: "9px 20px",
    borderRadius: 6,
    border: "1px solid #CCC",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "Lato",
    color: "#333",
  },
  btnGuardar: {
    padding: "9px 20px",
    borderRadius: 6,
    border: "none",
    background: "#222",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "Lato",
    fontWeight: "bold",
  },
};

import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import CargarCotizacionModal from "../Cotizaciones/CargarCotizacionModal";
import { useNavigate, useParams } from "react-router-dom";
import { IconoFlecha, IconoLupa } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";
const COLS = "40px 2fr 1.2fr 1fr 1fr 70px 70px 1fr 1fr 50px";
const storageKey = (idPedido) => `seleccion_pedido_${idPedido}`;

function IconoLapiz() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="#1D1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BtnLapiz({ onClick }) {
  return (
    <button onClick={onClick} style={{ border: "none", background: getColor("amarillo"), borderRadius: 6, cursor: "pointer", padding: "5px 8px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}>
      <IconoLapiz />
    </button>
  );
}

function ModalCambiarCotizacion({ open, onClose, onGuardar, productoNombre, opciones, seleccionActual }) {
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("default");
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    if (open) { setBusqueda(""); setOrden("default"); setSeleccionada(seleccionActual ?? null); }
  }, [open, seleccionActual]);

  if (!open) return null;

  const opcionesFiltradas = opciones
    .filter((o) => o.proveedor.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (orden === "precioAsc") return a.precio_unitario - b.precio_unitario;
      if (orden === "precioDesc") return b.precio_unitario - a.precio_unitario;
      return 0;
    });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ width: 640, maxWidth: "95vw", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ background: getColor("amarillo"), padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 18, fontFamily: "Lato, sans-serif" }}>Cambiar cotización / proveedor</span>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 20, fontWeight: 700, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ textAlign: "center", fontFamily: "Lato, sans-serif", fontSize: 15, fontWeight: 600 }}>Producto: {productoNombre}</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, height: 34, background: "#F9F9F9", borderRadius: 8, outline: "1px #444444 solid", display: "flex", alignItems: "center", overflow: "hidden" }}>
              <input placeholder="Buscar proveedor ..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ flex: 1, padding: "0 12px", border: "none", outline: "none", fontSize: 14, fontFamily: "Lato", background: "transparent", color: "#444" }} />
              <div style={{ width: 40, alignSelf: "stretch", padding: 8, background: "#F9F9F9", boxShadow: "-2px 0px 4px rgba(0,0,0,0.2)", borderLeft: "1px #1D1D1D solid", display: "flex", alignItems: "center", justifyContent: "center" }}><IconoLupa /></div>
            </div>
            <div style={{ height: 34, background: "#F9F9F9", borderRadius: 8, outline: "1px #444444 solid", display: "flex", alignItems: "stretch", overflow: "hidden" }}>
              <div style={{ padding: "0 12px", borderRight: "1px #444444 solid", display: "flex", alignItems: "center" }}><span style={{ fontWeight: 700, fontSize: 14, fontFamily: "Lato" }}>Ordenar por:</span></div>
              <div style={{ padding: "0 10px", boxShadow: "2px 0px 2px rgba(0,0,0,0.15) inset", display: "flex", alignItems: "center" }}>
                <select value={orden} onChange={(e) => setOrden(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 14, fontFamily: "Lato" }}>
                  <option value="default">Por defecto</option>
                  <option value="precioAsc">Precio ↑</option>
                  <option value="precioDesc">Precio ↓</option>
                </select>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 8, overflow: "hidden", outline: "1px #1D1D1D solid" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 50px", background: getColor("amarillo"), padding: "10px 16px", fontWeight: 700, fontSize: 14, fontFamily: "Lato, sans-serif" }}>
              <span>Proveedor</span><span>Precio</span><span>Cantidad</span><span></span>
            </div>
            {opcionesFiltradas.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#888", fontFamily: "Lato", fontStyle: "italic" }}>No hay cotizaciones disponibles para este producto.</div>
            ) : (
              opcionesFiltradas.map((op, i) => {
                const selected = seleccionada?.id_cotizacion === op.id_cotizacion;
                return (
                  <div key={op.id_cotizacion} onClick={() => setSeleccionada(selected ? null : op)}
                    style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 50px", padding: "10px 16px", background: selected ? "rgba(255,204,0,0.18)" : i % 2 === 0 ? "#fff" : "#CECECE", fontSize: 14, fontFamily: "Lato, sans-serif", cursor: "pointer", borderTop: i > 0 ? "1px solid #ddd" : "none" }}>
                    <span style={{ fontWeight: 500 }}>{op.proveedor}</span>
                    <span>{Number(op.precio_unitario).toLocaleString("es-PY")}</span>
                    <span>{op.cantidad}/{op.cantidadPedido}</span>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 18, height: 18, border: `2px solid ${selected ? "#1D1D1D" : "#aaa"}`, borderRadius: 3, background: selected ? getColor("amarillo") : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {selected && <span style={{ fontSize: 11, fontWeight: 900, color: "#1D1D1D" }}>✓</span>}
                      </div>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={() => { if (seleccionada) onGuardar(seleccionada); }} disabled={!seleccionada}
            style={{ padding: "10px 28px", borderRadius: 999, background: seleccionada ? getColor("amarillo") : "#ddd", border: "1px solid #000", fontWeight: 700, fontFamily: "Lato", fontSize: 15, cursor: seleccionada ? "pointer" : "not-allowed" }}>
            Guardar
          </button>
          <button onClick={onClose} style={{ padding: "10px 28px", borderRadius: 999, border: "1px solid #999", background: "#fff", cursor: "pointer", fontFamily: "Lato", fontSize: 15 }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function DetallePedido({ usuario, onNavegar, onLogout }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("default");

  const [modalCargar, setModalCargar] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [cargandoProveedores, setCargandoProveedores] = useState(false);

  const [modalCambiar, setModalCambiar] = useState({ open: false, producto: null, opciones: [] });
  const [seleccionPorProducto, setSeleccionPorProducto] = useState({});

  const [guardando, setGuardando] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [yaGenerado, setYaGenerado] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const fetchPedido = async () => {
    if (!id) return;
    try {
      setLoading(true); setError("");
      const res = await fetchConToken(`${API_BASE}/compras/pedidos/${id}/completo`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo cargar el pedido");
      setPedido(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPedido(); }, [id]);

  // After pedido loads: restore localStorage selection + check DB for existing order
  useEffect(() => {
    if (!pedido) return;
    const pidPedido = pedido.id_pedido ?? Number(id);

    // Restore selection from localStorage
    try {
      const saved = localStorage.getItem(storageKey(pidPedido));
      if (saved) setSeleccionPorProducto(JSON.parse(saved));
    } catch {}

    // Check if this pedido already has an orden_compra in the DB
    fetchConToken(`${API_BASE}/compras/ordenes-compra/verificar/pedido/${pidPedido}`)
      .then((r) => r.json())
      .then((data) => { if (data?.tieneOrden) setYaGenerado(true); })
      .catch(() => {});
  }, [pedido?.id_pedido]);

  const handleAbrirModalCargar = async () => {
    if (proveedores.length === 0) {
      setCargandoProveedores(true);
      try {
        const res = await fetchConToken(`${API_BASE}/compras/proveedores`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProveedores(data.map((p) => ({ id: p.id_proveedor, nombre: [p.personas?.nombre, p.personas?.apellido].filter(Boolean).join(" ") })));
        }
      } catch (err) { console.error(err); }
      finally { setCargandoProveedores(false); }
    }
    setModalCargar(true);
  };

  const handleAbrirModalCambiar = (productoItem) => {
    const opciones = (pedido?.cotizaciones ?? [])
      .map((cot) => {
        const d = cot.detalle.find((x) => x.id_producto === productoItem.id_producto);
        if (!d) return null;
        return {
          id_cotizacion: cot.id_cotizacion,
          id_cotizacion_detalle: d.id_cotizacion_detalle ?? null,
          id_proveedor: cot.id_proveedor ?? null,
          proveedor: cot.proveedor,
          estado: cot.estado,
          precio_unitario: d.precio_unitario,
          subtotal: d.subtotal,
          cantidad: d.cantidad,
          cantidadPedido: productoItem.cantidad,
        };
      })
      .filter(Boolean);
    setModalCambiar({ open: true, producto: productoItem, opciones });
  };

  const handleGuardarCambio = (op) => {
    setSeleccionPorProducto((prev) => ({ ...prev, [modalCambiar.producto.id_producto]: op }));
    setModalCambiar({ open: false, producto: null, opciones: [] });
  };

  const handleGuardar = () => {
    setGuardando(true);
    try {
      const key = storageKey(pedido?.id_pedido ?? Number(id));
      localStorage.setItem(key, JSON.stringify(seleccionPorProducto));
      navigate("/compras/pedidos");
    } catch (err) { console.error(err); }
    finally { setGuardando(false); }
  };

  const handleGenerarOrden = async () => {
    if (!todosAsignados || yaGenerado) return;

    const gruposMap = {};
    Object.entries(seleccionPorProducto).forEach(([id_producto, sel]) => {
      const pid = sel.id_proveedor ?? "sin_proveedor";
      if (!gruposMap[pid]) gruposMap[pid] = { id_proveedor: sel.id_proveedor, proveedor: sel.proveedor, productos: [] };
      gruposMap[pid].productos.push({
        id_producto: Number(id_producto),
        id_cotizacion_detalle: sel.id_cotizacion_detalle ?? null,
        cantidad: sel.cantidad,
        precio_unitario: sel.precio_unitario,
        subtotal: sel.subtotal,
      });
    });

    try {
      setGenerando(true);
      const res = await fetchConToken(`${API_BASE}/compras/ordenes-compra`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grupos: Object.values(gruposMap) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al generar la orden de compra");
      const n = Object.keys(gruposMap).length;
      setMensajeExito(`Orden${n > 1 ? "es" : ""} de compra generada${n > 1 ? "s" : ""} exitosamente.`);
      setYaGenerado(true);
      localStorage.removeItem(storageKey(pedido?.id_pedido ?? Number(id)));
      setTimeout(() => navigate("/compras/ordenes"), 1800);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setGenerando(false);
    }
  };

  const detalle = pedido?.detalle ?? [];

  const detalleFiltrado = detalle
    .filter((p) => {
      const t = busqueda.toLowerCase();
      const sel = seleccionPorProducto[p.id_producto];
      return p.producto.toLowerCase().includes(t) || (p.categoria ?? "").toLowerCase().includes(t) || (sel?.proveedor ?? "").toLowerCase().includes(t);
    })
    .sort((a, b) => {
      if (orden === "az") return a.producto.localeCompare(b.producto);
      if (orden === "za") return b.producto.localeCompare(a.producto);
      return 0;
    });

  const totalSeleccionado = Object.values(seleccionPorProducto).reduce((acc, sel) => acc + Number(sel?.subtotal ?? 0), 0);
  const todosAsignados = detalle.length > 0 && detalle.every((p) => seleccionPorProducto[p.id_producto]);

  if (loading) return <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 24, fontFamily: "Lato" }}>Cargando pedido...</div>;
  if (error) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16, fontFamily: "Lato" }}>
      <p style={{ color: "#E30613", fontSize: 18 }}>{error}</p>
      <button onClick={() => navigate("/compras/pedidos")} style={styles.botonAmarillo}>Volver a Pedidos</button>
    </div>
  );

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />
      <main style={styles.contenido}>

        <div style={styles.header}>
          <button onClick={() => navigate("/compras/pedidos")} style={styles.botonVolver}><IconoFlecha /></button>
          <div style={{ flex: 1 }}>
            <h1 style={styles.titulo}>Pedidos</h1>
            <div style={styles.linea} />
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.subtitulo}>🗒 Información del Pedido</h2>
          <div style={{ height: 2, background: "#000", marginBottom: 12 }} />
          <div style={styles.infoContainer}>
            <div><strong>Código pedido:</strong> {pedido?.codigo_pedido ?? "—"}</div>
            <div><strong>Estado:</strong> {pedido?.estado ?? "—"}</div>
            <div><strong>Fecha de creación:</strong> {pedido?.fecha_creacion ?? "—"}</div>
          </div>
        </div>

        {mensajeExito && (
          <div style={{ background: "#D9F7BE", border: "1px solid #52C41A", borderRadius: 8, padding: "12px 20px", marginBottom: 16, fontFamily: "Lato", color: "#237804", fontWeight: 600, fontSize: 15 }}>
            ✓ {mensajeExito}
          </div>
        )}

        <div style={styles.cardTabla}>
          <div style={styles.controles}>
            <div style={styles.buscador}>
              <input placeholder="Buscar producto ..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={styles.inputBuscar} />
              <div style={styles.lupaCont}><IconoLupa /></div>
            </div>
            <div style={styles.selectCont}>
              <div style={styles.selectLabel}>Ordenar por:</div>
              <div style={styles.selectInner}>
                <select value={orden} onChange={(e) => setOrden(e.target.value)} style={styles.select}>
                  <option value="default">Por defecto</option>
                  <option value="az">A → Z</option>
                  <option value="za">Z → A</option>
                </select>
              </div>
            </div>
            <button onClick={handleAbrirModalCargar} disabled={cargandoProveedores}
              style={{ height: 34, paddingLeft: 18, paddingRight: 18, background: getColor("amarillo"), boxShadow: "0px 2px 2px rgba(0,0,0,0.25)", borderRadius: 8, outline: "1px #000000 solid", border: "none", cursor: cargandoProveedores ? "wait" : "pointer", fontWeight: 700, fontSize: 14, fontFamily: "Lato", color: "#000", opacity: cargandoProveedores ? 0.6 : 1, whiteSpace: "nowrap" }}>
              {cargandoProveedores ? "Cargando..." : "Cargar Cotización"}
            </button>
          </div>

          <div style={styles.tabla}>
            <div style={{ display: "grid", gridTemplateColumns: COLS, background: getColor("amarillo"), padding: "10px 14px", fontWeight: 700, fontSize: 13, fontFamily: "Lato, sans-serif" }}>
              <span>#</span><span>Producto</span><span>Proveedor</span><span>Categoría</span><span>Marca</span>
              <span style={{ textAlign: "center" }}>Inventario</span><span style={{ textAlign: "center" }}>Cantidad</span>
              <span style={{ textAlign: "right" }}>Precio</span><span style={{ textAlign: "right" }}>Subtotal estimado</span><span></span>
            </div>

            {detalleFiltrado.length === 0 && <div style={styles.emptyMsg}>No hay productos registrados en este pedido.</div>}

            {detalleFiltrado.map((p, i) => {
              const sel = seleccionPorProducto[p.id_producto];
              const precio = sel ? Number(sel.precio_unitario) : null;
              const subtotal = sel ? Number(sel.subtotal) : null;
              return (
                <div key={p.id_producto} style={{ display: "grid", gridTemplateColumns: COLS, padding: "10px 14px", background: i % 2 === 0 ? "#ffffff" : "#CECECE", fontSize: 14, fontFamily: "Lato, sans-serif", alignItems: "center" }}>
                  <span style={{ color: "#888", fontSize: 13 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontWeight: 500 }}>{p.producto}</span>
                  <span style={{ color: sel ? "#1D1D1D" : "#aaa", fontSize: 13 }}>{sel?.proveedor ?? "—"}</span>
                  <span>{p.categoria ?? "—"}</span>
                  <span>{p.marca ?? "—"}</span>
                  <span style={{ textAlign: "center" }}>{p.inventario ?? "—"}</span>
                  <span style={{ textAlign: "center" }}>{p.cantidad}</span>
                  <span style={{ textAlign: "right", fontWeight: precio ? 600 : 400, color: precio ? "#856404" : "#aaa" }}>
                    {precio ? precio.toLocaleString("es-PY") : "—"}
                  </span>
                  <span style={{ textAlign: "right", fontWeight: subtotal ? 600 : 400, color: subtotal ? "#856404" : "#aaa" }}>
                    {subtotal ? subtotal.toLocaleString("es-PY") : "—"}
                  </span>
                  <span style={{ display: "flex", justifyContent: "center" }}>
                    <BtnLapiz onClick={() => handleAbrirModalCambiar(p)} />
                  </span>
                </div>
              );
            })}
          </div>

          <div style={styles.footer}>
            <span style={{ fontFamily: "Lato", fontWeight: 700, fontSize: 16 }}>
              Costo total estimado:{" "}
              {totalSeleccionado > 0
                ? <strong>{totalSeleccionado.toLocaleString("es-PY")} Gs.</strong>
                : <span style={{ color: "#aaa", fontWeight: 400 }}>—</span>}
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleGuardar} disabled={guardando}
                style={{ ...styles.botonAmarillo, opacity: guardando ? 0.6 : 1, cursor: guardando ? "wait" : "pointer" }}>
                {guardando ? "Guardando..." : "Guardar"}
              </button>
              {yaGenerado ? (
                <button disabled style={{ ...styles.botonAmarillo, opacity: 0.45, cursor: "not-allowed", background: "#e0e0e0", border: "1px solid #bbb", color: "#555" }}>
                  Orden de compra generada
                </button>
              ) : (
                <button onClick={handleGenerarOrden} disabled={!todosAsignados || generando}
                  title={!todosAsignados ? "Asigná un proveedor a cada producto primero" : ""}
                  style={{ ...styles.botonAmarillo, opacity: (todosAsignados && !generando) ? 1 : 0.4, cursor: (todosAsignados && !generando) ? "pointer" : "not-allowed" }}>
                  {generando ? "Generando..." : "Generar orden de compra"}
                </button>
              )}
            </div>
          </div>
        </div>

      </main>

      <CargarCotizacionModal open={modalCargar} onClose={() => setModalCargar(false)} onGuardado={() => { setModalCargar(false); fetchPedido(); }} idPedido={pedido?.id_pedido ?? Number(id)} productos={pedido?.detalle ?? []} proveedores={proveedores} />
      <ModalCambiarCotizacion open={modalCambiar.open} onClose={() => setModalCambiar({ open: false, producto: null, opciones: [] })} onGuardar={handleGuardarCambio} productoNombre={modalCambiar.producto?.producto ?? ""} opciones={modalCambiar.opciones} seleccionActual={seleccionPorProducto[modalCambiar.producto?.id_producto] ?? null} />
    </div>
  );
}

const styles = {
  pagina: { display: "flex", minHeight: "100vh", background: "#ffffff" },
  contenido: { flex: 1, padding: 20, overflowY: "auto" },
  header: { display: "flex", alignItems: "center", gap: 20, marginBottom: 20 },
  botonVolver: { border: "none", background: "transparent", cursor: "pointer", transform: "rotate(270deg)", display: "flex", alignItems: "center" },
  titulo: { textAlign: "center", fontSize: 42, margin: 0, fontFamily: "Lato" },
  linea: { height: 4, background: "#000", marginTop: 10 },
  card: { background: "#ffffff", borderRadius: 16, padding: 20, border: "1px solid #000000", marginBottom: 16, boxShadow: "0px 1px 4px rgba(0,0,0,0.2)" },
  subtitulo: { textAlign: "center", margin: "0 0 8px 0", fontFamily: "Lato", fontSize: 18 },
  infoContainer: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, background: "#F9F9F9", border: "1px solid #ccc", borderRadius: 8, padding: "12px 16px", fontFamily: "Lato", fontSize: 14 },
  cardTabla: { borderRadius: 12, padding: 20, background: "#ffffff", boxShadow: "0px 4px 20px rgba(0,0,0,0.15)", border: "1px solid #e0e0e0" },
  controles: { display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" },
  buscador: { flex: 1, minWidth: 200, height: 34, background: "#F9F9F9", borderRadius: 8, outline: "1px #444444 solid", display: "flex", alignItems: "center", overflow: "hidden" },
  inputBuscar: { flex: 1, padding: "0 12px", border: "none", outline: "none", fontSize: 14, fontFamily: "Lato", background: "transparent", color: "#444" },
  lupaCont: { width: 40, alignSelf: "stretch", padding: 8, background: "#F9F9F9", boxShadow: "-2px 0px 4px rgba(0,0,0,0.2)", borderLeft: "1px #1D1D1D solid", display: "flex", alignItems: "center", justifyContent: "center" },
  selectCont: { height: 34, background: "#F9F9F9", borderRadius: 8, outline: "1px #444444 solid", display: "flex", alignItems: "stretch", overflow: "hidden" },
  selectLabel: { padding: "0 12px", borderRight: "1px #444444 solid", display: "flex", alignItems: "center", fontWeight: 700, fontSize: 14, fontFamily: "Lato" },
  selectInner: { padding: "0 10px", boxShadow: "2px 0px 2px rgba(0,0,0,0.15) inset", display: "flex", alignItems: "center" },
  select: { border: "none", background: "transparent", fontSize: 14, fontFamily: "Lato" },
  tabla: { borderRadius: 8, overflow: "hidden", outline: "1px #1D1D1D solid", outlineOffset: "-1px", marginBottom: 16 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  botonAmarillo: { background: getColor("amarillo"), border: "1px solid #000000", borderRadius: 999, padding: "10px 24px", cursor: "pointer", fontWeight: "bold", fontFamily: "Lato", fontSize: 14 },
  emptyMsg: { padding: "20px", textAlign: "center", color: "#888", fontFamily: "Lato", fontStyle: "italic" },
};

import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import List from "../../../components/Lista";
import CargarCotizacionModal from "../Cotizaciones/CargarCotizacionModal";
import { useNavigate, useParams } from "react-router-dom";
import { IconoFlecha } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

const COLS_MULTI = "30px 1.5fr 1fr 1fr 1fr 90px";

function CotizacionGroup({ cotizacion, seleccionPorProducto, onToggleProducto }) {
  const selectedCount = cotizacion.detalle.filter(
    (d) => seleccionPorProducto[d.id_producto]?.id_cotizacion === cotizacion.id_cotizacion
  ).length;

  return (
    <div
      style={{
        border: selectedCount > 0 ? `2px solid ${getColor("amarillo")}` : "2px solid #e0e0e0",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: selectedCount > 0 ? "0 0 0 3px rgba(255,204,0,0.3)" : "none",
        transition: "all 0.2s ease",
        marginBottom: 12,
      }}
    >
      {/* Cabecera del grupo */}
      <div
        style={{
          background: selectedCount > 0 ? "rgba(255,204,0,0.2)" : "#F0F0F0",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <span style={{ fontWeight: 700, fontSize: 16, fontFamily: "Lato, sans-serif", color: "#1D1D1D" }}>
            {cotizacion.proveedor}
          </span>
          <span style={{ fontSize: 13, color: "#555", fontFamily: "Lato, sans-serif", marginLeft: 12 }}>
            {cotizacion.codigo_cotizacion} · Fecha: {cotizacion.fecha_respuesta}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {selectedCount > 0 && (
            <span style={{ fontSize: 13, fontWeight: 600, color: "#237804" }}>
              {selectedCount}/{cotizacion.detalle.length} seleccionados
            </span>
          )}
          <span
            style={{
              background:
                cotizacion.estado === "Aprobado" ? "#D9F7BE"
                : cotizacion.estado === "Cancelado" ? "#FFE0E0" : "#FFF3CD",
              color:
                cotizacion.estado === "Aprobado" ? "#237804"
                : cotizacion.estado === "Cancelado" ? "#E30613" : "#856404",
              borderRadius: 12, padding: "3px 12px", fontSize: 13, fontWeight: 600,
            }}
          >
            {cotizacion.estado}
          </span>
        </div>
      </div>

      {/* Header columnas */}
      <div
        style={{
          display: "grid", gridTemplateColumns: COLS_MULTI,
          background: "#FAFAFA", padding: "8px 14px",
          fontWeight: 700, fontSize: 13, fontFamily: "Lato, sans-serif",
          borderBottom: "1px solid #e0e0e0", color: "#444",
        }}
      >
        <span></span>
        <span>Producto</span>
        <span style={{ textAlign: "center" }}>Cantidad</span>
        <span style={{ textAlign: "right" }}>Precio Unit.</span>
        <span style={{ textAlign: "right" }}>Subtotal</span>
        <span style={{ textAlign: "center" }}>Mejor</span>
      </div>

      {/* Filas de productos */}
      {cotizacion.detalle.length === 0 ? (
        <div style={{ padding: 14, textAlign: "center", color: "#888", fontSize: 13, fontStyle: "italic", fontFamily: "Lato, sans-serif" }}>
          Sin detalle de productos
        </div>
      ) : (
        cotizacion.detalle.map((d, i) => {
          const isRowSelected =
            seleccionPorProducto[d.id_producto]?.id_cotizacion === cotizacion.id_cotizacion;
          return (
            <div
              key={d.id_cotizacion_detalle}
              style={{
                display: "grid", gridTemplateColumns: COLS_MULTI,
                padding: "9px 14px",
                background: isRowSelected ? "rgba(255,204,0,0.12)" : i % 2 === 0 ? "#fff" : getColor("gris-claro"),
                fontSize: 14, fontFamily: "Lato, sans-serif",
                borderBottom: i < cotizacion.detalle.length - 1 ? "1px solid #eee" : "none",
                transition: "background 0.15s ease",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <input
                  type="radio"
                  name={`producto-${d.id_producto}`}
                  checked={isRowSelected}
                  onChange={() => {}}
                  onClick={() => onToggleProducto(d.id_producto, cotizacion, d)}
                  style={{ cursor: "pointer", width: 16, height: 16, accentColor: "#FFCC00" }}
                />
              </span>
              <span style={{ fontWeight: 500 }}>{d.producto}</span>
              <span style={{ textAlign: "center" }}>{d.cantidad}</span>
              <span style={{ textAlign: "right" }}>{Number(d.precio_unitario).toLocaleString("es-PY")}</span>
              <span style={{ textAlign: "right", fontWeight: 600 }}>{Number(d.subtotal).toLocaleString("es-PY")}</span>
              <span style={{ textAlign: "center", color: d.es_mejor_opcion ? "#237804" : "#aaa", fontWeight: d.es_mejor_opcion ? 700 : 400 }}>
                {d.es_mejor_opcion ? "✓" : "—"}
              </span>
            </div>
          );
        })
      )}

      {/* Total del proveedor */}
      <div style={{ padding: "8px 14px", background: "#f5f5f5", display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e0e0e0" }}>
        <span style={{ fontSize: 14, fontFamily: "Lato, sans-serif", color: "#444" }}>
          Total proveedor:{" "}
          <strong>
            {cotizacion.detalle
              .reduce((acc, d) => acc + Number(d.subtotal ?? 0), 0)
              .toLocaleString("es-PY")} Gs.
          </strong>
        </span>
      </div>
    </div>
  );
}

export default function DetallePedido({ usuario, onNavegar, onLogout }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [tabActiva, setTabActiva] = useState("detalle");
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [busquedaDetalle, setBusquedaDetalle] = useState("");
  const [busquedaCot, setBusquedaCot] = useState("");

  const [modalCotizacion, setModalCotizacion] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [cargandoProveedores, setCargandoProveedores] = useState(false);

  // Selección por producto: { [id_producto]: { id_cotizacion, proveedor, item } }
  const [seleccionPorProducto, setSeleccionPorProducto] = useState({});

  const fetchPedido = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetchConToken(`${API_BASE}/compras/pedidos/${id}/completo`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo cargar el pedido");
      setPedido(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedido();
  }, [id]);

  const handleAbrirModalCotizacion = async () => {
    if (proveedores.length === 0) {
      setCargandoProveedores(true);
      try {
        const res = await fetchConToken(`${API_BASE}/compras/proveedores`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProveedores(
            data.map((p) => ({
              id: p.id_proveedor,
              nombre: [p.personas?.nombre, p.personas?.apellido].filter(Boolean).join(" "),
            }))
          );
        }
      } catch (err) {
        console.error("Error cargando proveedores:", err);
      } finally {
        setCargandoProveedores(false);
      }
    }
    setModalCotizacion(true);
  };

  const handleGuardadoCotizacion = () => {
    setModalCotizacion(false);
    fetchPedido();
  };

  const handleToggleProducto = (id_producto, cotizacion, detalleItem) => {
    setSeleccionPorProducto((prev) => {
      const nuevo = { ...prev };
      if (nuevo[id_producto]?.id_cotizacion === cotizacion.id_cotizacion) {
        delete nuevo[id_producto];
      } else {
        nuevo[id_producto] = {
          id_cotizacion: cotizacion.id_cotizacion,
          proveedor: cotizacion.proveedor,
          item: detalleItem,
        };
      }
      return nuevo;
    });
  };

  const productosFiltrados = (pedido?.detalle ?? []).filter((p) =>
    p.producto.toLowerCase().includes(busquedaDetalle.toLowerCase())
  );

  const cotizacionesFiltradas = (pedido?.cotizaciones ?? []).filter((c) => {
    const texto = busquedaCot.toLowerCase();
    return (
      c.proveedor.toLowerCase().includes(texto) ||
      c.codigo_cotizacion.toLowerCase().includes(texto) ||
      c.detalle.some((d) => d.producto.toLowerCase().includes(texto))
    );
  });

  const totalEstimadoPedido = (pedido?.detalle ?? []).reduce(
    (acc, d) => acc + (d.subtotal ?? 0), 0
  );

  const productosDelPedido = pedido?.detalle ?? [];
  const todosAsignados =
    productosDelPedido.length > 0 &&
    productosDelPedido.every((p) => seleccionPorProducto[p.id_producto]);

  const totalSeleccionado = Object.values(seleccionPorProducto).reduce(
    (acc, sel) => acc + Number(sel.item?.subtotal ?? 0), 0
  );

  const resumenPorProveedor = Object.values(seleccionPorProducto).reduce((acc, sel) => {
    if (!acc[sel.proveedor]) acc[sel.proveedor] = [];
    acc[sel.proveedor].push(sel.item?.producto ?? "—");
    return acc;
  }, {});

  const columnsDetalle = [
    { key: "producto", label: "Producto" },
    { key: "categoria", label: "Categoría" },
    { key: "marca", label: "Marca" },
    { key: "inventario", label: "Stock Actual" },
    { key: "cantidad", label: "Cantidad" },
    {
      key: "precio",
      label: "Último Precio",
      render: (item) => <span>{Number(item.precio).toLocaleString("es-PY")}</span>,
    },
    {
      key: "subtotal",
      label: "Subtotal estimado",
      render: (item) => <span>{Number(item.subtotal).toLocaleString("es-PY")}</span>,
    },
  ];

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 24, fontFamily: "Lato" }}>
        Cargando pedido...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16, fontFamily: "Lato" }}>
        <p style={{ color: "#E30613", fontSize: 18 }}>{error}</p>
        <button onClick={() => navigate("/compras/pedidos")} style={styles.botonGuardar}>
          Volver a Pedidos
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>

        {/* HEADER */}
        <div style={styles.header}>
          <button onClick={() => navigate("/compras/pedidos")} style={styles.botonVolver} title="Volver a pedidos">
            <IconoFlecha />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={styles.titulo}>Pedidos</h1>
            <div style={styles.linea} />
          </div>
        </div>

        {/* INFORMACIÓN DEL PEDIDO */}
        <div style={styles.card}>
          <h2 style={styles.subtitulo}>Información del Pedido</h2>
          <div style={styles.infoContainer}>
            <div><strong>Código pedido:</strong> {pedido?.codigo_pedido ?? "—"}</div>
            <div><strong>Estado:</strong> {pedido?.estado ?? "—"}</div>
            <div><strong>Fecha de creación:</strong> {pedido?.fecha_creacion ?? "—"}</div>
            <div>
              <strong>Costo total:</strong>{" "}
              {pedido?.precio_total != null ? Number(pedido.precio_total).toLocaleString("es-PY") : "—"}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={styles.tabs}>
          <div
            onClick={() => setTabActiva("detalle")}
            style={tabActiva === "detalle" ? styles.tabActiva : styles.tab}
          >
            Detalle del pedido
          </div>
          <div
            onClick={() => setTabActiva("cotizaciones")}
            style={tabActiva === "cotizaciones" ? styles.tabActiva : styles.tab}
          >
            Cotizaciones del pedido
            {(pedido?.cotizaciones?.length ?? 0) > 0 && (
              <span style={styles.badge}>{pedido.cotizaciones.length}</span>
            )}
          </div>
        </div>

        {/* TAB: DETALLE */}
        {tabActiva === "detalle" && (
          <div style={styles.cardTabla}>
            <List
              data={productosFiltrados}
              columns={columnsDetalle}
              controls={[
                {
                  type: "search",
                  placeholder: "Buscar producto...",
                  value: busquedaDetalle,
                  onChange: (e) => setBusquedaDetalle(e.target.value),
                },
                {
                  type: "select",
                  label: "Ordenar por",
                  value: "",
                  onChange: () => {},
                  options: [{ key: "default", label: "Por defecto" }],
                },
              ]}
            />
            {productosFiltrados.length === 0 && (
              <p style={styles.emptyMsg}>No hay productos registrados en este pedido.</p>
            )}
            <div style={styles.footer}>
              <h2 style={{ margin: 0, fontFamily: "Lato" }}>
                Costo total estimado:{" "}
                <strong>{totalEstimadoPedido.toLocaleString("es-PY")} Gs.</strong>
              </h2>
            </div>
          </div>
        )}

        {/* TAB: COTIZACIONES */}
        {tabActiva === "cotizaciones" && (
          <div style={styles.cardTabla}>

            {/* Controles */}
            <div style={styles.cotizacionControles}>
              <div style={{ flex: "1 1 0", height: 40, background: "#F9F9F9", borderRadius: 8, outline: "1px #444444 solid", display: "flex", alignItems: "center", overflow: "hidden" }}>
                <input
                  placeholder="Buscar proveedor, código o producto..."
                  value={busquedaCot}
                  onChange={(e) => setBusquedaCot(e.target.value)}
                  style={{ flex: 1, padding: "0 12px", border: "none", outline: "none", fontSize: 14, fontFamily: "Lato", background: "transparent", color: "#444" }}
                />
              </div>
              <button
                onClick={handleAbrirModalCotizacion}
                disabled={cargandoProveedores}
                style={{
                  height: 40, paddingLeft: 20, paddingRight: 20,
                  background: getColor("amarillo"),
                  boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
                  overflow: "hidden", borderRadius: 8,
                  outline: "1px #000000 solid",
                  border: "none", cursor: cargandoProveedores ? "wait" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 15, fontFamily: "Lato",
                  color: "#000",
                  opacity: cargandoProveedores ? 0.6 : 1,
                }}
              >
                {cargandoProveedores ? "Cargando..." : "+ Cargar Cotización"}
              </button>
            </div>

            {cotizacionesFiltradas.length === 0 ? (
              <p style={styles.emptyMsg}>
                {(pedido?.cotizaciones?.length ?? 0) === 0
                  ? "Aún no hay cotizaciones para este pedido. Cargá la primera usando el botón de arriba."
                  : "No se encontraron cotizaciones con ese criterio de búsqueda."}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: 13, color: "#666", fontFamily: "Lato, sans-serif", margin: "0 0 12px 0" }}>
                  Seleccioná el proveedor de cada producto haciendo clic en el radio de la fila correspondiente.
                </p>
                {cotizacionesFiltradas.map((cotizacion) => (
                  <CotizacionGroup
                    key={cotizacion.id_cotizacion}
                    cotizacion={cotizacion}
                    seleccionPorProducto={seleccionPorProducto}
                    onToggleProducto={handleToggleProducto}
                  />
                ))}
              </div>
            )}

            {/* Footer */}
            <div style={styles.footer}>
              <div>
                <h2 style={{ margin: 0, fontFamily: "Lato" }}>
                  Total seleccionado:{" "}
                  <strong>{totalSeleccionado.toLocaleString("es-PY")} Gs.</strong>
                </h2>
                {!todosAsignados && productosDelPedido.length > 0 && (
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", fontFamily: "Lato" }}>
                    {Object.keys(seleccionPorProducto).length}/{productosDelPedido.length} productos asignados
                  </p>
                )}
              </div>
              <button
                style={{
                  ...styles.botonGuardar,
                  opacity: todosAsignados ? 1 : 0.4,
                  cursor: todosAsignados ? "pointer" : "not-allowed",
                }}
                disabled={!todosAsignados}
                title={!todosAsignados ? "Asigná un proveedor a cada producto primero" : "Generar orden de compra"}
              >
                Generar Orden de Compra
              </button>
            </div>

            {Object.keys(seleccionPorProducto).length > 0 && (
              <div style={{ marginTop: 10, background: "#FFFBEA", border: "1px solid #FFCC00", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontFamily: "Lato, sans-serif", color: "#555" }}>
                <strong>Selección actual:</strong>
                {Object.entries(resumenPorProveedor).map(([proveedor, productos]) => (
                  <div key={proveedor} style={{ marginTop: 4 }}>
                    <strong>{proveedor}:</strong> {productos.join(", ")}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL CARGAR COTIZACIÓN */}
      <CargarCotizacionModal
        open={modalCotizacion}
        onClose={() => setModalCotizacion(false)}
        onGuardado={handleGuardadoCotizacion}
        idPedido={pedido?.id_pedido ?? Number(id)}
        productos={pedido?.detalle ?? []}
        proveedores={proveedores}
      />
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
  card: { background: "#ffffff", borderRadius: 16, padding: 20, border: "1px solid #000000", marginBottom: 20, boxShadow: "0px 1px 4px rgba(0,0,0,0.2)" },
  subtitulo: { textAlign: "center", marginBottom: 20, fontFamily: "Lato" },
  infoContainer: {
    display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
    background: "#F9F9F9", border: "1px solid #000", borderRadius: 12, padding: 20, fontFamily: "Lato",
  },
  tabs: { display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: 10, gap: 4 },
  tabActiva: {
    background: "#ffffff", padding: "12px 20px", textAlign: "center",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    borderBottom: `5px solid ${getColor("amarillo")}`, fontWeight: "bold",
    cursor: "pointer", fontFamily: "Lato", display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
  },
  tab: {
    background: getColor("gris-claro"), padding: "12px 20px", textAlign: "center",
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    cursor: "pointer", fontFamily: "Lato", display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
  },
  badge: { background: "#1D1D1D", color: "#fff", borderRadius: 999, padding: "1px 8px", fontSize: 12, fontWeight: 700 },
  cardTabla: { borderRadius: 12, padding: 20, background: "#ffffff", boxShadow: "0px 4px 20px rgba(0,0,0,0.15)", border: "1px solid #e0e0e0" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, flexWrap: "wrap", gap: 12 },
  botonGuardar: { background: getColor("amarillo"), border: "1px solid #000000", borderRadius: 999, padding: "10px 30px", cursor: "pointer", fontWeight: "bold", fontFamily: "Lato" },
  emptyMsg: { textAlign: "center", color: "#888", fontFamily: "Lato", padding: "20px 0", fontStyle: "italic" },
  cotizacionControles: { display: "flex", gap: 14, alignItems: "center", marginBottom: 16, flexWrap: "wrap" },
};

import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import List from "../../../components/Lista";
import CargarCotizacionModal from "./CargarCotizacionModal";
import { getColor } from "../../../components/Colors";
import { IconoFlecha } from "../../../components/Icons";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

const COLS_MULTI = "30px 1.5fr 1fr 1fr 1fr 90px";

function CotizacionGroup({ cotizacion, seleccionPorProducto, onToggleProducto, esCotizacionActual }) {
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
      {/* Cabecera */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {esCotizacionActual && (
            <span style={{ background: "#1D1D1D", color: "#FFCC00", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, fontFamily: "Lato, sans-serif" }}>
              ACTUAL
            </span>
          )}
          <div>
            <span style={{ fontWeight: 700, fontSize: 16, fontFamily: "Lato, sans-serif", color: "#1D1D1D" }}>
              {cotizacion.proveedor}
            </span>
            <span style={{ fontSize: 13, color: "#555", fontFamily: "Lato, sans-serif", marginLeft: 12 }}>
              {cotizacion.codigo_cotizacion} · Fecha: {cotizacion.fecha_respuesta}
            </span>
          </div>
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

      {/* Filas */}
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
                  name={`producto-cot-${d.id_producto}`}
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

      {/* Total proveedor */}
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

export default function DetalleCotizacion({ usuario, onNavegar, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [ordenCol, setOrdenCol] = useState("default");

  // Todas las cotizaciones del pedido relacionado
  const [todasCotizaciones, setTodasCotizaciones] = useState([]);
  const [busquedaCot, setBusquedaCot] = useState("");
  const [seleccionPorProducto, setSeleccionPorProducto] = useState({});

  // Modal cargar cotización
  const [modalCotizacion, setModalCotizacion] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [cargandoProveedores, setCargandoProveedores] = useState(false);
  const [productosPedido, setProductosPedido] = useState([]);
  const [idPedido, setIdPedido] = useState(null);

  const fetchCotizacion = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetchConToken(`${API_BASE}/compras/cotizaciones/codigo/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo cargar la cotización");
      setCotizacion(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCotizacion();
  }, [id]);

  // Al cargar la cotización, buscar el pedido relacionado para obtener todas las cotizaciones
  useEffect(() => {
    if (!cotizacion) return;
    const pedidoId = cotizacion?.id_pedido ?? cotizacion?.pedidos_compras?.id_pedido;
    if (!pedidoId) return;
    setIdPedido(pedidoId);

    const fetchPedidoCompleto = async () => {
      try {
        const res = await fetchConToken(`${API_BASE}/compras/pedidos/${pedidoId}/completo`);
        const data = await res.json();
        if (res.ok) {
          setTodasCotizaciones(data.cotizaciones ?? []);
          setProductosPedido(data.detalle ?? []);
        }
      } catch (err) {
        console.error("Error al cargar cotizaciones del pedido:", err);
      }
    };
    fetchPedidoCompleto();
  }, [cotizacion]);

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
    // Recargar cotización actual y todas las del pedido
    fetchCotizacion();
  };

  const handleToggleProducto = (id_producto, cotiz, detalleItem) => {
    setSeleccionPorProducto((prev) => {
      const nuevo = { ...prev };
      if (nuevo[id_producto]?.id_cotizacion === cotiz.id_cotizacion) {
        delete nuevo[id_producto];
      } else {
        nuevo[id_producto] = {
          id_cotizacion: cotiz.id_cotizacion,
          proveedor: cotiz.proveedor,
          item: detalleItem,
        };
      }
      return nuevo;
    });
  };

  // Detalle de la cotización actual con búsqueda
  const detallesBruto = (cotizacion?.cotizaciones_proveedores_detalle ?? []).map((d) => ({
    id: d.id_cotizacion_detalle,
    id_producto: d.id_producto,
    producto: d.productos?.nombre ?? "—",
    codigo: d.productos?.codigo ?? "—",
    cantidad: d.cantidad,
    precio_unitario: Number(d.precio_unitario ?? 0).toLocaleString("es-PY"),
    subtotal: Number(d.subtotal ?? 0).toLocaleString("es-PY"),
    es_mejor_opcion: d.es_mejor_opcion,
    observacion: d.observacion ?? "",
  }));

  const detallesFiltrados = detallesBruto.filter((d) =>
    d.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Cotizaciones del pedido filtradas por búsqueda
  const cotizacionesFiltradas = todasCotizaciones.filter((c) => {
    const texto = busquedaCot.toLowerCase();
    return (
      c.proveedor?.toLowerCase().includes(texto) ||
      c.codigo_cotizacion?.toLowerCase().includes(texto) ||
      c.detalle?.some((d) => d.producto?.toLowerCase().includes(texto))
    );
  });

  const totalEstimado = (cotizacion?.cotizaciones_proveedores_detalle ?? []).reduce(
    (acc, d) => acc + Number(d.subtotal ?? 0),
    0
  );

  const proveedorNombre = cotizacion?.proveedores?.personas
    ? [cotizacion.proveedores.personas.nombre, cotizacion.proveedores.personas.apellido]
        .filter(Boolean).join(" ")
    : "—";

  const todosAsignados =
    productosPedido.length > 0 &&
    productosPedido.every((p) => seleccionPorProducto[p.id_producto]);

  const totalSeleccionado = Object.values(seleccionPorProducto).reduce(
    (acc, sel) => acc + Number(sel.item?.subtotal ?? 0), 0
  );

  const resumenPorProveedor = Object.values(seleccionPorProducto).reduce((acc, sel) => {
    if (!acc[sel.proveedor]) acc[sel.proveedor] = [];
    acc[sel.proveedor].push(sel.item?.producto ?? "—");
    return acc;
  }, {});

  const columnsDetalle = [
    { key: "codigo", label: "Código", width: "100px" },
    { key: "producto", label: "Producto" },
    { key: "cantidad", label: "Cantidad", width: "100px" },
    { key: "precio_unitario", label: "Precio Unitario" },
    { key: "subtotal", label: "Subtotal" },
    {
      key: "es_mejor_opcion",
      label: "Mejor Opción",
      width: "120px",
      render: (item) => (
        <span style={{ fontWeight: item.es_mejor_opcion ? 700 : 400, color: item.es_mejor_opcion ? "#237804" : "#888" }}>
          {item.es_mejor_opcion ? "✓ Sí" : "—"}
        </span>
      ),
    },
    {
      key: "observacion",
      label: "Observación",
      render: (item) => <span style={{ fontSize: 13, color: "#666" }}>{item.observacion || "—"}</span>,
    },
  ];

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 24, fontFamily: "Lato" }}>
        Cargando cotización...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16, fontFamily: "Lato" }}>
        <p style={{ color: "#E30613", fontSize: 18 }}>{error}</p>
        <button onClick={() => navigate("/compras/cotizaciones")} style={styles.botonGuardar}>
          Volver a Cotizaciones
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
          <button onClick={() => navigate("/compras/cotizaciones")} style={styles.botonVolver} title="Volver a cotizaciones">
            <IconoFlecha />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={styles.titulo}>Detalle de Cotización</h1>
            <div style={styles.linea} />
          </div>
        </div>

        {/* INFO DE LA COTIZACIÓN */}
        <div style={styles.card}>
          <h2 style={styles.subtitulo}>Información de la Cotización</h2>
          <div style={styles.infoContainer}>
            <div><strong>Código:</strong> {cotizacion?.codigo_cotizacion ?? "—"}</div>
            <div>
              <strong>Estado:</strong>{" "}
              <span style={{ background: cotizacion?.estados?.nombre === "Aprobado" ? "#D9F7BE" : cotizacion?.estados?.nombre === "Cancelado" ? "#FFE0E0" : "#FFF3CD", color: cotizacion?.estados?.nombre === "Aprobado" ? "#237804" : cotizacion?.estados?.nombre === "Cancelado" ? "#E30613" : "#856404", borderRadius: 12, padding: "2px 10px", fontSize: 13, fontWeight: 600 }}>
                {cotizacion?.estados?.nombre ?? "—"}
              </span>
            </div>
            <div><strong>Fecha:</strong> {cotizacion?.fecha_respuesta ?? "—"}</div>
            <div><strong>Proveedor:</strong> {proveedorNombre}</div>
            <div><strong>Pedido:</strong> {cotizacion?.pedidos_compras?.codigo_pedido ?? "—"}</div>
            {cotizacion?.observacion && (
              <div style={{ gridColumn: "1 / -1" }}>
                <strong>Observación:</strong> {cotizacion.observacion}
              </div>
            )}
          </div>
        </div>

        {/* TABLA DE DETALLE DE ESTA COTIZACIÓN */}
        <div style={styles.cardTabla}>
          <List
            data={detallesFiltrados}
            columns={columnsDetalle}
            controls={[
              {
                type: "search",
                placeholder: "Buscar producto...",
                value: busqueda,
                onChange: (e) => setBusqueda(e.target.value),
              },
              {
                type: "select",
                label: "Ordenar por",
                value: ordenCol,
                onChange: (e) => setOrdenCol(e.target.value),
                options: [{ key: "default", label: "Por defecto" }],
              },
            ]}
          />

          {detallesFiltrados.length === 0 && (
            <p style={styles.emptyMsg}>No hay productos en esta cotización.</p>
          )}

          <div style={styles.footer}>
            <h2 style={{ margin: 0, fontFamily: "Lato" }}>
              Total estimado: <strong>{totalEstimado.toLocaleString("es-PY")} Gs.</strong>
            </h2>
            <button style={styles.botonGuardar}>
              Generar Orden de Compra
            </button>
          </div>
        </div>

        {/* COTIZACIONES DEL PEDIDO — selección multi-proveedor por producto */}
        {todasCotizaciones.length > 0 && (
          <div style={{ ...styles.cardTabla, marginTop: 20 }}>
            <h2 style={styles.subtitulo}>Cotizaciones del Pedido</h2>

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

            <p style={{ fontSize: 13, color: "#666", fontFamily: "Lato, sans-serif", margin: "0 0 12px 0" }}>
              Seleccioná el proveedor de cada producto haciendo clic en el radio de la fila correspondiente.
            </p>

            {cotizacionesFiltradas.map((cot) => (
              <CotizacionGroup
                key={cot.id_cotizacion}
                cotizacion={cot}
                seleccionPorProducto={seleccionPorProducto}
                onToggleProducto={handleToggleProducto}
                esCotizacionActual={cot.codigo_cotizacion === id}
              />
            ))}

            {/* Footer de selección */}
            <div style={styles.footer}>
              <div>
                <h2 style={{ margin: 0, fontFamily: "Lato" }}>
                  Total seleccionado:{" "}
                  <strong>{totalSeleccionado.toLocaleString("es-PY")} Gs.</strong>
                </h2>
                {!todosAsignados && productosPedido.length > 0 && (
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", fontFamily: "Lato" }}>
                    {Object.keys(seleccionPorProducto).length}/{productosPedido.length} productos asignados
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

        {/* Botón cargar cotización cuando aún no hay otras cotizaciones cargadas */}
        {todasCotizaciones.length === 0 && idPedido && (
          <div style={{ ...styles.cardTabla, marginTop: 20, textAlign: "center" }}>
            <p style={{ fontFamily: "Lato", color: "#666", marginBottom: 16 }}>
              Todavía no hay otras cotizaciones para este pedido.
            </p>
            <button
              onClick={handleAbrirModalCotizacion}
              disabled={cargandoProveedores}
              style={{
                height: 40, paddingLeft: 24, paddingRight: 24,
                background: getColor("amarillo"),
                boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
                borderRadius: 8, outline: "1px #000000 solid",
                border: "none", cursor: cargandoProveedores ? "wait" : "pointer",
                fontWeight: 700, fontSize: 15, fontFamily: "Lato", color: "#000",
                opacity: cargandoProveedores ? 0.6 : 1,
              }}
            >
              {cargandoProveedores ? "Cargando..." : "+ Cargar Cotización"}
            </button>
          </div>
        )}

      </main>

      {/* MODAL CARGAR COTIZACIÓN */}
      <CargarCotizacionModal
        open={modalCotizacion}
        onClose={() => setModalCotizacion(false)}
        onGuardado={handleGuardadoCotizacion}
        idPedido={idPedido}
        productos={productosPedido}
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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    background: "#F9F9F9",
    border: "1px solid #000",
    borderRadius: 12,
    padding: 20,
    fontFamily: "Lato",
  },
  cardTabla: { borderRadius: 12, padding: 20, background: "#ffffff", boxShadow: "0px 4px 20px rgba(0,0,0,0.15)", border: "1px solid #e0e0e0" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, flexWrap: "wrap", gap: 12 },
  botonGuardar: { background: getColor("amarillo"), border: "1px solid #000000", borderRadius: 999, padding: "10px 30px", cursor: "pointer", fontWeight: "bold", fontFamily: "Lato" },
  emptyMsg: { textAlign: "center", color: "#888", fontFamily: "Lato", padding: "20px 0", fontStyle: "italic" },
  cotizacionControles: { display: "flex", gap: 14, alignItems: "center", marginBottom: 16, flexWrap: "wrap" },
};

import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import List from "../../../components/Lista";
import { useNavigate, useParams } from "react-router-dom";

import { IconoFlecha } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function DetallePedido({ usuario, onNavegar, onLogout }) {

  const navigate = useNavigate();
  const { id } = useParams();

  const [tabActiva, setTabActiva]           = useState("detalle");
  const [pedido, setPedido]                 = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");

  const [busquedaDetalle, setBusquedaDetalle] = useState("");
  const [busquedaCot, setBusquedaCot]         = useState("");

  // ─── Fetch completo del pedido ────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const fetchPedido = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/compras/pedidos/${id}/completo`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "No se pudo cargar el pedido");
        setPedido(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [id]);

  // ─── Filtros ──────────────────────────────────────────────────────────────
  const productosFiltrados = (pedido?.detalle ?? []).filter((p) =>
    p.producto.toLowerCase().includes(busquedaDetalle.toLowerCase())
  );

  // Las cotizaciones se muestran "aplanadas": una fila por cada detalle de cotización,
  // enriquecida con datos de la cabecera (proveedor, código, estado).
  // Si una cotización no tiene detalles, igual aparece como una fila vacía.
  const filasCotizaciones = (pedido?.cotizaciones ?? []).flatMap((c) => {
    if (!c.detalle || c.detalle.length === 0) {
      return [{
        id: `${c.id_cotizacion}-empty`,
        codigo_cotizacion: c.codigo_cotizacion,
        proveedor: c.proveedor,
        estado_cotizacion: c.estado,
        fecha_respuesta: c.fecha_respuesta,
        producto: '—',
        cantidad: '—',
        precio_unitario: '—',
        subtotal: '—',
        es_mejor_opcion: false,
      }];
    }
    return c.detalle.map((d) => ({
      id: d.id_cotizacion_detalle,
      codigo_cotizacion: c.codigo_cotizacion,
      proveedor: c.proveedor,
      estado_cotizacion: c.estado,
      fecha_respuesta: c.fecha_respuesta,
      producto: d.producto,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario.toLocaleString("es-PY"),
      subtotal: d.subtotal.toLocaleString("es-PY"),
      es_mejor_opcion: d.es_mejor_opcion,
    }));
  }).filter((f) =>
    f.producto.toLowerCase().includes(busquedaCot.toLowerCase()) ||
    f.codigo_cotizacion.toLowerCase().includes(busquedaCot.toLowerCase()) ||
    f.proveedor.toLowerCase().includes(busquedaCot.toLowerCase())
  );

  // ─── Costo total estimado ─────────────────────────────────────────────────
  const totalEstimado = (pedido?.detalle ?? []).reduce(
    (acc, d) => acc + (d.subtotal ?? 0), 0
  );

  // ─── Columnas ─────────────────────────────────────────────────────────────
  const columnsDetalle = [
    { key: "producto",   label: "Producto"  },
    { key: "categoria",  label: "Categoría" },
    { key: "marca",      label: "Marca"     },
    { key: "inventario", label: "Inventario"},
    { key: "cantidad",   label: "Cantidad"  },
    {
      key: "precio",
      label: "Precio",
      render: (item) => (
        <span>{Number(item.precio).toLocaleString("es-PY")}</span>
      ),
    },
    {
      key: "subtotal",
      label: "Subtotal estimado",
      render: (item) => (
        <span>{Number(item.subtotal).toLocaleString("es-PY")}</span>
      ),
    },
  ];

  const columnsCotizaciones = [
    { key: "codigo_cotizacion",  label: "Cotización"  },
    { key: "proveedor",          label: "Proveedor"   },
    { key: "estado_cotizacion",  label: "Estado"      },
    { key: "fecha_respuesta",    label: "Fecha"       },
    { key: "producto",           label: "Producto"    },
    { key: "cantidad",           label: "Cantidad"    },
    { key: "precio_unitario",    label: "Precio unit."},
    { key: "subtotal",           label: "Subtotal"    },
    {
      key: "es_mejor_opcion",
      label: "Mejor opción",
      render: (item) => (
        <span style={{
          fontWeight: item.es_mejor_opcion ? 700 : 400,
          color: item.es_mejor_opcion ? "#22a000" : "#888",
        }}>
          {item.es_mejor_opcion ? "✓ Sí" : "—"}
        </span>
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
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
            <div><strong>Costo total:</strong> {pedido?.precio_total != null ? Number(pedido.precio_total).toLocaleString("es-PY") : "—"}</div>
          </div>
        </div>

        {/* TABS */}
        <div style={styles.tabs}>
          <div
            onClick={() => setTabActiva("detalle")}
            style={tabActiva === "detalle" ? styles.tabActiva : styles.tab}
          >
            Detalle del pedido
            <span style={styles.badge}>{pedido?.detalle?.length ?? 0}</span>
          </div>
          <div
            onClick={() => setTabActiva("cotizaciones")}
            style={tabActiva === "cotizaciones" ? styles.tabActiva : styles.tab}
          >
            Cotizaciones del pedido
            <span style={styles.badge}>{pedido?.cotizaciones?.length ?? 0}</span>
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
                Costo total estimado: <strong>{totalEstimado.toLocaleString("es-PY")} Gs.</strong>
              </h2>
            </div>
          </div>
        )}

        {/* TAB: COTIZACIONES */}
        {tabActiva === "cotizaciones" && (
          <div style={styles.cardTabla}>
            <List
              data={filasCotizaciones}
              columns={columnsCotizaciones}
              controls={[
                {
                  type: "search",
                  placeholder: "Buscar cotización, proveedor o producto...",
                  value: busquedaCot,
                  onChange: (e) => setBusquedaCot(e.target.value),
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

            {filasCotizaciones.length === 0 && (
              <p style={styles.emptyMsg}>
                No hay cotizaciones cargadas para este pedido todavía.
              </p>
            )}

            <div style={styles.footer}>
              <h2 style={{ margin: 0, fontFamily: "Lato" }}>
                Costo total estimado: <strong>{totalEstimado.toLocaleString("es-PY")} Gs.</strong>
              </h2>
              <button style={styles.botonGuardar}>
                Generar orden de compra
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

const styles = {
  pagina: {
    display: "flex",
    minHeight: "100vh",
    background: "#ffffff",
  },
  contenido: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },
  botonVolver: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    transform: "rotate(270deg)",
    display: "flex",
    alignItems: "center",
  },
  titulo: {
    textAlign: "center",
    fontSize: 42,
    margin: 0,
    fontFamily: "Lato",
  },
  linea: {
    height: 4,
    background: "#000",
    marginTop: 10,
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #000000",
    marginBottom: 20,
    boxShadow: "0px 1px 4px rgba(0,0,0,0.2)",
  },
  subtitulo: {
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Lato",
  },
  infoContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    background: "#F9F9F9",
    border: "1px solid #000",
    borderRadius: 12,
    padding: 20,
    fontFamily: "Lato",
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    marginBottom: 10,
    gap: 4,
  },
  tabActiva: {
    background: "#ffffff",
    padding: "12px 20px",
    textAlign: "center",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottom: `5px solid ${getColor("amarillo")}`,
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "Lato",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
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
    gap: 8,
  },
  badge: {
    background: "#1D1D1D",
    color: "#fff",
    borderRadius: 999,
    padding: "1px 8px",
    fontSize: 12,
    fontWeight: 700,
  },
  cardTabla: {
    borderRadius: 12,
    padding: 20,
    background: "#ffffff",
    boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",
    border: "1px solid #e0e0e0",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  botonGuardar: {
    background: getColor("amarillo"),
    border: "1px solid #000000",
    borderRadius: 999,
    padding: "10px 30px",
    cursor: "pointer",
    fontWeight: "bold",
    fontFamily: "Lato",
  },
  emptyMsg: {
    textAlign: "center",
    color: "#888",
    fontFamily: "Lato",
    padding: "20px 0",
    fontStyle: "italic",
  },
};
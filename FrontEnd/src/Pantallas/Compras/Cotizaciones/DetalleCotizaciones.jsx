import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import List from "../../../components/Lista";
import CargarCotizacionModal from "./CargarCotizacionModal";
import { getColor } from "../../../components/Colors";
import { IconoFlecha } from "../../../components/Icons";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function DetalleCotizacion({ usuario, onNavegar, onLogout }) {
  const { id } = useParams(); // id = codigo_cotizacion (ej: "COT-0001")
  const navigate = useNavigate();

  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busquedaCot, setBusquedaCot] = useState("");
  const [ordenCot, setOrdenCot] = useState("default");
  const [mostrarModalCotizacion, setMostrarModalCotizacion] = useState(false);

  // Fetch de cotización por código
  useEffect(() => {
    if (!id) return;

    const fetchCotizacion = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/compras/cotizaciones/codigo/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "No se pudo cargar la cotización");
        setCotizacion(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCotizacion();
  }, [id]);

  // Filas para la tabla de detalle de la cotización
  const filas = (cotizacion?.cotizaciones_proveedores_detalle ?? [])
    .map((d) => ({
      id: d.id_cotizacion_detalle,
      producto: d.productos?.nombre ?? "—",
      cantidad: Number(d.cantidad ?? 0),
      precio_unitario: Number(d.precio_unitario ?? 0),
      subtotal: Number(d.subtotal ?? (d.cantidad * d.precio_unitario) ?? 0),
      es_mejor_opcion: d.es_mejor_opcion ? "✓ Sí" : "—",
      observacion: d.observacion ?? "—",
    }))
    .filter((f) =>
      f.producto.toLowerCase().includes(busquedaCot.toLowerCase())
    )
    .sort((a, b) => {
      if (ordenCot === "precioAsc") return a.precio_unitario - b.precio_unitario;
      if (ordenCot === "precioDesc") return b.precio_unitario - a.precio_unitario;
      if (ordenCot === "cantidad") return b.cantidad - a.cantidad;
      return 0;
    });

  const totalCotizacion = (cotizacion?.cotizaciones_proveedores_detalle ?? []).reduce(
    (acc, d) => acc + Number(d.subtotal ?? (d.cantidad * d.precio_unitario) ?? 0),
    0
  );

  const columnsCotizaciones = [
    { key: "producto", label: "Producto" },
    { key: "cantidad", label: "Cantidad" },
    { key: "precio_unitario", label: "Precio Unitario", render: (item) => item.precio_unitario.toLocaleString("es-PY") },
    { key: "subtotal", label: "Subtotal", render: (item) => item.subtotal.toLocaleString("es-PY") },
    { key: "es_mejor_opcion", label: "Mejor Opción" },
    { key: "observacion", label: "Observación" },
  ];

  // Datos del pedido relacionado para el modal
  const productosDePedido = (cotizacion?.pedidos_compras?.pedidos_compras_detalle ?? []).map((d) => ({
    id: d.id_pedido_compra_detalle,
    producto: d.productos?.nombre ?? "—",
    cantidad: Number(d.cantidad ?? 0),
    precio: Number(d.precio ?? 0),
  }));

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

  const proveedor = cotizacion?.proveedores?.personas
    ? `${cotizacion.proveedores.personas.nombre ?? ""} ${cotizacion.proveedores.personas.apellido ?? ""}`.trim()
    : "—";
  const estado = cotizacion?.estados?.nombre ?? "—";
  const pedidoCodigo = cotizacion?.pedidos_compras?.codigo_pedido ?? "—";

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
            <h1 style={styles.titulo}>Cotización {id}</h1>
            <div style={styles.linea} />
          </div>
        </div>

        {/* INFO DE LA COTIZACIÓN */}
        <div style={styles.card}>
          <h2 style={styles.subtitulo}>Detalle de Cotización</h2>
          <div style={styles.infoContainer}>
            <div><strong>Código:</strong> {cotizacion?.codigo_cotizacion ?? "—"}</div>
            <div><strong>Pedido asociado:</strong> {pedidoCodigo}</div>
            <div><strong>Proveedor:</strong> {proveedor}</div>
            <div><strong>Estado:</strong> {estado}</div>
            <div><strong>Fecha respuesta:</strong> {cotizacion?.fecha_respuesta ?? "—"}</div>
            {cotizacion?.observacion && (
              <div><strong>Observación:</strong> {cotizacion.observacion}</div>
            )}
          </div>
        </div>

        {/* TABLA DETALLE */}
        <div style={styles.cardTabla}>
          <List
            data={filas}
            columns={columnsCotizaciones}
            controls={[
              {
                type: "search",
                placeholder: "Buscar producto en cotización...",
                value: busquedaCot,
                onChange: (e) => setBusquedaCot(e.target.value),
              },
              {
                type: "select",
                label: "Ordenar por",
                value: ordenCot,
                onChange: (e) => setOrdenCot(e.target.value),
                options: [
                  { key: "default", label: "Por defecto" },
                  { key: "precioAsc", label: "Precio: menor a mayor" },
                  { key: "precioDesc", label: "Precio: mayor a menor" },
                  { key: "cantidad", label: "Mayor cantidad" },
                ],
              },
              {
                type: "button",
                label: "Cargar Cotización",
                onClick: () => setMostrarModalCotizacion(true),
              },
            ]}
          />

          {filas.length === 0 && !busquedaCot && (
            <p style={{ textAlign: "center", color: "#888", fontFamily: "Lato", padding: "20px 0", fontStyle: "italic" }}>
              Esta cotización no tiene productos cargados aún.
            </p>
          )}

          <div style={styles.footer}>
            <h2 style={{ margin: 0, fontFamily: "Lato" }}>
              Costo total: <strong>{totalCotizacion.toLocaleString("es-PY")} Gs.</strong>
            </h2>
            <button style={styles.botonGuardar} onClick={() => alert("Función: Generar Orden de Compra")}>
              Generar Orden de Compra
            </button>
          </div>
        </div>

        {/* MODAL */}
        <CargarCotizacionModal
          open={mostrarModalCotizacion}
          onClose={() => setMostrarModalCotizacion(false)}
          codigoCotizacion={cotizacion?.codigo_cotizacion}
          idCotizacion={cotizacion?.id_cotizacion}
          idPedido={cotizacion?.id_pedido}
          proveedor={proveedor}
          onGuardar={async (payload) => {
            try {
              const res = await fetch(`${API_BASE}/compras/cotizaciones/${cotizacion.id_cotizacion}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.message || "Error al guardar");
              // Recargar la cotización
              const res2 = await fetch(`${API_BASE}/compras/cotizaciones/codigo/${id}`);
              const data2 = await res2.json();
              setCotizacion(data2);
            } catch (err) {
              throw err;
            }
          }}
        />

      </main>
    </div>
  );
}

const styles = {
  pagina: { display: "flex", minHeight: "100vh", background: "#ffffff" },
  contenido: { flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" },
  header: { display: "flex", alignItems: "center", gap: 20 },
  botonVolver: {
    border: "none", background: "transparent", cursor: "pointer",
    transform: "rotate(270deg)", display: "flex", alignItems: "center",
  },
  titulo: { textAlign: "center", fontSize: 42, margin: 0, fontFamily: "Lato" },
  linea: { height: 4, background: "#000", marginTop: 10 },
  card: {
    background: "#ffffff", borderRadius: 16, padding: 20,
    border: "1px solid #000000", boxShadow: "0px 1px 4px rgba(0,0,0,0.2)",
  },
  subtitulo: { textAlign: "center", marginBottom: 20, fontFamily: "Lato" },
  infoContainer: {
    display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
    background: "#F9F9F9", border: "1px solid #000", borderRadius: 12, padding: 20,
    fontFamily: "Lato",
  },
  cardTabla: {
    borderRadius: 16, padding: 20, background: "#ffffff",
    boxShadow: "0px 4px 20px rgba(0,0,0,0.15)", border: "1px solid #e0e0e0",
  },
  footer: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginTop: 20, flexWrap: "wrap", gap: 12,
  },
  botonGuardar: {
    background: getColor("amarillo"), border: "1px solid #000000",
    borderRadius: 999, padding: "10px 30px", cursor: "pointer",
    fontWeight: "bold", fontFamily: "Lato",
  },
};
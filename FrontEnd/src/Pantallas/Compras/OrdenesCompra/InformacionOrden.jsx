import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getColor } from "../../../components/Colors";
import List from "../../../components/Lista";
import fetchConToken from "../../../token";
import ModalCargarFactura from "./CargarFacturaModal";
import ModalNotaCredito from "./NotaCreditoModal";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

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
  const [facturaParaNota, setFacturaParaNota] = useState(null);

  const { id: idParam } = useParams();
  const idOrden = orden?.id_orden ?? orden?.id ?? idParam;

  const cargarOrden = async () => {
    if (!idOrden) return;
    try {
      setLoading(true);
      setError("");
      const response = await fetchConToken(
        `${API_BASE}/compras/ordenes-compra/${idOrden}`
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

const facturasReales = (ordenCompleta?.facturas || []).filter(
  (f) => f.nro_factura && f.nro_factura.toString().trim() !== ""
);

const ordenAnulada =
  (ordenActual?.estado || "").toLowerCase() === "anulado" ||
  (facturasReales.length > 0 &&
    facturasReales.every(
      (f) => (f.estado || "").toLowerCase() === "anulado"
    ));
const productosPendientes = ordenAnulada
  ? 0
  : (ordenCompleta?.detalle || [])
      .filter((det) => (det.estado || '').toLowerCase() !== 'anulado')
      .reduce(
        (acc, det) =>
          acc + Math.max(0, (det.cantidad || 0) - (det.cantidad_recibida || 0)),
        0
      );

  const ordenTotalmenteEntregada =
    !ordenAnulada &&
    productosPendientes === 0 &&
    ordenCompleta?.detalle?.length > 0;
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

{
  key: "estado",
  label: "Estado",
  render: (factura) => {
    const tieneNota =
      factura.notas_credito_compras &&
      factura.notas_credito_compras.length > 0;
    const estado = tieneNota ? "Anulado" : (factura.estado || "-");
    const esAnulado = estado.toLowerCase() === "anulado";
    const esPlaceholder =
      !factura.nro_factura || factura.nro_factura.toString().trim() === "";
    return (
      <span style={{
        fontWeight: "bold",
        color: esAnulado ? "#c0392b" : esPlaceholder ? "#aaa" : "#27ae60",
      }}>
        {esPlaceholder ? "Pendiente" : estado}
      </span>
    );
  }
},
    { key: "importe_total", label: "Importe Total" },
    {
      key: "acciones",
      label: "Acciones",
      render: (factura) => {
        const esAnulada =
          (factura.estado || "").toLowerCase() === "anulado";
        const esPlaceholder =
          !factura.nro_factura ||
          factura.nro_factura.toString().trim() === "";
        if (esAnulada || esPlaceholder) return null;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFacturaParaNota(factura);
            }}
            style={{
              background: "#c0392b",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "5px 10px",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "Lato",
              fontWeight: "bold",
            }}
          >
            Nota de Crédito
          </button>
        );
      },
    },
  ];

  if (!ordenActual) return <div>Cargando orden...</div>;

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

        {/* ── Banner estado de entrega ── */}
{ordenCompleta && (
  <div style={{
    width: "100%",
    maxWidth: 1100,
    padding: "12px 20px",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: ordenAnulada ? "#FDECEA" : ordenTotalmenteEntregada ? "#E8F5E9" : "#FFF8E1",
    border: `2px solid ${ordenAnulada ? "#EF9A9A" : ordenTotalmenteEntregada ? "#A5D6A7" : "#FFD54F"}`,
    fontFamily: "Lato",
    fontSize: 14,
    boxSizing: "border-box",
  }}>
    <div>
      <strong>
        {ordenAnulada
          ? "Orden anulada"
          : ordenTotalmenteEntregada
          ? "Todos los productos fueron entregados"
          : `Entrega pendiente: ${productosPendientes} unidad${productosPendientes !== 1 ? "es" : ""} sin facturar`}
      </strong>
      {ordenAnulada && (
        <p style={{ margin: 0, color: "#888", fontSize: 13 }}>
          Esta orden tiene una o más facturas anuladas por nota de crédito y no puede recibir nuevas facturas.
        </p>
      )}
      {!ordenAnulada && !ordenTotalmenteEntregada && (
        <p style={{ margin: 0, color: "#888", fontSize: 13 }}>
          Podés cargar una nueva factura con los productos restantes desde la pestaña Facturas.
        </p>
      )}
    </div>
  </div>
)}

        <div style={styles.detalle}>
          <div style={styles.tabs}>
            <div
              onClick={() => setTabActiva("detalle")}
              style={
                tabActiva === "detalle" ? styles.tabActiva : styles.tab
              }
            >
              Detalle de Orden
            </div>
            <div
              onClick={() => setTabActiva("facturas")}
              style={
                tabActiva === "facturas" ? styles.tabActiva : styles.tab
              }
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
                ...(!ordenTotalmenteEntregada && !ordenAnulada ? [{
                  type: "button",
                  label: `Cargar Factura${productosPendientes > 0 ? ` (${productosPendientes} pend.)` : ""}`,
                  onClick: () => setModalAbierto(true),
                }] : []),
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

      {facturaParaNota && (
        <ModalNotaCredito
          factura={facturaParaNota}
          idOrden={idOrden}
          onClose={() => setFacturaParaNota(null)}
          onGuardado={() => {
            setFacturaParaNota(null);
            cargarOrden();
          }}
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
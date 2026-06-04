import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import List from "../../../components/Lista";
import { Button } from "../../../components/Buttons";
import { getColor } from "../../../components/Colors";
import SearchBar from "../../../components/Searchbar";
import fetchConToken from "../../../token";
import ModalPagoFacturas from "./ModalPagoFacturas";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function PagoFacturas({ usuario, onNavegar, onLogout }) {
  const navigate = useNavigate()
  const [facturasTodas, setFacturasTodas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchKey, setSearchKey] = useState(0)
  const [busquedaFac, setBusquedaFac] = useState("")
  const [filtroVencimiento, setFiltroVencimiento] = useState("")
  const [ordenFac, setOrdenFac] = useState("")
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const location = useLocation()
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(() => {
    const p = location.state?.proveedor
    return (p?.id && p?.nombre) ? p : null
  })

  useEffect((
  ) => {
    const cargar = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetchConToken(`${API_BASE}/compras/facturas`, {}, navigate)
        if (!response.ok)
          throw new Error(`Error ${response.status}: No se pudieron cargar las facturas`)

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json"))
          throw new Error("La respuesta del servidor no es JSON válido")

        const data = await response.json()

setFacturasTodas(
  (data || [])
    .filter((f) => {
      const tieneNro = f.codigo_factura && f.codigo_factura.toString().trim() !== ""
      const esConfirmado = (f.estados?.nombre || "").toLowerCase() === "confirmado"
      const noPagada = f.id_estado !== 0  // ✅ NUEVO: excluir facturas pagadas
      return tieneNro && esConfirmado && noPagada
    })
    .map((f) => ({
      id: Number(f.id_factura_compra),        
      codigo: f.codigo_factura,      
      fecha_creacion: f.fecha_emision,
      fecha_limite: f.fecha_vencimiento,
      orden_compra: f.ordenes_compras?.codigo_orden || "",
      proveedor_id: f.proveedores?.id_proveedor,
      proveedor: f.proveedores?.personas?.nombre || "",
      estado: f.estados?.nombre || "",
      importe_total: f.importe_total ?? 0,
    }))
)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const facturasBruto = proveedorSeleccionado
    ? facturasTodas.filter((f) => f.proveedor_id === proveedorSeleccionado.id)
    : []

  const facturasFiltradas = facturasBruto
    .filter((f) => {
      const texto = busquedaFac.toLowerCase()
      return (
        f.codigo.toLowerCase().includes(texto) ||
        f.fecha_creacion?.includes(texto) ||
        f.fecha_limite?.includes(texto) ||
        f.orden_compra.toLowerCase().includes(texto)
      )
    })
    .filter((f) => {
      if (!filtroVencimiento) return true
      const hoy = new Date()
      const limite = new Date(f.fecha_limite)
      if (filtroVencimiento === "vencidas") return limite < hoy
      if (filtroVencimiento === "proximas") {
        const diff = (limite - hoy) / (1000 * 60 * 60 * 24)
        return diff >= 0 && diff <= 7
      }
      if (filtroVencimiento === "al_dia") return limite >= hoy
      return true
    })
    .sort((a, b) => {
      if (ordenFac === "fechaCreacionDesc")
        return new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
      if (ordenFac === "fechaCreacionAsc")
        return new Date(a.fecha_creacion) - new Date(b.fecha_creacion)
      if (ordenFac === "fechaLimiteAsc")
        return new Date(a.fecha_limite) - new Date(b.fecha_limite)
      return 0
    })

  const toggleFactura = (factura) => {
    setFacturasSeleccionadas((prev) =>
      prev.find((f) => f.id === factura.id)
        ? prev.filter((f) => f.id !== factura.id)
        : [...prev, factura]
    )
  }

  const columnsFacturas = [
    { key: "codigo", label: "Código" },
    { key: "orden_compra", label: "Orden de Compra" },
    { key: "fecha_creacion", label: "Fecha de Emisión" },
    { key: "fecha_limite", label: "Fecha de Vencimiento" },
    { key: "estado", label: "Estado" },
    {
      key: "seleccionar",
      label: "",
      width: "48px",
      render: (factura) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <input
            type="checkbox"
            checked={!!facturasSeleccionadas.find((f) => f.id === factura.id)}
            onChange={() => toggleFactura(factura)}
            style={{ width: 18, height: 18, cursor: "pointer" }}
          />
        </div>
      ),
    },
  ]
  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Pago de Facturas a Proveedores</h1>
          <div style={styles.separador} />
        </header>

        {loading && <div>Cargando facturas...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}

        {!loading && !error && (
          <>
            {/* BÚSQUEDA DE PROVEEDOR */}
            <section style={styles.seccion}>
              <h2 style={styles.subtitulo}>
                1. Seleccione un proveedor
                {proveedorSeleccionado && (
                  <span style={styles.proveedorBadge}>
                    {proveedorSeleccionado.nombre}
                  </span>
                )}
              </h2>

              <SearchBar
  key={searchKey}
  apiUrl={`${API_BASE}/compras/proveedores/search`}
  queryParam="search"
  placeholder="Buscar proveedor..."
  fetchOnMount={true}
  initialValue={proveedorSeleccionado?.nombre || ""}   // ✅ NUEVO
  onSelect={(rawItem) => {
    setProveedorSeleccionado({
      id: rawItem.id_proveedor,
      nombre: rawItem.personas?.nombre ?? ''
    })
    setFacturasSeleccionadas([])
  }}
  onClear={() => {
    setProveedorSeleccionado(null)
    setFacturasSeleccionadas([])
  }}
  getLabel={(item) => item?.personas?.nombre || ""}
  renderOption={(item) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontWeight: 700, fontSize: 14 }}>
        {item.personas?.nombre} {item.personas?.apellido ?? ''}
      </span>
      <span style={{ fontSize: 12, color: "#888" }}>
        RUC: {item.personas?.ruc ?? '—'}
        {" · Plazo: "}{item.plazo_entrega ?? '—'} días
      </span>
    </div>
  )}
  style={{ maxWidth: 500 }}
/>
</section>

            {/* FACTURAS */}
            {proveedorSeleccionado && (
              <section style={styles.seccion}>
                <h2 style={styles.subtitulo}>
                  2. Seleccione las facturas de{" "}
                  <strong>{proveedorSeleccionado.nombre}</strong>
                </h2>

                <List
                  data={facturasFiltradas}
                  columns={columnsFacturas}
                  selectable={false}
                  onRowClick={(factura) => toggleFactura(factura)}
                  controls={[
                    {
                      type: "search",
                      placeholder: "Buscar factura...",
                      value: busquedaFac,
                      onChange: (e) => setBusquedaFac(e.target.value),
                    },
                    {
                      type: "select",
                      label: "Vencimiento:",
                      placeholder: "Todos",
                      value: filtroVencimiento,
                      onChange: (e) => setFiltroVencimiento(e.target.value),
                      options: [
                        { key: "vencidas", label: "Vencidas" },
                        { key: "proximas", label: "Próximas (7 días)" },
                        { key: "al_dia", label: "Al día" },
                      ],
                    },
                    {
                      type: "select",
                      label: "Ordenar por:",
                      placeholder: "Sin orden",
                      value: ordenFac,
                      onChange: (e) => setOrdenFac(e.target.value),
                      options: [
                        { key: "fechaCreacionDesc", label: "Emisión más reciente" },
                        { key: "fechaCreacionAsc", label: "Emisión más antigua" },
                        { key: "fechaLimiteAsc", label: "Vence primero" },
                      ],
                    },
                  ]}
                />

                {facturasSeleccionadas.length > 0 && (
                  <div style={styles.resumen}>
                    <span style={styles.resumenTexto}>
                      {facturasSeleccionadas.length} factura
                      {facturasSeleccionadas.length > 1 ? "s" : ""} seleccionada
                      {facturasSeleccionadas.length > 1 ? "s" : ""}
                    </span>
                    <Button
                      label="Proceder al pago"
                      variant="amarillo"
                      size="lg"
                      onClick={() => setModalAbierto(true)}
                    />
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {modalAbierto && (
        <ModalPagoFacturas
          proveedor={proveedorSeleccionado}
          facturas={facturasSeleccionadas}
          onClose={() => setModalAbierto(false)}
          onConfirmar={() => {
            setModalAbierto(false)
            setFacturasSeleccionadas([])
            setProveedorSeleccionado(null)
            setSearchKey(k => k + 1)
          }}
        />
      )}
    </div>
  )
}

const styles = {
  pagina: {
    display: "flex",
    minHeight: "100vh",
    background: getColor("blanco"),
  },
  contenido: {
    flex: 1,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 32,
  },
  encabezado: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "21px 0",
  },
  titulo: {
    color: getColor("negro"),
    fontSize: 42,
    fontFamily: "Lato, sans-serif",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textAlign: "center",
  },
  separador: {
    width: "min(1100px, 80%)",
    height: 4,
    background: getColor("negro"),
  },
  seccion: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  subtitulo: {
    fontSize: 20,
    fontFamily: "Lato, sans-serif",
    fontWeight: 700,
    color: getColor("negro"),
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  proveedorBadge: {
    fontSize: 14,
    fontWeight: 400,
    background: getColor("amarillo"),
    borderRadius: 6,
    padding: "2px 10px",
    color: getColor("negro"),
  },
  resumen: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: getColor("gris-claro"),
    border: `2px solid ${getColor("negro")}`,
    borderRadius: 12,
    padding: "16px 24px",
    marginTop: 8,
  },
  resumenTexto: {
    fontFamily: "Lato, sans-serif",
    fontSize: 16,
    color: getColor("negro"),
  },
}
import React, { useMemo, useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import List from "../../../components/Lista";
import SearchBar from "../../../components/Searchbar";
import { useNavigate } from "react-router-dom";

import {
  IconoLupa,
  IconoCalculadora,
  IconoFlecha,
  IconoMas,
  IconoCerrar,
  IconoMenos
} from "../../../components/Icons";

import { getColor } from "../../../components/Colors";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

const mapProductoFromAPI = (p) => ({
  id:               p.id_producto,
  nombre:           p.nombre          || "",
  categoria:        p.categorias_productos?.nombre || "",
  marca:            p.marcas?.nombre   || "",
  inventario:       p.stock_actual     ?? 0,
  inventarioMinimo: p.stock_minimo     ?? 0,
  inventarioMaximo: null,
  precio:           Number(p.precio_compra ?? 0),
});

export default function NuevosPedidos({ usuario, onNavegar, onLogout }) {

  const navigate = useNavigate();

  const [cantidad, setCantidad] = useState(1);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [ordenCompra, setOrdenCompra] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState("");

  // Carga proveedores desde el propio backend (mismo patrón que el resto del proyecto)
  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const res = await fetch(`${API_BASE}/compras/proveedores`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProveedores(data.map((p) => ({
            id: p.id_proveedor,
            nombre: `${p.personas?.nombre ?? ""} ${p.personas?.apellido ?? ""}`.trim(),
          })));
        }
      } catch (err) {
        console.error("Error cargando proveedores:", err);
      }
    };
    cargarProveedores();
  }, []);

  const agregarAOrden = () => {
    if (!productoSeleccionado) return;
    const subtotal = productoSeleccionado.precio * cantidad;
    setOrdenCompra((prev) => [
      ...prev,
      { ...productoSeleccionado, cantidad, subtotal, _uid: Date.now() + Math.random() }
    ]);
    setCantidad(1);
  };

  const eliminarDeOrden = (uid) => {
    setOrdenCompra((prev) => prev.filter((item) => item._uid !== uid));
  };

  const totalEstimado = useMemo(
    () => ordenCompra.reduce((acc, item) => acc + item.subtotal, 0),
    [ordenCompra]
  );

  const handleGuardarClick = () => {
    if (ordenCompra.length === 0) {
      setErrorGuardar("Debes agregar al menos un producto antes de guardar.");
      return;
    }
    setErrorGuardar("");
    setMostrarModalConfirmar(true);
  };

  // Guarda cabecera + detalle a través del backend propio
  const handleConfirmarGuardar = async () => {
    setGuardando(true);
    setErrorGuardar("");

    try {
      const codigoPedido = `PED_${Date.now()}`;

      // 1. Insertar cabecera en pedidos_compras
      const resCabecera = await fetch(`${API_BASE}/compras/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha_creacion: new Date().toISOString().split("T")[0],
          precio_total: totalEstimado,
          id_estado: 1,
          codigo_pedido: codigoPedido,
        }),
      });

      const dataCabecera = await resCabecera.json();
      if (!resCabecera.ok) {
        throw new Error(dataCabecera?.message || "Error al crear el pedido");
      }

      // El backend puede devolver el objeto directamente o dentro de una propiedad
      const idPedido =
        dataCabecera?.id_pedido ??
        dataCabecera?.pedido?.id_pedido ??
        dataCabecera?.[0]?.id_pedido;

      if (!idPedido) throw new Error("No se obtuvo el ID del pedido creado");

      // 2. Insertar detalles en pedidos_compras_detalle
      const resDetalles = await fetch(`${API_BASE}/compras/pedidos/detalle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          ordenCompra.map((item) => ({
            id_pedido_compra: idPedido,
            id_producto: item.id,
            cantidad: item.cantidad,
            precio: item.precio,
            id_estado: 1,
          }))
        ),
      });

      const dataDetalles = await resDetalles.json();
      if (!resDetalles.ok) {
        throw new Error(dataDetalles?.message || "Error al guardar los detalles");
      }

      setMostrarModalConfirmar(false);
      navigate("/compras/pedidos");

    } catch (err) {
      console.error("Error guardando pedido:", err);
      setErrorGuardar(err.message || "Error inesperado al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const columns = [
    { key: "id", label: "ID", width: "70px" },
    { key: "nombre", label: "Producto" },
    { key: "categoria", label: "Categoría" },
    { key: "marca", label: "Marca" },
    { key: "inventario", label: "Inventario" },
    { key: "cantidad", label: "Cantidad" },
    {
      key: "precio",
      label: "Último Precio",
      render: (item) => item.precio.toLocaleString("es-PY")
    },
    {
      key: "subtotal",
      label: "Subtotal estimado",
      render: (item) => item.subtotal.toLocaleString("es-PY")
    },
    {
      key: "acciones",
      label: "",
      width: "90px",
      render: (item) => (
        <div style={styles.accionesCell}>
          <button
            style={styles.iconButton}
            title="Ver detalle"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <IconoLupa />
          </button>
          <button
            style={styles.iconButtonRojo}
            title="Eliminar de la orden"
            onClick={(e) => { e.stopPropagation(); eliminarDeOrden(item._uid); }}
          >
            <IconoMenos />
          </button>
        </div>
      )
    }
  ];

  const nombresProveedores = proveedores.length > 0
    ? proveedores.map((p) => p.nombre).join(", ")
    : "Cargando proveedores...";

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>

        {/* HEADER */}
        <header style={styles.encabezado}>
          <button
            onClick={() => navigate("/compras/pedidos")}
            style={styles.botonVolver}
            title="Volver a pedidos"
          >
            <IconoFlecha />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={styles.titulo}>Nuevo Pedido</h1>
            <div style={styles.separador} />
          </div>
        </header>

        {/* CARD AGREGAR PRODUCTO */}
        <div style={styles.card}>
          <div style={styles.cardTitulo}>
            <IconoMas />
            <span>Añadir producto</span>
          </div>

          <div style={styles.controles}>
            <SearchBar
              apiUrl={`${API_BASE}/misc/productos`}
              queryParam="search"
              placeholder="Buscar producto ..."
              fetchOnMount={true}
              onSelect={(rawItem) => setProductoSeleccionado(mapProductoFromAPI(rawItem))}
              onClear={() => setProductoSeleccionado(null)}
              getLabel={(item) => item?.nombre || ""}
              renderOption={(item) => (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{item.nombre}</span>
                  <span style={{ fontSize: 12, color: "#888" }}>
                    {item.categorias_productos?.nombre ?? "—"}
                    {" · "}{item.marcas?.nombre ?? "—"}
                    {" · Stock: "}{item.stock_actual ?? 0}
                  </span>
                </div>
              )}
              style={{ flex: 1, minWidth: 250 }}
            />

            <div style={styles.cantidadContainer}>
              <span>Cantidad para añadir:</span>
              <input
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                style={styles.inputCantidad}
              />
            </div>

            <button onClick={agregarAOrden} style={styles.botonAgregar}>
              Añadir a la Orden
            </button>

            <button style={styles.botonSecundario} onClick={() => setMostrarModal(true)}>
              Registrar Nuevo Producto
            </button>
          </div>

          <div style={styles.infoProducto}>
            <div style={styles.iconoContainer}><IconoCalculadora /></div>
            <div style={styles.infoGrid}>
              <div><strong>Nombre:</strong></div>
              <div>{productoSeleccionado?.nombre || "-"}</div>
              <div><strong>Último precio:</strong></div>
              <div>{productoSeleccionado ? productoSeleccionado.precio.toLocaleString("es-PY") : "-"}</div>
              <div><strong>Categoría:</strong></div>
              <div>{productoSeleccionado?.categoria || "-"}</div>
              <div><strong>Inventario mínimo:</strong></div>
              <div>{productoSeleccionado?.inventarioMinimo ?? "-"}</div>
              <div><strong>Marca:</strong></div>
              <div>{productoSeleccionado?.marca || "-"}</div>
              <div><strong>Inventario máximo:</strong></div>
              <div>{productoSeleccionado?.inventarioMaximo ?? "-"}</div>
            </div>
          </div>
        </div>

        {/* ORDEN DE COMPRA */}
        <div style={styles.cardTabla}>
          <h2 style={styles.subtitulo}>Orden de Compra</h2>

          {/* Sin value/onChange en los controles para evitar el warning de React */}
          <List
            data={ordenCompra}
            columns={columns}
            selectable={false}
            controls={[
              { type: "search", placeholder: "Buscar producto..." },
              {
                type: "select",
                placeholder: "Ordenar por",
                options: [{ key: "default", label: "Por defecto" }]
              }
            ]}
          />

          {errorGuardar && <div style={styles.errorMsg}>{errorGuardar}</div>}

          <div style={styles.footer}>
            <h2>Costo total estimado: {totalEstimado.toLocaleString("es-PY")}</h2>
            <button
              style={{
                ...styles.botonGuardar,
                opacity: ordenCompra.length === 0 ? 0.5 : 1,
                cursor: ordenCompra.length === 0 ? "not-allowed" : "pointer",
              }}
              onClick={handleGuardarClick}
            >
              Guardar
            </button>
          </div>
        </div>

        {/* ── MODAL CONFIRMACIÓN GUARDAR ── */}
        {mostrarModalConfirmar && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalConfirmar}>

              <div style={styles.modalConfirmarTitulo}>
                Confirmacion pedido a proveedor
              </div>

              <div style={styles.modalConfirmarCuerpo}>
                <p style={styles.modalConfirmarTexto}>
                  Se le enviara un pedido de cotizacion a los siguientes proveedores:
                  <br />
                  <strong>{nombresProveedores}</strong>
                </p>

                {errorGuardar && <div style={styles.errorMsg}>{errorGuardar}</div>}

                <div style={styles.modalConfirmarBotones}>
                  <button
                    style={{
                      ...styles.botonConfirmar,
                      opacity: guardando ? 0.6 : 1,
                      cursor: guardando ? "not-allowed" : "pointer",
                    }}
                    onClick={handleConfirmarGuardar}
                    disabled={guardando}
                  >
                    {guardando ? "Guardando..." : "Confirmar"}
                  </button>

                  <button
                    style={styles.botonCancelar}
                    onClick={() => { setMostrarModalConfirmar(false); setErrorGuardar(""); }}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL REGISTRAR NUEVO PRODUCTO ── */}
        {mostrarModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitulo}>Producto</h2>
                <button onClick={() => setMostrarModal(false)} style={styles.botonCerrar}>
                  <IconoCerrar />
                </button>
              </div>

              <div style={styles.modalContenido}>
                <div style={styles.modalIzquierda}>
                  <div style={styles.imagenProducto}><IconoCalculadora /></div>
                  <h2>Neumático Pirelli</h2>
                </div>
                <div style={styles.modalDerecha}>
                  <div style={styles.formGroup}>
                    <label>Categoría del Producto:</label>
                    <input defaultValue="Neumático de pista" />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Marca del Neumático:</label>
                    <input defaultValue="Pirelli" />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Último Precio:</label>
                    <input defaultValue="1.200.000" />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Inventario Mínimo:</label>
                    <input defaultValue="10" />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Inventario Máximo:</label>
                    <input defaultValue="250" />
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <div style={styles.modalBotones}>
                  <button style={styles.botonAgregar}>Confirmar</button>
                  <button style={styles.botonSecundario} onClick={() => setMostrarModal(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

const styles = {
  pagina: { display: "flex", minHeight: "100vh", background: "#ffffff" },
  contenido: { flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 20 },
  encabezado: { display: "flex", alignItems: "center", gap: 20 },
  botonVolver: {
    border: "none", background: "transparent", cursor: "pointer",
    transform: "rotate(270deg)", display: "flex", alignItems: "center",
  },
  titulo: { fontSize: 42, fontWeight: 700, margin: 0, textAlign: "center", fontFamily: "Lato" },
  separador: { height: 4, background: "#000", marginTop: 10 },
  card: { background: "#ffffff", borderRadius: 16, padding: 20, border: "1px solid #000000" },
  cardTitulo: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, fontWeight: "bold", fontSize: 24, marginBottom: 20,
  },
  controles: { display: "flex", gap: 15, alignItems: "center", marginBottom: 20, flexWrap: "wrap" },
  cantidadContainer: { display: "flex", alignItems: "center", gap: 10 },
  inputCantidad: { width: 80, padding: 8 },
  botonAgregar: {
    background: getColor("amarillo"), border: "1px solid #000",
    borderRadius: 20, padding: "10px 20px", cursor: "pointer", fontWeight: "bold",
  },
  botonSecundario: {
    background: "#ffffff", border: "1px solid #000000",
    borderRadius: 20, padding: "10px 20px", cursor: "pointer",
  },
  infoProducto: {
    background: getColor("gris-claro"), borderRadius: 16, padding: 20,
    display: "flex", gap: 30, alignItems: "center",
  },
  iconoContainer: {
    width: 100, height: 100, borderRadius: 12, background: "#FFF",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  infoGrid: {
    flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
    rowGap: 15, columnGap: 30, alignItems: "center",
  },
  cardTabla: { background: "#ffffff", borderRadius: 16, padding: 20, border: "1px solid #000000" },
  subtitulo: { textAlign: "center", marginBottom: 20, fontFamily: "Lato" },
  footer: { marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" },
  botonGuardar: {
    background: getColor("amarillo"), border: "1px solid #000",
    borderRadius: 20, padding: "10px 30px", fontWeight: "bold",
  },
  errorMsg: {
    color: "#E30613", background: "#fff0f0", border: "1px solid #E30613",
    borderRadius: 8, padding: "10px 16px", marginTop: 10,
    fontFamily: "Lato, sans-serif", fontSize: 14,
  },
  accionesCell: { display: "flex", gap: 6, justifyContent: "center", alignItems: "center" },
  iconButton: {
    border: "none", background: getColor("amarillo"), borderRadius: 6,
    cursor: "pointer", padding: 5, display: "flex", alignItems: "center", justifyContent: "center",
  },
  iconButtonRojo: {
    border: "none", background: getColor("negro"), borderRadius: 6,
    cursor: "pointer", padding: 5, display: "flex", alignItems: "center",
    justifyContent: "center", color: "#ffffff",
  },
  modalOverlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.5)", display: "flex",
    justifyContent: "center", alignItems: "center", zIndex: 999,
  },
  modalConfirmar: {
    width: 480, maxWidth: "90%", background: "#ffffff",
    borderRadius: 16, overflow: "hidden", boxShadow: "0px 4px 20px rgba(0,0,0,0.4)",
  },
  modalConfirmarTitulo: {
    background: "#f0f0f0", padding: "10px 20px", fontSize: 13,
    color: "#555", fontFamily: "Lato, sans-serif", borderBottom: "1px solid #ddd",
  },
  modalConfirmarCuerpo: { padding: "30px 28px 24px", display: "flex", flexDirection: "column", gap: 20 },
  modalConfirmarTexto: {
    fontSize: 16, fontFamily: "Lato, sans-serif", fontWeight: 700,
    textAlign: "center", lineHeight: 1.6, margin: 0,
  },
  modalConfirmarBotones: { display: "flex", justifyContent: "flex-end", gap: 12 },
  botonConfirmar: {
    background: getColor("amarillo"), border: "none", borderRadius: 999,
    padding: "10px 24px", fontWeight: "bold", fontSize: 15,
    cursor: "pointer", fontFamily: "Lato, sans-serif",
  },
  botonCancelar: {
    background: "#ffffff", border: "1px solid #999", borderRadius: 999,
    padding: "10px 24px", fontSize: 15, cursor: "pointer", fontFamily: "Lato, sans-serif",
  },
  modal: {
    width: "80%", maxWidth: 900, background: "#ffffff",
    borderRadius: 24, overflow: "hidden", boxShadow: "0px 4px 20px rgba(0,0,0,0.4)",
  },
  modalHeader: {
    background: getColor("amarillo"), padding: "20px 30px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  modalTitulo: { margin: 0, fontSize: 40, fontWeight: "bold" },
  botonCerrar: { border: "none", background: "transparent", cursor: "pointer" },
  modalContenido: { display: "flex", gap: 40, padding: 40 },
  modalIzquierda: { width: 250, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 },
  imagenProducto: {
    width: 180, height: 180, background: "#ffffff",
    boxShadow: "0px 4px 20px rgba(0,0,0,0.4)", borderRadius: 12,
    display: "flex", justifyContent: "center", alignItems: "center",
  },
  modalDerecha: { flex: 1, display: "flex", flexDirection: "column", gap: 20 },
  formGroup: { display: "grid", gridTemplateColumns: "250px 1fr", alignItems: "center", gap: 20 },
  modalFooter: { padding: 30, display: "flex", flexDirection: "column", gap: 20 },
  modalBotones: { display: "flex", justifyContent: "flex-end", gap: 20 },
};
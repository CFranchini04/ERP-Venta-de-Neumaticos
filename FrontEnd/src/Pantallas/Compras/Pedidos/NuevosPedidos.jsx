import React, { useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import List from "../../../components/Lista";
import SearchBar from "../../../components/Searchbar";
import { useNavigate } from "react-router-dom";

import {
  IconoLupa,
  IconoCalculadora,
  IconoSalir,
  IconoMas,
  IconoCerrar,
  IconoMenos
} from "../../../components/Icons";

import { getColor } from "../../../components/Colors";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

// Mapea la respuesta del API a la estructura interna del componente
const mapProductoFromAPI = (p) => ({
  id:               p.id_producto,
  nombre:           p.nombre          || "",
  categoria:        p.categorias_productos?.nombre || "",
  marca:            p.marcas?.nombre   || "",
  inventario:       p.stock_actual     ?? 0,
  inventarioMinimo: p.stock_minimo     ?? 0,
  inventarioMaximo: null,               // no existe en la BD
  precio:           Number(p.precio_compra ?? 0),
});

export default function NuevosPedidos({
  usuario,
  onNavegar,
  onLogout
}) {

  const navigate = useNavigate();

  // CANTIDAD
  const [cantidad, setCantidad] = useState(1);

  // PRODUCTO SELECCIONADO (ya mapeado al formato interno)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // PRODUCTOS EN ORDEN
  const [ordenCompra, setOrdenCompra] = useState([]);

  //MODAL REGISTRAR NUEVO PRODUCTO
  const [mostrarModal, setMostrarModal] =useState(false);

  // AÑADIR A ORDEN
  // Se agrega un _uid único por fila para poder identificar y eliminar
  // incluso si el mismo producto se añade más de una vez
  const agregarAOrden = () => {
    if (!productoSeleccionado) return;

    const subtotal = productoSeleccionado.precio * cantidad;

    const nuevoProducto = {
      ...productoSeleccionado,
      cantidad,
      subtotal,
      _uid: Date.now() + Math.random(), // clave única por entrada
    };

    setOrdenCompra((prev) => [...prev, nuevoProducto]);
    setCantidad(1);
  };

  // ELIMINAR DE ORDEN
  const eliminarDeOrden = (uid) => {
    setOrdenCompra((prev) => prev.filter((item) => item._uid !== uid));
  };

  // TOTAL
  const totalEstimado = useMemo(() => {
    return ordenCompra.reduce((acc, item) => acc + item.subtotal, 0);
  }, [ordenCompra]);

  // COLUMNAS TABLA
  const columns = [
    {
      key: "id",
      label: "ID",
      width: "70px"
    },
    {
      key: "nombre",
      label: "Producto"
    },
    {
      key: "categoria",
      label: "Categoría"
    },
    {
      key: "marca",
      label: "Marca"
    },
    {
      key: "inventario",
      label: "Inventario"
    },
    {
      key: "cantidad",
      label: "Cantidad"
    },
    {
      key: "precio",
      label: "Último Precio",
      render: (item) =>
        item.precio.toLocaleString("es-PY")
    },
    {
      key: "subtotal",
      label: "Subtotal estimado",
      render: (item) =>
        item.subtotal.toLocaleString("es-PY")
    },
    {
      key: "acciones",
      label: "",
      width: "90px",
      render: (item) => (
        <div style={styles.accionesCell}>
          {/* Botón lupa (ver detalle) */}
          <button
            style={styles.iconButton}
            title="Ver detalle"
            onClick={(e) => {
              e.stopPropagation();
              // 
            }}
          >
          <button
            onClick={() => navigate("/compras/pedidos/1")}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer"
            }}
           > 
            <IconoLupa />
          </button>
          </button>

          {/* Botón eliminar fila */}
          <button
            style={styles.iconButtonRojo}
            title="Eliminar de la orden"
            onClick={(e) => {
              e.stopPropagation();
              eliminarDeOrden(item._uid);
            }}
          >
            <IconoMenos />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={styles.pagina}>

      {/* SIDEBAR */}
      <Sidebar
        usuario={usuario}
        onNavegar={onNavegar}
        onLogout={onLogout}
      />

      {/* CONTENIDO */}
      <main style={styles.contenido}>

        {/* HEADER */}
        <header style={styles.encabezado}>

          <button
            onClick={() => onNavegar("pedidos")}
            style={styles.botonVolver}
          >
            <IconoSalir />
          </button>

          <div style={{ flex: 1 }}>
            <h1 style={styles.titulo}>Nuevo Pedido</h1>
            <div style={styles.separador} />
          </div>

        </header>

        {/* CARD SUPERIOR */}
        <div style={styles.card}>

          {/* TITULO */}
          <div style={styles.cardTitulo}>
            <IconoMas />
            <span>Añadir producto</span>
          </div>

          {/* CONTROLES */}
          <div style={styles.controles}>

            {/* ── BARRA DE BÚSQUEDA EN TIEMPO REAL ── */}
            {/* fetchOnMount=true pre-carga todos los productos al abrir la pantalla */}
            <SearchBar
              apiUrl={`${API_BASE}/misc/productos`}
              queryParam="search"
              placeholder="Buscar producto ..."
              fetchOnMount={true}
              onSelect={(rawItem) => {
                setProductoSeleccionado(mapProductoFromAPI(rawItem));
              }}
              onClear={() => {
                setProductoSeleccionado(null);
              }}
              getLabel={(item) => item?.nombre || ""}
              renderOption={(item) => (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>
                    {item.nombre}
                  </span>
                  <span style={{ fontSize: 12, color: "#888" }}>
                    {item.categorias_productos?.nombre ?? "—"}
                    {" · "}
                    {item.marcas?.nombre ?? "—"}
                    {" · Stock: "}
                    {item.stock_actual ?? 0}
                  </span>
                </div>
              )}
              style={{ flex: 1, minWidth: 250 }}
            />

            {/* CANTIDAD */}
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

            {/* BOTON AÑADIR */}
            <button
              onClick={agregarAOrden}
              style={styles.botonAgregar}
            >
              Añadir a la Orden
            </button>

            {/* REGISTRAR */}
            <button 
              style={styles.botonSecundario}
              onClick={() => setMostrarModal(true)}
            >
              Registrar Nuevo Producto
            </button>

          </div>

          {/* INFO PRODUCTO */}
          <div style={styles.infoProducto}>

            {/* ICONO */}
            <div style={styles.iconoContainer}>
              <IconoCalculadora />
            </div>

            {/* DATOS */}
            <div style={styles.infoGrid}>

              <div><strong>Nombre:</strong></div>
              <div>{productoSeleccionado?.nombre || "-"}</div>

              <div><strong>Último precio:</strong></div>
              <div>
                {productoSeleccionado
                  ? productoSeleccionado.precio.toLocaleString("es-PY")
                  : "-"}
              </div>

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

          <List
            data={ordenCompra}
            columns={columns}
            selectable={false}
            controls={[
              {
                type: "search",
                placeholder: "Buscar producto..."
              },
              {
                type: "select",
                placeholder: "Ordenar por",
                options: [
                  { key: "default", label: "Por defecto" }
                ]
              }
            ]}
          />

          {/* FOOTER */}
          <div style={styles.footer}>
            <h2>
              Costo total estimado:{" "}
              {totalEstimado.toLocaleString("es-PY")}
            </h2>
            <button style={styles.botonGuardar}>Guardar</button>
          </div>

        </div>

        {/* MODAL */}
        {mostrarModal && (

          <div style={styles.modalOverlay}>

            <div style={styles.modal}>

            {/* HEADER */}
            <div style={styles.modalHeader}>

              <h2 style={styles.modalTitulo}>
                Producto
              </h2>

              <button
                onClick={() => setMostrarModal(false)}
                style={styles.botonCerrar}
              >
                <IconoCerrar/>
              </button>

            </div>

            {/* CONTENIDO */}
            <div style={styles.modalContenido}>

              {/* IZQUIERDA */}
              <div style={styles.modalIzquierda}>

                <div style={styles.imagenProducto}>
                  <IconoCalculadora />
                </div>

                <h2>
                  Neumático Pirelli
                </h2>

              </div>

              {/* DERECHA */}
              <div style={styles.modalDerecha}>

                <div style={styles.formGroup}>
                  <label>
                    Categoría del Producto:
                  </label>

                  <input
                    defaultValue="Neumático de pista"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label>
                    Marca del Neumático:
                  </label>

                  <input
                    defaultValue="Pirelli"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label>
                    Último Precio:
                  </label>

                  <input
                    defaultValue="1.200.000"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label>
                    Inventario Mínimo:
                  </label>

                  <input
                    defaultValue="10"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label>
                    Inventario Máximo:
                  </label>

                  <input
                    defaultValue="250"
                  />
                </div>

              </div>

            </div>

            {/* FOOTER */}
            <div style={styles.modalFooter}>

              <h2 style={{
                textAlign: "center"
              }}>
                
                "Se le enviará un pedido de cotización
                a los siguientes proveedores:
                <br />
                Rust-eze, Dinoco, HTB, NFU2"
              </h2>

              <div style={styles.modalBotones}>

                <button style={styles.botonAgregar}>
                  Confirmar
                </button>

                <button
                  style={styles.botonSecundario}
                  onClick={() => setMostrarModal(false)}
                >
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

  pagina: {
    display: "flex",
    minHeight: "100vh",
    background: "#ffffff",
  },

  contenido: {
    flex: 1,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  encabezado: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },

  botonVolver: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },

  titulo: {
    fontSize: 42,
    fontWeight: 700,
    margin: 0,
    textAlign: "center",
    fontFamily: "Lato",
  },

  separador: {
    height: 4,
    background: "#000",
    marginTop: 10,
  },

  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #000000",
  },

  cardTitulo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 20,
  },

  controles: {
    display: "flex",
    gap: 15,
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
  },

  cantidadContainer: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  inputCantidad: {
    width: 80,
    padding: 8,
  },

  botonAgregar: {
    background: getColor("amarillo"),
    border: "1px solid #000",
    borderRadius: 20,
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  botonSecundario: {
    background: "#ffffff",
    border: "1px solid #000000",
    borderRadius: 20,
    padding: "10px 20px",
    cursor: "pointer",
  },

  infoProducto: {
    background: getColor("gris-claro"),
    borderRadius: 16,
    padding: 20,
    display: "flex",
    gap: 30,
    alignItems: "center",
  },

  iconoContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    background: "#FFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  infoGrid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    rowGap: 15,
    columnGap: 30,
    alignItems: "center",
  },

  cardTabla: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #000000",
  },

  subtitulo: {
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Lato",
  },

  footer: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  botonGuardar: {
    background: getColor("amarillo"),
    border: "1px solid #000",
    borderRadius: 20,
    padding: "10px 30px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  // Contenedor de los dos botones de acción en cada fila
  accionesCell: {
    display: "flex",
    gap: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  // Botón lupa (amarillo estándar)
  iconButton: {
    border: "none",
    background: getColor("amarillo"),
    borderRadius: 6,
    cursor: "pointer",
    padding: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Botón eliminar (rojo)
  iconButtonRojo: {
    border: "none",
    background: getColor("negro"),
    borderRadius: 6,
    cursor: "pointer",
    padding: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    width: "80%",
    maxWidth: 900,
    background: "#ffffff",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0px 4px 20px rgba(0,0,0,0.4)",
  },

  modalHeader: {
    background: getColor("amarillo"),
    padding: "20px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalTitulo: {
    margin: 0,
    fontSize: 40,
    fontWeight: "bold",
  },

  botonCerrar: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },

  modalContenido: {
    display: "flex",
    gap: 40,
    padding: 40,
  },

  modalIzquierda: {
    width: 250,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },

  imagenProducto: {
    width: 180,
    height: 180,
    background: "#ffffff",
    boxShadow: "0px 4px 20px rgba(0,0,0,0.4)",
    borderRadius: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalDerecha: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  formGroup: {
    display: "grid",
    gridTemplateColumns: "250px 1fr",
    alignItems: "center",
    gap: 20,
  },

  modalFooter: {
    padding: 30,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  modalBotones: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 20,
  },


};

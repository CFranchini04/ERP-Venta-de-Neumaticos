import React, { useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import List from "../../../components/Lista";

import {
  IconoLupa,
  IconoCalculadora,
  IconoFlecha,
  IconoMas
} from "../../../components/Icons";

import { getColor } from "../../../components/Colors";

export default function NuevosPedidos({
  usuario,
  onNavegar,
  onLogout
}) {

  // BUSCADOR PRODUCTO
  const [busquedaProducto, setBusquedaProducto] = useState("");

  // CANTIDAD
  const [cantidad, setCantidad] = useState(1);

  // PRODUCTO SELECCIONADO
  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null);

  // PRODUCTOS EN ORDEN
  const [ordenCompra, setOrdenCompra] = useState([]);

  // PRODUCTOS DISPONIBLES
  const productos = [
    {
      id: "01",
      nombre: "Neumático Nieve",
      categoria: "Calle",
      marca: "Good Year",
      inventario: 360,
      inventarioMinimo: 50,
      inventarioMaximo: 500,
      precio: 1350000
    },
    {
      id: "02",
      nombre: "Neumático Liso",
      categoria: "Pista",
      marca: "Pirelli",
      inventario: 25,
      inventarioMinimo: 10,
      inventarioMaximo: 100,
      precio: 2000000
    },
    {
      id: "03",
      nombre: "Neumático Blando",
      categoria: "Pista",
      marca: "Continental",
      inventario: 81,
      inventarioMinimo: 15,
      inventarioMaximo: 120,
      precio: 850000
    },
    {
      id: "04",
      nombre: "Neumático Medio",
      categoria: "Pista",
      marca: "Bridgestone",
      inventario: 35,
      inventarioMinimo: 10,
      inventarioMaximo: 80,
      precio: 5300000
    }
  ];

  // FILTRO PRODUCTOS
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(
      busquedaProducto.toLowerCase()
    )
  );

  // AÑADIR A ORDEN
  const agregarAOrden = () => {

    if (!productoSeleccionado) return;

    const subtotal =
      productoSeleccionado.precio * cantidad;

    const nuevoProducto = {
      ...productoSeleccionado,
      cantidad,
      subtotal
    };

    setOrdenCompra((prev) => [...prev, nuevoProducto]);

    setCantidad(1);
  };

  // TOTAL
  const totalEstimado = useMemo(() => {

    return ordenCompra.reduce((acc, item) => {
      return acc + item.subtotal;
    }, 0);

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
      width: "60px",
      render: () => (
        <button style={styles.iconButton}>
          <IconoLupa />
        </button>
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
            <IconoFlecha />
          </button>

          <div style={{ flex: 1 }}>

            <h1 style={styles.titulo}>
              Nuevo Pedido
            </h1>

            <div style={styles.separador} />

          </div>

        </header>

        {/* CARD SUPERIOR */}
        <div style={styles.card}>

          {/* TITULO */}
          <div style={styles.cardTitulo}>

            <IconoMas />

            <span>
              Añadir producto
            </span>

          </div>

          {/* CONTROLES */}
          <div style={styles.controles}>

            {/* BUSCADOR */}
            <input
              placeholder="Buscar producto ..."
              value={busquedaProducto}
              onChange={(e) => {

                const texto = e.target.value;

                setBusquedaProducto(texto);

                const encontrado = productos.find((p) =>
                  p.nombre.toLowerCase().includes(
                    texto.toLowerCase()
                  )
                );

                setProductoSeleccionado(
                  encontrado || null
                );
              }}
              style={styles.inputBusqueda}
            />

            {/* CANTIDAD */}
            <div style={styles.cantidadContainer}>

              <span>
                Cantidad para añadir:
              </span>

              <input
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) =>
                  setCantidad(Number(e.target.value))
                }
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
            <button style={styles.botonSecundario}>
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

              <div>
                <strong>Nombre:</strong>
              </div>

              <div>
                {productoSeleccionado?.nombre || "-"}
              </div>

              <div>
                <strong>Último precio:</strong>
              </div>

              <div>
                {productoSeleccionado
                  ? productoSeleccionado.precio.toLocaleString("es-PY")
                  : "-"}
              </div>

              <div>
                <strong>Categoría:</strong>
              </div>

              <div>
                {productoSeleccionado?.categoria || "-"}
              </div>

              <div>
                <strong>Inventario mínimo:</strong>
              </div>

              <div>
                {productoSeleccionado?.inventarioMinimo || "-"}
              </div>

              <div>
                <strong>Marca:</strong>
              </div>

              <div>
                {productoSeleccionado?.marca || "-"}
              </div>

              <div>
                <strong>Inventario máximo:</strong>
              </div>

              <div>
                {productoSeleccionado?.inventarioMaximo || "-"}
              </div>

            </div>

          </div>

        </div>

        {/* ORDEN DE COMPRA */}
        <div style={styles.cardTabla}>

          <h2 style={styles.subtitulo}>
            Orden de Compra
          </h2>

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
                  {
                    key: "default",
                    label: "Por defecto"
                  }
                ]
              }
            ]}
          />

          {/* FOOTER */}
          <div style={styles.footer}>

            <h2>
              Costo total estimado:
              {" "}
              {totalEstimado.toLocaleString("es-PY")}
            </h2>

            <button style={styles.botonGuardar}>
              Guardar
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

const styles = {

  pagina: {
    display: "flex",
    minHeight: "100vh",
    background: "#F5F5F5",
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

  inputBusqueda: {
    flex: 1,
    minWidth: 250,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #000000",
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

  iconButton: {
    border: "none",
    background: getColor("amarillo"),
    borderRadius: 4,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
};

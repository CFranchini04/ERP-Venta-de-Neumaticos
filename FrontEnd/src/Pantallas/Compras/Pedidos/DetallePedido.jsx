import React, { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import List from "../../../components/Lista";

import {
  IconoEditar,
  IconoSalir
} from "../../../components/Icons";

import { getColor } from "../../../components/Colors";

export default function DetallePedido({
  usuario,
  onNavegar,
  onLogout
}) {

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("");

  const productos = [
    {
      id: "01",
      producto: "Neumático Nieve",
      categoria: "Calle",
      marca: "Good Year",
      inventario: 360,
      cantidad: 100,
      precio: "1.350.000",
      subtotal: "135.000.000"
    },
    {
      id: "02",
      producto: "Neumático Liso",
      categoria: "Pista",
      marca: "Pirelli",
      inventario: 25,
      cantidad: 20,
      precio: "2.000.000",
      subtotal: "40.000.000"
    },
    {
      id: "03",
      producto: "Neumático Blando",
      categoria: "Pista",
      marca: "Continental",
      inventario: 81,
      cantidad: 50,
      precio: "850.000",
      subtotal: "42.500.000"
    },
    {
      id: "04",
      producto: "Neumático Medio",
      categoria: "Pista",
      marca: "Bridgestone",
      inventario: 35,
      cantidad: 35,
      precio: "5.300.000",
      subtotal: "450.500.000"
    }
  ];

  const columns = [
    { key: "id", label: "" },
    { key: "producto", label: "Producto" },
    { key: "categoria", label: "Categoría" },
    { key: "marca", label: "Marca" },
    { key: "inventario", label: "Inventario" },
    { key: "cantidad", label: "Cantidad" },
    {
      key: "precio",
      label: "Precio",
      render: (item) => (
        <span style={{ color: "#2BA84A" }}>
          {item.precio}
        </span>
      )
    },
    { key: "subtotal", label: "Subtotal estimado" },
    {
      key: "acciones",
      label: "",
      render: () => (
        <button style={styles.botonAccion}>
          <IconoEditar />
        </button>
      )
    }
  ];

  return (
    <div style={styles.pagina}>

      <Sidebar
        usuario={usuario}
        onNavegar={onNavegar}
        onLogout={onLogout}
      />

      <main style={styles.contenido}>

        {/* HEADER */}
        <div style={styles.header}>

          <button
            onClick={() => onNavegar("pedidos")}
            style={styles.botonVolver}
          >
            <IconoSalir />
          </button>

          <div style={{ flex: 1 }}>
            <h1 style={styles.titulo}>
              Pedidos
            </h1>

            <div style={styles.linea} />
          </div>

        </div>

        {/* INFORMACION */}
        <div style={styles.card}>

          <h2 style={styles.subtitulo}>
            Información del Pedido
          </h2>

          <div style={styles.infoContainer}>

            <div>
              <strong>Codigo pedido:</strong> PED_004
            </div>

            <div>
              <strong>Estado:</strong> Lista
            </div>

            <div>
              <strong>Fecha de creación:</strong> 05/04/2026
            </div>

          </div>

        </div>

        {/* TABS */}
        <div style={styles.tabs}>

          <div style={styles.tabActiva}>
            Detalle del pedido
          </div>

          <div style={styles.tab}>
            Cotizaciones del pedido
          </div>

        </div>

        {/* TABLA */}
        <div style={styles.cardTabla}>

          <List
            data={productos}
            columns={columns}
            controls={[
              {
                type: "search",
                placeholder: "Buscar producto ...",
                value: busqueda,
                onChange: (e) => setBusqueda(e.target.value)
              },
              {
                type: "select",
                placeholder: "Ordenar por",
                value: orden,
                onChange: (e) => setOrden(e.target.value),
                options: [
                  {
                    key: "default",
                    label: "Por defecto"
                  }
                ]
              }
            ]}
          />

          <div style={styles.footer}>

            <h2>
              Costo total estimado:
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
    background: "#F5F5F5"
  },

  contenido: {
    flex: 1,
    padding: 20,
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 20
  },

  botonVolver: {
    border: "none",
    background: "transparent",
    cursor: "pointer"
  },

  titulo: {
    textAlign: "center",
    fontSize: 42,
    margin: 0,
    fontFamily: "Lato"
  },

  linea: {
    height: 4,
    background: "#000",
    marginTop: 10
  },

  card: {
    background: "#FFF",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #000000",
    marginBottom: 20,
    boxShadow: "0px 1px 4px rgba(0,0,0,0.2)"
  },

  subtitulo: {
    textAlign: "center",
    marginBottom: 20
  },

  infoContainer: {
    display: "flex",
    justifyContent: "space-between",
    background: "#ffffff",
    border: "1px solid #000",
    borderRadius: 12,
    padding: 20
  },

  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    marginBottom: 10
  },

  tabActiva: {
    background: getColor("blanco"),
    padding: 12,
    textAlign: "center",
    boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottom: `3px solid ${getColor("amarillo")}`,
    fontWeight: "bold"
  },

  tab: {
    background: getColor("gris-claro"),
    padding: 12,
    textAlign: "center",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },

  cardTabla: {
    borderRadius: 16,
    padding: 20,
    background: "#ffffff",
    boxShadow: "0px 4px 20px rgba(0,0,0,0.4)",
    borderRadius: 12,
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20
  },

  botonGuardar: {
    background: getColor("amarillo"),
    border: "1px solid #000",
    borderRadius: 999,
    padding: "10px 30px",
    cursor: "pointer",
    fontWeight: "bold"
  },

  botonAccion: {
    border: "none",
    background: getColor("amarillo"),
    borderRadius: 6,
    cursor: "pointer",
    padding: 4
  }
};

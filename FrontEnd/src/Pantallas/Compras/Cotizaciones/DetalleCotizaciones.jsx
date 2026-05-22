import React, { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import List from "../../../components/Lista"
import CargarCotizacionModal from "./CargarCotizacionModal";

import { getColor } from "../../../components/Colors";

import {
  IconoFlecha
} from "../../../components/Icons";

export default function DetalleCotizacion({
  usuario,
  onNavegar,
  onLogout
}) {

  
  const { codigo } = useParams();
  const navigate = useNavigate();
  const { id } = useParams();

  const [busquedaCot, setBusquedaCot] = useState("");
  const [ordenCot, setOrdenCot] = useState("default");
  const [mostrarModalCotizacion, setMostrarModalCotizacion] = useState(false);

    const cotizaciones = [
    {
      id: "PED_COT_0290",
      producto: "Neumático Nieve",
      proveedor: "Rusteeze",
      estado: "Pendiente",
      cantidad: 76,
      precio: "1.350.000",
      subtotal: "102.600.000"
    },
    {
      id: "PED_COT_0291",
      producto: "Neumático Liso",
      proveedor: "Dinoco",
      estado: "Pendiente",
      cantidad: 20,
      precio: "2.000.000",
      subtotal: "40.000.000"
    }
  ];

  const cotizacionesFiltradas = cotizaciones.filter((c) =>
    c.producto.toLowerCase().includes(busquedaCot.toLowerCase())
  );

  const columnsCotizaciones = [
    { key: "id", label: "Código" },
    { key: "producto", label: "Producto" },
    { key: "proveedor", label: "Proveedor" },
    { key: "estado", label: "Estado" },
    { key: "cantidad", label: "Cantidad" },
    { key: "precio", label: "Precio" },
    { key: "subtotal", label: "Subtotal" }
  ];


  return (
    <div style={ styles.pagina}>

      <Sidebar
        usuario={usuario}
        onNavegar={onNavegar}
        onLogout={onLogout}
      />

      <main style={styles.contenido}>

        {/* HEADER */}
        <div style={styles.header}>

          <button
            onClick={() => navigate("/compras/cotizaciones")}
            style={styles.botonVolver}
            title="Volver a cotizaciones"
          >
            <IconoFlecha />
          </button>

          <div style={{ flex: 1 }}>

            <h1 style={styles.titulo}>
              Cotización {id}
            </h1>

            <div style={styles.linea} />

          </div>

        </div>

        {/* CARD */}
        <div style={styles.card}>

          <h2 style={styles.subtitulo}>
            Detalle de Cotización
          </h2>

          <div style={styles.infoContainer}>

            <div>
              <strong>Código:</strong> {id}
            </div>

            <div>
              <strong>Estado:</strong> Lista
            </div>

            <div>
              <strong>Fecha:</strong> 05/04/2026
            </div>

          </div>

        </div>

        {/* TABLA */}
        <div style={styles.cardTabla}>

          <List
            data={cotizacionesFiltradas}
            columns={columnsCotizaciones}
            controls={[
              {
                type: "search",
                placeholder: "Buscar cotización...",
                value: busquedaCot,
                onChange: (e) => setBusquedaCot(e.target.value)
              },
              {
                type: "select",
                label: "Ordenar por",
                value: ordenCot,
                onChange: (e) => setOrdenCot(e.target.value),
                options: [
                  {
                    key: "default",
                    label: "Por defecto"
                  }
                ]
              },
              {
                type: "button",
                label: "Cargar Cotización",
                onClick: () => setMostrarModalCotizacion(true)
              }
            ]}
          />

          <div style={styles.footer}>

            <h2>
              Costo total:
            </h2>

            <button style={styles.botonGuardar}>
              Generar Orden de Compra
            </button>

          </div>

        </div>

            <CargarCotizacionModal
              open={mostrarModalCotizacion}
              onClose={() => setMostrarModalCotizacion(false)}
              productos={cotizaciones}
              proveedores={[
                { id: 1, nombre: "Dinoco" },
                { id: 2, nombre: "Rusteeze" }
              ]}
              onGuardar={(data) => {
                console.log(data);
              }}
            />

      </main>

    </div>
  );
}

const styles = {
    botonVolver: {
        border: "none", background: "transparent", cursor: "pointer",
        transform: "rotate(270deg)", display: "flex", alignItems: "center",
    },

    pagina: {
        display: "flex",
        minHeight: "100vh",
        background: "#ffffff"
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
        background: "#ffffff",
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

    cardTabla: {
        borderRadius: 16,
        padding: 20,
        background: "#ffffff",
        boxShadow: "0px 4px 20px rgba(0,0,0,0.4)",
    },

    footer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
    },

    botonGuardar: {
        background: getColor("amarillo"),
        border: "1px solid #000000",
        borderRadius: 999,
        padding: "10px 30px",
        cursor: "pointer",
        fontWeight: "bold"
 }

 };

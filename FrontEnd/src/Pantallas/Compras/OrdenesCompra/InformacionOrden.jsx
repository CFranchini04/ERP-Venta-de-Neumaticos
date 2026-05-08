import React, { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import { Button } from "../../../components/Buttons";
import { getColor } from "../../../components/Colors";
import List from "../../../components/Lista";
import { IconoLupa } from "../../../components/Icons";

const SUPABASE_URL = "https://ufpvebypnhcbvgyrkzrw.supabase.co";
const SUPABASE_KEY = "sb_publishable_3zNPvTHmiYmwG-BMVDDk9g_KZ_li66L";

export default function InformacionOrden({
    usuario,
    orden,
    onVolver,
    onLogout,
    onNavegar
}) {
    const [tabActiva, setTabActiva] = useState("detalle");

    if (!orden) {
        return <div>No hay orden seleccionada</div>;
    }

    const columns = [
        { key: "producto", label: "Producto" },
        { key: "categoria", label: "Categoría" },
        { key: "marca", label: "Marca" },
        { key: "estado", label: "Estado" },
        { key: "cantidad", label: "Cantidad" },
        { key: "precio", label: "Precio" },
        { key: "total", label: "Total" },
        {
            key: "acciones",
            label: "Acciones",
            render: (pedido) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("Ver detalle:", pedido);
                    }}
                    style={styles.botonAccion}
                >
                    <IconoLupa />
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

                <header style={styles.encabezado}>
                    <h1 style={styles.titulo}>Ordenes de Compra</h1>
                    <div style={styles.separador} />
                </header>

                {/* INFORMACIÓN GENERAL */}
                <div style={styles.contenedorEncabezado}>
                    <h3 style={styles.subtitulo}>Información de la Orden</h3>

                    <div style={styles.subcontenedor}>
                        <div style={styles.item}>
                            <strong>Código:</strong> {orden.codigo}
                        </div>

                        <div style={styles.item}>
                            <strong>Estado:</strong> {orden.estado}
                        </div>

                        <div style={styles.item}>
                            <strong>Fecha:</strong> {orden.fecha}
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div style={styles.detalle}>

                    <div style={styles.tabs}>
                        <button
                            onClick={() => setTabActiva("detalle")}
                            style={{
                                ...styles.tabButton,
                                background: tabActiva === "detalle"
                                    ? getColor("amarillo")
                                    : "#EAEAEA"
                            }}
                        >
                            Detalle de Orden
                        </button>

                        <button
                            onClick={() => setTabActiva("facturas")}
                            style={{
                                ...styles.tabButton,
                                background: tabActiva === "facturas"
                                    ? getColor("amarillo")
                                    : "#EAEAEA"
                            }}
                        >
                            Facturas
                        </button>
                    </div>

                    {tabActiva === "detalle" && (
                        <List
                            data={orden.detalle || []}
                            columns={columns}
                        />
                    )}

                    {tabActiva === "facturas" && (
                        <div style={styles.facturasContainer}>
                            No hay facturas disponibles
                        </div>
                    )}

                </div>

                <Button
                    label="Volver"
                    onClick={onVolver}
                    variant="amarillo"
                />

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
        padding: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
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
        color: "#000",
        fontSize: 42,
        fontFamily: "Lato, sans-serif",
        fontWeight: 700,
        margin: 0,
        textAlign: "center",
    },

    separador: {
        width: "min(1100px, 80%)",
        height: 4,
        background: "#000",
    },

    contenedorEncabezado: {
        width: "100%",
        maxWidth: 900,
        border: "2px solid #000",
        borderRadius: 8,
        padding: 20,
        background: getColor("blanco"),
        boxSizing: "border-box",
    },

    subtitulo: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
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
    },

    detalle: {
        width: "100%",
        maxWidth: 900,
        border: "2px solid #000",
        borderRadius: 8,
        padding: 20,
        background: getColor("blanco"),
        boxSizing: "border-box",
    },

    tabs: {
        display: "flex",
        gap: 10,
        marginBottom: 20,
    },

    tabButton: {
        padding: "10px 18px",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: "bold",
    },

    facturasContainer: {
        padding: 20,
        border: "1px solid #CCC",
        borderRadius: 8,
        background: "#F9F9F9",
    },

    botonAccion: {
        background: getColor("amarillo"),
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        padding: 6,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
};

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { Button } from "../../../components/Buttons";
import { getColor } from "../../../components/Colors";
import List from "../../../components/Lista";
import { IconoLupa } from "../../../components/Icons";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function InformacionOrden({
    usuario,
    orden,
    onVolver,
    onLogout,
    onNavegar
}) {
    const [tabActiva, setTabActiva] = useState("detalle");
    const [ordenCompleta, setOrdenCompleta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [orderBy, setOrderBy] = useState("");

    const { id: idParam } = useParams();
    const idOrden = orden?.id_orden ?? orden?.id ?? idParam;

    function handleNuevo() {
        console.log("Nuevo pedido");
    }

    useEffect(() => {
        const cargarOrden = async () => {
            if (!idOrden) return;

            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${API_BASE}/compras/ordenes-compra/${idOrden}`);
                const dataOrden = await response.json();

                if (!response.ok) throw new Error(dataOrden.message || "No se pudo cargar la orden");

                setOrdenCompleta({
                    ...dataOrden.orden,
                    detalle: dataOrden.orden?.detalle || [],
                    facturas: dataOrden.orden?.facturas || []
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        cargarOrden();
    }, [idOrden]);

    const ordenActual = ordenCompleta || orden;

    const columnsDetalle = [
        { key: "producto", label: "Producto", width: "17%" },
        { key: "categoria", label: "Categoría", width: "18%" },
        { key: "marca", label: "Marca", width: "12%" },
        { key: "estado", label: "Estado", width: "10%" },
        { key: "cantidad", label: "Cantidad", width: "10%" },
        { key: "precio", label: "Precio", width: "12%" },
        { key: "total", label: "Total", width: "12%" },
        {
            key: "acciones",
            label: "Acciones",

            render: (pedido) => (
                <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log("Ver detalle:", pedido);
                        }}
                        style={styles.botonAccion}
                    >
                        <IconoLupa />
                    </button>
                </div>
            )
        }
    ];

    const columnsFacturas = [
        { key: "codigo", label: "Código", width: "11%" },
        { key: "proveedor", label: "Proveedor", width: "20%" },
        { key: "nro_factura", label: "Nro. Factura", width: "15%" },
        { key: "fecha_emision", label: "Fecha Emisión", width: "13%" },
        { key: "fecha_vencimiento", label: "Fecha Vencimiento", width: "20%" },
        { key: "estado", label: "Estado", width: "5%" },
        { key: "importe_total", label: "Importe Total", width: "21%" }
    ];

    if (!ordenActual) {
        return <div>No hay orden seleccionada</div>;
    }

    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

            <main style={styles.contenido}>
                <header style={styles.encabezado}>
                    <h1 style={styles.titulo}>Ordenes de Compra</h1>
                    <div style={styles.separador} />
                </header>

                {error && <div style={{ color: "red", width: "100%", maxWidth: 1100 }}>{error}</div>}

                <div style={styles.contenedorEncabezado}>
                    <h3 style={styles.subtitulo}>Información de la Orden</h3>

                    <div style={styles.subcontenedor}>
                        <div style={styles.item}>
                            <strong>Código:</strong> {ordenActual.codigo ?? ordenActual.codigo_orden ?? '-'}
                        </div>

                        <div style={styles.item}>
                            <strong>Estado:</strong> {ordenActual.estado || '-'}
                        </div>

                        <div style={styles.item}>
                            <strong>Fecha:</strong> {ordenActual.fecha ?? '-'}
                        </div>
                    </div>
                </div>

                <div style={styles.detalle}>
                    <div style={styles.tabs}>
                        <button
                            onClick={() => setTabActiva("detalle")}
                            style={{
                                ...styles.tabButton,
                                background: tabActiva === "detalle" ? getColor("amarillo") : "#EAEAEA"
                            }}
                        >
                            Detalle de Orden
                        </button>

                        <button
                            onClick={() => setTabActiva("facturas")}
                            style={{
                                ...styles.tabButton,
                                background: tabActiva === "facturas" ? getColor("amarillo") : "#EAEAEA"
                            }}
                        >
                            Facturas
                        </button>
                    </div>

                    {loading && <div>Cargando información...</div>}

                    {!loading && tabActiva === "detalle" && (
                        <section style={styles.listaStyle}>
                            <List
                                data={ordenActual.detalle || []}
                                columns={columnsDetalle}
                                controls={[
                                    {
                                        type: "search",
                                        placeholder: "Buscar producto...",
                                        value: search,
                                        onChange: (e) => setSearch(e.target.value)
                                    },

                                    {
                                        type: "select",
                                        label: "Ordenar por:",
                                        placeholder: "Seleccionar",
                                        value: orderBy,
                                        onChange: (e) => setOrderBy(e.target.value),

                                        options: [
                                            { key: "producto", label: "Producto" },
                                            { key: "categoria", label: "Categoría" },
                                            { key: "marca", label: "Marca" },
                                            { key: "estado", label: "Estado" },
                                            { key: "cantidad", label: "Cantidad" },
                                            { key: "precio", label: "Precio" },
                                            { key: "total", label: "Total" },
                                        ]
                                    },
                                    
                                ]}
                                searchWidth={590}
                            />

                        </section>
                    )}

                    {!loading && tabActiva === "facturas" && (
                        <section style={styles.listaStyle}>
                        <List data={ordenActual.facturas || []} 
                        columns={columnsFacturas} 
                        controls={[
                                    {
                                        type: "search",
                                        placeholder: "Buscar cotizacion...",
                                        value: search,
                                        onChange: (e) => setSearch(e.target.value)
                                    },

                                    {
                                        type: "select",
                                        label: "Ordenar por:",
                                        placeholder: "Seleccionar",
                                        value: orderBy,
                                        onChange: (e) => setOrderBy(e.target.value),

                                        options: [
                                            { key: "codigo", label: "Código", width: "11%" },
                                            { key: "proveedor", label: "Proveedor" },
                                            { key: "nro_factura", label: "Nro. Factura" },
                                            { key: "fecha_emision", label: "Fecha Emisión" },
                                            { key: "fecha_vencimiento", label: "Fecha Vencimiento" },
                                            { key: "estado", label: "Estado" },
                                            { key: "importe_total", label: "Importe Total" },
                                        ]
                                    },
                                    {
                                        type: "button",
                                        label: "Cargar Facturas",
                                        onClick: handleNuevo
                                    }
                                ]}
                                searchWidth={500}
                            />

                        </section>

                    )}
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
        maxWidth: 1100,
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
        maxWidth: 1100,
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
        width: 500,
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
    listaStyle: {
        width: '100%',
        maxWidth: 1100,
        textAlign: 'left',
    },
    row: {
        display: "grid",
        padding: 10,
        alignItems: "center",
        textAlign: "center"
    }
};

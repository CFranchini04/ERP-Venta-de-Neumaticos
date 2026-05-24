import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { Button } from "../../../components/Buttons";
import { getColor } from "../../../components/Colors";
import List from "../../../components/Lista";
import { IconoLupa } from "../../../components/Icons";
import fetchConToken from "../../../token";

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

    useEffect(() => {
        const cargarOrden = async () => {
            if (!idOrden) return;

            try {
                setLoading(true);
                setError("");

                const response = await fetchConToken(`${API_BASE}/compras/ordenes-compra/${idOrden}`);
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
        { key: "estado", label: "Estado" },
        { key: "importe_total", label: "Importe Total" }
    ];

    if (!ordenActual) return <div>No hay orden seleccionada</div>;

    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

            <main style={styles.contenido}>
                <header style={styles.encabezado}>
                    <h1 style={styles.titulo}>Ordenes de Compra</h1>
                    <div style={styles.separador} />
                </header>

                {error && <div style={{ color: "red" }}>{error}</div>}

                {/* INFO */}
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

                        <div style={styles.item}>
                            <strong>Proveedor:</strong> {ordenActual.proveedor ?? '-'}
                        </div>
                    </div>
                </div>

                {/* DETALLE */}
                <div style={styles.detalle}>

                    {/* TABS (solo estilo cambiado, lógica intacta) */}
                    <div style={styles.tabs}>
                        <div
                            onClick={() => setTabActiva("detalle")}
                            style={tabActiva === "detalle" ? styles.tabActiva : styles.tab}
                        >
                            Detalle de Orden
                        </div>

                        <div
                            onClick={() => setTabActiva("facturas")}
                            style={tabActiva === "facturas" ? styles.tabActiva : styles.tab}
                        >
                            Facturas
                        </div>
                    </div>

                    {loading && <div>Cargando...</div>}

                    {/* 🔥 LIST CON CONTROLES RESTAURADOS */}
                    {!loading && tabActiva === "detalle" && (
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
                                    onChange: (e) => setSearch(e.target.value)
                                },
                                {
                                    type: "select",
                                    label: "Ordenar por:",
                                    placeholder: "Seleccionar",
                                    value: orderBy,
                                    onChange: (e) => setOrderBy(e.target.value),
                                    options: [
                                        { key: "codigo", label: "Código" },
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
                                    onClick: () => console.log("Nuevo")
                                }
                            ]}
                        />
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
        textAlign: "center",
    },
    titulo: {
        fontSize: 42,
        fontFamily: "Lato",
        margin: 0,
    },
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

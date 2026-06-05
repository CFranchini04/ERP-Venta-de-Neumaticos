import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../../components/Sidebar";
import Lista from "../../../components/Lista";
import ModalCargarFactura from "../OrdenesCompra/CargarFacturaModal"; 
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function Facturas({ usuario, onLogout, onNavegar }) {

    const [facturas, setFacturas]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState("");

    // Controles de tabla
    const [search, setSearch]               = useState("");
    const [orderBy, setOrderBy]             = useState("");
    const [filtroFactura, setFiltroFactura] = useState("");

    // Modal
    const [modalAbierto, setModalAbierto]   = useState(false);
    const [ordenModal, setOrdenModal]       = useState(null);

    // ─── Columnas de la tabla ────────────────────────────────────────────────
    const columns = [
        { key: "codigo",      label: "Código" },
        { key: "ordenCompra", label: "Código Orden de Compra" },
        { key: "proveedor",   label: "Proveedor" },
        { key: "fecha",       label: "Fecha de Emisión" },
        { key: "vencimiento", label: "Fecha de Vencimiento" },
        { key: "estado",      label: "Estado" },
    ];

    // ─── Cargar facturas desde la API ────────────────────────────────────────
    const cargarFacturas = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetchConToken(`${API_BASE}/compras/facturas/tabla`);
            if (!res.ok) throw new Error("Error al obtener las facturas");

            const data = await res.json();

            // Mapear la respuesta al formato que espera <Lista>
            const filas = (data || []).map((f) => ({
                // Guardamos el id de la orden para poder abrir el modal
                _id_orden: f.ordenes_compras?.id_orden ?? null,
                _id_factura: f.id_factura_compra ?? null,

                codigo:      f.codigo_factura ?? "-",
                ordenCompra: f.ordenes_compras?.codigo_orden ?? "-",
                proveedor:   f.proveedores?.personas
                    ? `${f.proveedores.personas.nombre ?? ""} ${f.proveedores.personas.apellido ?? ""}`.trim()
                    : "-",
                fecha:       f.fecha_emision
                    ? new Date(f.fecha_emision).toLocaleDateString("es-PY")
                    : "-",
                vencimiento: f.fecha_vencimiento
                    ? new Date(f.fecha_vencimiento).toLocaleDateString("es-PY")
                    : "-",
                estado:      f.estados?.nombre ?? "-",
            }));

            setFacturas(filas);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarFacturas();
    }, [cargarFacturas]);

    // ─── Filtrado y ordenamiento client-side ─────────────────────────────────
    const facturasFiltradas = (() => {
        let resultado = [...facturas];

        // Búsqueda libre en todas las columnas visibles
        if (search.trim()) {
            const term = search.toLowerCase();
            resultado = resultado.filter((f) =>
                Object.values(f).some((v) =>
                    String(v).toLowerCase().includes(term)
                )
            );
        }

        // Filtro por columna específica (si el usuario seleccionó algo en "Filtrar por")
        // Aquí simplemente reutilizamos el filtro como búsqueda en la columna elegida
        if (filtroFactura && search.trim()) {
            resultado = resultado.filter((f) =>
                String(f[filtroFactura] ?? "")
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        // Ordenamiento
        if (orderBy) {
            resultado.sort((a, b) =>
                String(a[orderBy] ?? "").localeCompare(String(b[orderBy] ?? ""), "es")
            );
        }

        return resultado;
    })();

    // ─── Abrir modal: necesita que la fila tenga _id_orden ──────────────────
    const handleCargarFactura = () => {
        setError("");
        // Sin fila seleccionada: abrimos el modal sin orden preseleccionada.
        // Si tu <Lista> soporta selección de fila podés pasar la orden aquí.
        // Por ahora abrimos con orden null y el modal mostrará un selector.
        setOrdenModal(null);
        setModalAbierto(true);
    };

    // ─── Callback al guardar en el modal ─────────────────────────────────────
    const handleGuardado = () => {
        cargarFacturas();   // refresca la tabla
    };

    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onLogout={onLogout} onNavegar={onNavegar} />

            <main style={styles.contenido}>
                <header style={styles.encabezado}>
                    <h1 style={styles.titulo}>Facturas</h1>
                    <div style={styles.separador} />
                </header>

                {/* Mensaje de error de carga */}
                {error && !modalAbierto && (
                    <p style={styles.errorMsg}>{error}</p>
                )}

                <section style={styles.listaStyle}>
                    <Lista
                        data={facturasFiltradas}
                        columns={columns}
                        loading={loading}
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
                                options: [
                                    { key: "codigo",      label: "Código" },
                                    { key: "ordenCompra", label: "Código Orden de Compra" },
                                    { key: "proveedor",   label: "Proveedor" },
                                    { key: "fecha",       label: "Fecha de Emisión" },
                                    { key: "vencimiento", label: "Fecha de Vencimiento" },
                                    { key: "estado",      label: "Estado" },
                                ],
                            },
                            {
                                type: "select",
                                label: "Filtrar por:",
                                placeholder: "Seleccionar",
                                value: filtroFactura,
                                onChange: (e) => setFiltroFactura(e.target.value),
                                options: [
                                    { key: "codigo",      label: "Código" },
                                    { key: "ordenCompra", label: "Código Orden de Compra" },
                                    { key: "proveedor",   label: "Proveedor" },
                                    { key: "fecha",       label: "Fecha de Emisión" },
                                    { key: "vencimiento", label: "Fecha de Vencimiento" },
                                    { key: "estado",      label: "Estado" },
                                ],
                            },
                            {
                                type: "button",
                                label: "Cargar Factura",
                                size: "lg",
                                onClick: handleCargarFactura,
                            },
                        ]}
                        searchWidth={250}
                    />
                </section>
            </main>

            {/* ── Modal Cargar Factura ── */}
            {modalAbierto && (
                <ModalCargarFactura
                    orden={ordenModal}
                    onClose={() => setModalAbierto(false)}
                    onGuardado={handleGuardado}
                />
            )}
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
        alignItems: "center",
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
        color: "#000000",
        fontSize: 42,
        fontFamily: "Lato, sans-serif",
        fontWeight: 700,
        margin: 0,
        textAlign: "center",
    },
    separador: {
        width: "min(1100px, 80%)",
        height: 4,
        background: "#000000",
    },
    listaStyle: {
        width: "100%",
    },
    errorMsg: {
        color: "red",
        fontSize: 14,
        margin: "8px 0",
    },
};
import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import Lista from "../../../components/Lista";
import { IconoLupa, IconoCompras } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token"; // igual que en Pedidos

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

function mapProveedor(p) {
    const persona = p.personas ?? {};
    return {
        id_proveedor: p.id_proveedor,
        proveedor: [persona.nombre, persona.apellido].filter(Boolean).join(" ") || "—",
        ruc: persona.ruc ?? "—",
        ubicacion: persona.direccion ?? "—",
        telefono: persona.telefono ?? "—",
        entrega: p.plazo ?? "—",
        email: persona.correo ?? "",
        direccion: persona.direccion ?? "",
        tipoProveedor: persona.tipo_persona ?? "",
        fechaNacimiento: persona.fecha_nacimiento ?? "",
        nombre: persona.nombre ?? "",
        apellido: persona.apellido ?? "",
    };
}

const proveedorVacio = {
    id_proveedor: null,
    proveedor: "", ruc: "", ubicacion: "", telefono: "",
    entrega: "", email: "", direccion: "", tipoProveedor: "",
    fechaNacimiento: "", nombre: "", apellido: "",
};

export default function Proveedores({ usuario, onLogout, onNavegar }) {
    const [search, setSearch] = useState("");
    const [filtroProveedor, setFiltroProveedor] = useState("");
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [formProveedor, setFormProveedor] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [modoNuevo, setModoNuevo] = useState(false);

    // ── Carga inicial ──────────────────────────────────────────────
    useEffect(() => {
        cargarProveedores();
    }, []);

    async function cargarProveedores() {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchConToken(`${API_BASE}/compras/proveedores`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setProveedores(Array.isArray(data) ? data.map(mapProveedor) : []);
        } catch (err) {
            console.error(err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // ── Búsqueda con debounce ──────────────────────────────────────
    useEffect(() => {
        if (!search.trim()) {
            cargarProveedores();
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const response = await fetchConToken(
                    `${API_BASE}/compras/proveedores/search?search=${encodeURIComponent(search)}`
                );
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                setProveedores(Array.isArray(data) ? data.map(mapProveedor) : []);
            } catch (err) {
                console.error(err.message);
                setError(err.message);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    // ── Crear / Editar ─────────────────────────────────────────────
    async function guardarProveedor() {
        const payload = {
            plazo: formProveedor.entrega,
            nombre: formProveedor.nombre || formProveedor.proveedor.split(" ")[0],
            apellido: formProveedor.apellido || formProveedor.proveedor.split(" ").slice(1).join(" "),
            ruc: formProveedor.ruc,
            direccion: formProveedor.direccion || formProveedor.ubicacion,
            telefono: formProveedor.telefono,
            correo: formProveedor.email,
            tipo_persona: formProveedor.tipoProveedor,
            fecha_nacimiento: formProveedor.fechaNacimiento || null,
        };

        try {
            const url = modoNuevo
                ? `${API_BASE}/compras/proveedores`
                : `${API_BASE}/compras/proveedores/${formProveedor.id_proveedor}`;

            const response = await fetchConToken(url, {
                method: modoNuevo ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            await cargarProveedores();
        } catch (err) {
            console.error(err.message);
            setError(err.message);
        }

        setModoEdicion(false);
        setModoNuevo(false);
    }

    // ── Handlers de modal ─────────────────────────────────────────
    function handleVerProveedor(proveedor) {
        setProveedorSeleccionado(proveedor);
        setFormProveedor({ ...proveedor });
        setModoEdicion(false);
        setModalType("info");
    }

    function handleNuevoProveedor() {
        setProveedorSeleccionado(proveedorVacio);
        setFormProveedor({ ...proveedorVacio });
        setModoNuevo(true);
        setModoEdicion(true);
        setModalType("info");
    }

    function cerrarModal() {
        setModalType(null);
        setProveedorSeleccionado(null);
        setFormProveedor(null);
        setModoEdicion(false);
        setModoNuevo(false);
    }

    // ── Subcomponentes ─────────────────────────────────────────────
    function InputEdit({ value, onChange }) {
        const [focus, setFocus] = useState(false);
        return (
            <input
                value={value}
                onChange={onChange}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                style={{ ...styles.inputEdit, ...(focus ? styles.inputEditFocus : {}) }}
            />
        );
    }

    function CampoDetalle({ label, campo }) {
        return (
            <div style={styles.dataCard}>
                <span style={styles.dataLabel}>{label}</span>
                {modoEdicion ? (
                    <InputEdit
                        value={formProveedor[campo] ?? ""}
                        onChange={(e) =>
                            setFormProveedor({ ...formProveedor, [campo]: e.target.value })
                        }
                    />
                ) : (
                    <span>{proveedorSeleccionado[campo] || "—"}</span>
                )}
            </div>
        );
    }

const columns = [
    { key: "proveedor", label: "Proveedor" },
    { key: "ruc", label: "RUC" },
    { key: "ubicacion", label: "Ubicación" },
    { key: "telefono", label: "Teléfono" },
    { key: "entrega", label: "Tiempo de entrega" },
    {
        key: "acciones",
        label: "Acciones",
        render: (p) => (
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                <button
                    onClick={() => handleVerProveedor(p)}
                    style={{ background: getColor("grisOscuro"), border: "none", borderRadius: 4, cursor: "pointer" }}
                >
                    <IconoLupa color="#FFD600" />
                </button>
            </div>
        ),
    },
];

    if (loading) {
        return (
            <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 24 }}>
                Cargando proveedores...
            </div>
        );
    }

    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onLogout={onLogout} onNavegar={onNavegar} />

            <main style={styles.contenido}>
                <h1 style={styles.titulo}>Proveedores</h1>

                {error && (
                    <div style={styles.errorBanner}>
                        Error: {error}
                        <button onClick={cargarProveedores} style={styles.btnRecargar}>
                            Reintentar
                        </button>
                    </div>
                )}

                <Lista
                    data={proveedores}
                    columns={columns}
                    controls={[
                        {
                            type: "search",
                            placeholder: "Buscar proveedor...",
                            value: search,
                            onChange: (e) => setSearch(e.target.value),
                        },
                        {
                            type: "select",
                            label: "Filtrar por:",
                            value: filtroProveedor,
                            onChange: (e) => setFiltroProveedor(e.target.value),
                            options: [
                                { key: "proveedor", label: "Proveedor" },
                                { key: "ruc", label: "RUC" },
                                { key: "ubicacion", label: "Ubicación" },
                                { key: "telefono", label: "Teléfono" },
                                { key: "tiempoentrega", label: "Tiempo de Entrega" },
                            ],
                        },
                        {
                            type: "button",
                            label: "Agregar Proveedor",
                            onClick: handleNuevoProveedor,
                        },
                    ]}
                />
            </main>

            {/* ── MODAL INFO ── */}
            {modalType === "info" && proveedorSeleccionado && (
                <div style={styles.overlay} onClick={cerrarModal}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

                        <div style={styles.modalHeader}>
                            <div style={styles.modalHeaderLeft}>
                                <IconoCompras size={28} color="#1D1D1D" />
                                <span style={styles.modalTitle}>
                                    {modoNuevo
                                        ? "Nuevo Proveedor"
                                        : `Información Proveedor - ${proveedorSeleccionado.proveedor}`}
                                </span>
                            </div>
                            <button onClick={cerrarModal} style={styles.closeIcon}>✕</button>
                        </div>

                        <div style={styles.modalBodyInfo}>
                            <div style={styles.columnaFoto}>
                                <img src="https://placehold.co/140x140" alt="Proveedor" style={styles.fotoProveedor} />
                                <span style={styles.nombreProveedor}>{proveedorSeleccionado.proveedor}</span>
                                <span style={styles.estadoProveedor}>Activo</span>
                            </div>

                            <div style={styles.columnaDatos}>
                                <CampoDetalle label="Nombre" campo="proveedor" />
                                <CampoDetalle label="Ubicación" campo="ubicacion" />
                                <CampoDetalle label="Tiempo de Entrega" campo="entrega" />
                                <CampoDetalle label="Email" campo="email" />
                            </div>

                            <div style={styles.columnaDatos}>
                                <CampoDetalle label="RUC / Identificación" campo="ruc" />
                                <CampoDetalle label="Tipo de Proveedor" campo="tipoProveedor" />
                                <CampoDetalle label="Teléfono" campo="telefono" />
                                <CampoDetalle label="Dirección" campo="direccion" />
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button
                                onClick={() => {
                                    if (modoEdicion) {
                                        setModoEdicion(false);
                                        setModoNuevo(false);
                                        setFormProveedor({ ...proveedorSeleccionado });
                                    } else {
                                        cerrarModal();
                                    }
                                }}
                                style={{ ...styles.footerBtn, ...styles.btnCerrar }}
                            >
                                {modoEdicion ? "Cancelar" : "Cerrar"}
                            </button>
                            <button
                                onClick={() => {
                                    if (modoEdicion) {
                                        guardarProveedor();
                                        cerrarModal();
                                    } else {
                                        setModoEdicion(true);
                                    }
                                }}
                                style={{ ...styles.footerBtn, ...styles.btnEditar }}
                            >
                                {modoNuevo ? "Crear Proveedor" : modoEdicion ? "Guardar Cambios" : "Editar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    pagina: { display: "flex", minHeight: "100vh", background: "#F5F5F5" },
    contenido: { flex: 1, padding: 20, display: "flex", flexDirection: "column", alignItems: "center" },
    titulo: { color: "#000000", fontSize: 42, fontFamily: "Lato, sans-serif", fontWeight: 700, margin: 0, textAlign: "center" },
    errorBanner: { width: "100%", background: "#FFF1F0", border: "1px solid #FFA39E", color: "#CF1322", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" },
    btnRecargar: { background: "transparent", border: "1px solid #CF1322", color: "#CF1322", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 700 },
    overlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
    modal: { background: "#FFFFFF", width: "950px", maxWidth: "90vw", borderRadius: 12, overflow: "hidden", boxShadow: "0px 6px 20px rgba(0,0,0,0.25)" },
    modalBodyInfo: { padding: 24, display: "grid", gridTemplateColumns: "240px 1fr 1fr", gap: 20, alignItems: "start" },
    modalBodyOrdenes: { padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" },
    columnaFoto: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14 },
    fotoProveedor: { width: 140, height: 140, borderRadius: "50%", objectFit: "cover", border: `4px solid ${getColor("amarillo")}` },
    nombreProveedor: { fontSize: 20, fontWeight: 700, textAlign: "center", color: "#1D1D1D" },
    estadoProveedor: { background: "#D9F7BE", color: "#237804", padding: "6px 14px", borderRadius: 20, fontWeight: 700, fontSize: 14 },
    columnaDatos: { display: "flex", flexDirection: "column", gap: 14, width: "100%" },
    columnaDatosOrdenes: { display: "flex", flexDirection: "column", gap: 14, width: "100%" },
    dataCard: { background: "#F9F9F9", border: "1px solid #E5E5E5", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, minHeight: 72, justifyContent: "center" },
    dataCardOrdenes: { background: "#F9F9F9", border: "1px solid #E5E5E5", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, minHeight: 72, justifyContent: "center", width: "100%" },
    dataLabel: { fontSize: 13, fontWeight: 700, color: "#777", textTransform: "uppercase" },
    modalHeader: { width: "100%", background: getColor("amarillo"), padding: "16px 20px", boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "center" },
    modalHeaderLeft: { display: "flex", alignItems: "center", gap: 12 },
    modalTitle: { fontSize: 20, fontWeight: 700, fontFamily: "Lato", color: "#1D1D1D" },
    closeIcon: { background: "transparent", border: "none", fontSize: 24, fontWeight: "bold", cursor: "pointer", color: "#1D1D1D" },
    modalFooter: { width: "100%", background: getColor("gris"), padding: "16px 20px", boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "center" },
    footerBtn: { padding: "10px 18px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontFamily: "Lato" },
    btnCerrar: { background: "#E0E0E0", color: "#1D1D1D" },
    btnEditar: { background: getColor("amarillo"), color: "#1D1D1D" },
    inputEdit: { width: "100%", border: "1px solid #D0D0D0", borderRadius: 8, padding: "8px 10px", fontFamily: "Lato", fontSize: 14, outline: "none", background: "#FFFFFF", boxSizing: "border-box" },
    inputEditFocus: { border: `1px solid ${getColor("amarillo")}`, boxShadow: `0 0 0 2px rgba(255, 214, 0, 0.25)` },
    Historial: { gridColumn: "1 / -1", width: "100%", marginTop: 10 },
};
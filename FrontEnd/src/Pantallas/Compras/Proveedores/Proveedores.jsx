import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { Button } from "../../../components/Buttons";
import { getColor } from "../../../components/Colors";
import Lista from "../../../components/Lista";
import { IconoLupa, IconoCompras } from "../../../components/Icons";
import List from "../../../components/Lista";

export default function Proveedores({ usuario, onLogout, onNavegar }) {

    const [search, setSearch] = useState("");
    const [orderBy, setOrderBy] = useState("");
    const [filtroProveedor, setFiltroProveedor] = useState("");
    const [proveedores, setProveedores] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [modalType, setModalType] = useState(null);


    function handleVerProveedor(proveedor) {
        setProveedorSeleccionado(proveedor);
        setModalType("info");
    }

    function handleVerOrdenes(proveedor, e) {
        e.stopPropagation();
        setProveedorSeleccionado(proveedor);
        setModalType("ordenes");
    }

    function cerrarModal() {
        setModalType(null);
        setProveedorSeleccionado(null);
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
            render: (orden) => (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 10,
                        width: "100%"
                    }}
                >
                    <button
                        onClick={(e) => handleVerProveedor(orden)}
                        style={{
                            background: getColor("grisOscuro"),
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer"
                        }}
                    >
                        <IconoLupa color="#FFD600" />
                    </button>
                </div>
            )
        },
        {
            key: "acciones",
            label: "Acciones",
            render: (orden) => (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%"
                    }}
                >
                    <button
                        onClick={(e) => handleVerOrdenes(orden, e)}
                        style={{
                            background: getColor("amarillo"),
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer"
                        }}
                    >
                        <IconoCompras size={24} />
                    </button>
                </div>
            )
        }
    ];

    function handleNuevo() {
        //Deberia llevar a la pag de crear proveedor
        console.log("Nuevo proveedor");
    }

    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onLogout={onLogout} onNavegar={onNavegar} />

            <main style={styles.contenido}>
                <header style={styles.encabezado}>
                    <h1 style={styles.titulo}>Proveedores</h1>
                    <div style={styles.separador} />
                </header>

                <section style={styles.listaStyle}>
                    <Lista
                        data={[
                            {
                                proveedor: "Distribuidora Central",
                                ruc: "80012345-6",
                                ubicacion: "Asunción",
                                telefono: "0981 123 456",
                                entrega: "2 días"
                            },
                            {
                                proveedor: "Importadora San José",
                                ruc: "80198765-4",
                                ubicacion: "Luque",
                                telefono: "0972 555 888",
                                entrega: "5 días"
                            }
                        ]}
                        columns={columns}
                        controls={[
                            {
                                type: "search",
                                placeholder: "Buscar proveedor...",
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
                                    { key: "proveedor", label: "Proveedor" },
                                    { key: "ruc", label: "RUC" },
                                    { key: "ubicacion", label: "Ubicación" },
                                    { key: "telefono", label: "Teléfono" },
                                    { key: "entrega", label: "Tiempo de entrega" },

                                ]
                            },
                            {
                                type: "select",
                                label: "Filtrar por:",
                                placeholder: "Seleccionar",
                                value: filtroProveedor,
                                onChange: (e) => setFiltroProveedor(e.target.value),

                                options: [
                                    { key: "proveedor", label: "Proveedor" },
                                    { key: "ruc", label: "RUC" },
                                    { key: "ubicacion", label: "Ubicación" },
                                    { key: "telefono", label: "Teléfono" },
                                    { key: "entrega", label: "Tiempo de entrega" },

                                ]

                            },
                            {
                                type: "button",
                                label: "Registrar Proveedor",
                                size: "lg",
                                onClick: handleNuevo
                            }
                        ]}
                        searchWidth={250}
                    />
                </section>

            </main>

            {/* MODAL de información del proveedor */}
            {modalType === "info" && proveedorSeleccionado && (
                <div
                    style={styles.overlay}
                    onClick={() => cerrarModal()}
                >
                    <div
                        style={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* HEADER */}
                        <div style={styles.modalHeader}>

                            <div style={styles.modalHeaderLeft}>
                                <IconoCompras size={28} color="#1D1D1D" />

                                <span style={styles.modalTitle}>
                                    Información Proveedor - {proveedorSeleccionado.proveedor}
                                </span>
                            </div>

                            <button
                                onClick={() => cerrarModal()}
                                style={styles.closeIcon}
                            >
                                ✕
                            </button>

                        </div>

                        {/* BODY */}
                        <div style={styles.modalBody}>

                            {/* COLUMNA 1 */}
                            <div style={styles.columnaFoto}>

                                <img
                                    src="https://placehold.co/140x140"
                                    alt="Proveedor"
                                    style={styles.fotoProveedor}
                                />

                                <span style={styles.nombreProveedor}>
                                    {proveedorSeleccionado.proveedor}
                                </span>

                                <span style={styles.estadoProveedor}>
                                    Activo
                                </span>

                            </div>

                            {/* COLUMNA 2 */}
                            <div style={styles.columnaDatos}>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Nombre</span>
                                    <span>{proveedorSeleccionado.proveedor}</span>
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Ubicación</span>
                                    <span>{proveedorSeleccionado.ubicacion}</span>
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Fecha de Registro</span>
                                    <span>12/05/2026</span>
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Email</span>
                                    <span>proveedor@email.com</span>
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Horario</span>
                                    <span>08:00 - 17:00</span>
                                </div>

                            </div>

                            {/* COLUMNA 3 */}
                            <div style={styles.columnaDatos}>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>RUC / Identificación</span>
                                    <span>{proveedorSeleccionado.ruc}</span>
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Tipo de Proveedor</span>
                                    <span>Distribuidor</span>
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Teléfono</span>
                                    <span>{proveedorSeleccionado.telefono}</span>
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Dirección</span>
                                    <span>Av. España 1234</span>
                                </div>

                            </div>

                        </div>
                        <div style={styles.modalFooter}>

                            <button
                                onClick={() => cerrarModal()}
                                style={{
                                    ...styles.footerBtn,
                                    ...styles.btnCerrar
                                }}
                            >
                                Cerrar
                            </button>

                            <button
                                onClick={() => cerrarModal()} // por ahora
                                style={{
                                    ...styles.footerBtn,
                                    ...styles.btnEditar
                                }}
                            >
                                Editar
                            </button>

                        </div>



                    </div>
                </div>
            )
            }

            {/* MODAL de Compras y Ordenes */}
            {modalType === "ordenes" && proveedorSeleccionado && (
                <div
                    style={styles.overlay}
                    onClick={() => cerrarModal()}
                >
                    <div
                        style={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* HEADER */}
                        <div style={styles.modalHeader}>

                            <div style={styles.modalHeaderLeft}>
                                <IconoCompras size={28} color="#1D1D1D" />

                                <span style={styles.modalTitle}>
                                    Información Proveedor - {proveedorSeleccionado.proveedor}
                                </span>
                            </div>

                            <button
                                onClick={() => cerrarModal()}
                                style={styles.closeIcon}
                            >
                                ✕
                            </button>

                        </div>

                        {/* BODY */}
                        <div style={styles.modalBody}>

                            {/* COLUMNA 1 */}
                            <div style={styles.columnaDatosOrdenes}>
                                <div style={styles.dataCardOrdenes}>
                                    <span style={styles.dataLabel}>Condiciones de Pago</span>
                                    <span>{"Credito - 30 dias."}</span>
                                </div>

                                <div style={styles.dataCardOrdenes}>
                                    <span style={styles.dataLabel}>Stock Disponible</span>
                                    <span>{"Consultar por producto."}</span>
                                </div>


                            </div>

                            {/* COLUMNA 2 */}
                            <div style={styles.columnaDatosOrdenes}>

                                <div style={styles.dataCardOrdenes}>
                                    <span style={styles.dataLabel}>Tiempo de Entrega</span>
                                    <span>{"6-7 dias habiles."}</span>
                                </div>

                                <div style={styles.dataCardOrdenes}>
                                    <span style={styles.dataLabel}>Frecuencia de Compra</span>
                                    <span>{"Quincenal"}</span>
                                </div>

                            </div>

                        </div>
                        <div style={styles.modalFooter}>

                            <button
                                onClick={() => cerrarModal()}
                                style={{
                                    ...styles.footerBtn,
                                    ...styles.btnCerrar
                                }}
                            >
                                Cerrar
                            </button>

                            <button
                                onClick={() => cerrarModal()} // por ahora
                                style={{
                                    ...styles.footerBtn,
                                    ...styles.btnEditar
                                }}
                            >
                                Editar
                            </button>

                        </div>



                    </div>
                </div>
            )
            }

        </div >

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

    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },

    modal: {
        background: "#FFFFFF",
        width: "950px",
        maxWidth: "95vw",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0px 6px 20px rgba(0,0,0,0.25)",
        margin: "0 auto"
    },

    modalBody: {
        padding: 24,
        display: "grid",
        gridTemplateColumns: "240px 1fr 1fr",
        gap: 20,
        alignItems: "start",
        justifyContent: "center",
    },

    columnaFoto: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
    },

    fotoProveedor: {
        width: 140,
        height: 140,
        borderRadius: "50%",
        objectFit: "cover",
        border: `4px solid ${getColor("amarillo")}`,
    },

    nombreProveedor: {
        fontSize: 20,
        fontWeight: 700,
        textAlign: "center",
        color: "#1D1D1D",
    },

    estadoProveedor: {
        background: "#D9F7BE",
        color: "#237804",
        padding: "6px 14px",
        borderRadius: 20,
        fontWeight: 700,
        fontSize: 14,
    },

    columnaDatos: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        width: "100%",
    },

    columnaDatosOrdenes: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
},

    dataCard: {
        background: "#F9F9F9",
        border: "1px solid #E5E5E5",
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minHeight: 72,
        justifyContent: "center",
    },

    dataCardOrdenes: {
        background: "#F9F9F9",
        border: "1px solid #E5E5E5",
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minHeight: 72,
        justifyContent: "center",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
    },

    dataLabel: {
        fontSize: 13,
        fontWeight: 700,
        color: "#777",
        textTransform: "uppercase",
    },

    modalHeader: {
        width: "100%",
        background: getColor("amarillo"),
        padding: "16px 20px",
        boxSizing: "border-box",

        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    modalHeaderLeft: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: 700,
        fontFamily: "Lato",
        color: "#1D1D1D",
    },

    closeIcon: {
        background: "transparent",
        border: "none",
        fontSize: 24,
        fontWeight: "bold",
        cursor: "pointer",
        color: "#1D1D1D",
    },
    infoRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 10,
        borderBottom: "1px solid #E5E5E5",
    },

    label: {
        fontWeight: 700,
        color: "#555",
    },
    modalFooter: {
        width: "100%",
        background: getColor("gris"),
        padding: "16px 20px",
        boxSizing: "border-box",

        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerBtn: {
        padding: "10px 18px",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 700,
        fontFamily: "Lato",
    },
    btnCerrar: {
        background: "#E0E0E0",
        color: "#1D1D1D",
    },
    btnEditar: {
        background: getColor("amarillo"),
        color: "#1D1D1D",
    },
};

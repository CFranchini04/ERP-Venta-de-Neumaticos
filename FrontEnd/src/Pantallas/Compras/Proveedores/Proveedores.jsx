import React, { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Lista from "../../../components/Lista";
import { IconoLupa, IconoCompras } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";

export default function Proveedores({ usuario, onLogout, onNavegar }) {
    const [search, setSearch] = useState("");
    const [orderBy, setOrderBy] = useState("");
    const [filtroProveedor, setFiltroProveedor] = useState("");

    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [formProveedor, setFormProveedor] = useState(null);

    const [modalType, setModalType] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [modoEdicionOrdenes, setModoEdicionOrdenes] = useState(false);
    const [formOrdenes, setFormOrdenes] = useState(null);
    const [modoNuevo, setModoNuevo] = useState(false);

    const [proveedores, setProveedores] = useState([
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
    ]);

    function handleVerOrdenes(proveedor, e) {
        e.stopPropagation();

        setProveedorSeleccionado(proveedor);
        setFormOrdenes(proveedor);
        setModoEdicionOrdenes(false);
        setModalType("ordenes");
    }

    function handleVerProveedor(proveedor) {
        setProveedorSeleccionado(proveedor);
        setFormProveedor(proveedor);
        setModoEdicion(false);
        setModalType("info");
    }

    function cerrarModal() {
        setModalType(null);
        setProveedorSeleccionado(null);
        setFormProveedor(null);
        setModoEdicion(false);
        setModoNuevo(false);
    }

    function handleNuevoProveedor() {
        const nuevoProveedor = {
            proveedor: "",
            ruc: "",
            ubicacion: "",
            telefono: "",
            entrega: "",
            email: "",
            direccion: "",
            tipoProveedor: "",
            horario: "",
            fechaRegistro: ""
        };
        setProveedorSeleccionado(nuevoProveedor);
        setFormProveedor(nuevoProveedor);
        setModoNuevo(true);
        setModoEdicion(true);
        setModalType("info");
    }

    function guardarProveedor() {
        if (modoNuevo) {
            // Agregar nuevo proveedor
            setProveedores([...proveedores, formProveedor]);
            console.log("CREAR proveedor:", formProveedor);
        } else {
            // Editar proveedor existente
            setProveedores(
                proveedores.map(p =>
                    p.ruc === proveedorSeleccionado.ruc ? formProveedor : p
                )
            );
            console.log("EDITAR proveedor:", formProveedor);
        }
        setProveedorSeleccionado(formProveedor);
        setModoEdicion(false);
        setModoNuevo(false);
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
                        style={{
                            background: getColor("grisOscuro"),
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer"
                        }}
                    >
                        <IconoLupa color="#FFD600" />
                    </button>

                    <button
                        onClick={(e) => handleVerOrdenes(p, e)}
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

    function InputEdit({ value, onChange }) {
        const [focus, setFocus] = useState(false);

        return (
            <input
                value={value}
                onChange={onChange}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                style={{
                    ...styles.inputEdit,
                    ...(focus ? styles.inputEditFocus : {})
                }}
            />
        );
    }

    // Filtrar proveedores por búsqueda y filtro
    const proveedoresFiltrados = proveedores.filter(proveedor => {
        const coincideBusqueda = proveedor.proveedor
            .toLowerCase()
            .includes(search.toLowerCase()) ||
            proveedor.ruc.toLowerCase().includes(search.toLowerCase()) ||
            proveedor.ubicacion.toLowerCase().includes(search.toLowerCase());

        if (!coincideBusqueda) return false;

        return true;
    });

    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onLogout={onLogout} onNavegar={onNavegar} />

            <main style={styles.contenido}>
                <h1 style={styles.titulo}>Proveedores</h1>

                <Lista
                    data={proveedoresFiltrados}
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
                            label: "Filtrar por:",
                            value: filtroProveedor,
                            onChange: (e) => setFiltroProveedor(e.target.value),
                            options: [
                                { key: "proveedor", label: "Proveedor" },
                                { key: "ruc", label: "RUC" },
                                { key: "ubicacion", label: "Ubicación" },
                                { key: "telefono", label: "Teléfono" },
                                { key: "tiempoentrega", label: "Tiempo de Entrega" }
                            ]
                        },
                        {
                            type: "button",
                            label: "Agregar Proveedor",
                            onClick: () => handleNuevoProveedor()
                        }
                    ]}
                />
            </main>

            {modalType === "info" && proveedorSeleccionado && (
                <div style={styles.overlay} onClick={cerrarModal}>
                    <div
                        style={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >


                        <div style={styles.modalHeader}>
                            <div style={styles.modalHeaderLeft}>
                                <IconoCompras size={28} color="#1D1D1D" />

                                <span style={styles.modalTitle}>
                                    {modoNuevo ? "Nuevo Proveedor" : `Información Proveedor - ${proveedorSeleccionado?.proveedor || ""}`}
                                </span>
                            </div>

                            <button onClick={cerrarModal} style={styles.closeIcon}>
                                ✕
                            </button>
                        </div>


                        <div style={styles.modalBodyInfo}>

                            {/* COLUMNA FOTO */}
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

                                    {modoEdicion ? (
                                        <InputEdit
                                            value={formProveedor.proveedor || ""}
                                            onChange={(e) =>
                                                setFormProveedor({
                                                    ...formProveedor,
                                                    proveedor: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>{proveedorSeleccionado.proveedor}</span>
                                    )}
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Ubicación</span>

                                    {modoEdicion ? (
                                        <InputEdit
                                            value={formProveedor.ubicacion || ""}
                                            onChange={(e) =>
                                                setFormProveedor({
                                                    ...formProveedor,
                                                    ubicacion: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>{proveedorSeleccionado.ubicacion}</span>
                                    )}
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Fecha de Registro</span>
                                    {modoEdicion ? (
                                        <InputEdit
                                            value={formProveedor.fechaRegistro || ""}
                                            onChange={(e) =>
                                                setFormProveedor({
                                                    ...formProveedor,
                                                    fechaRegistro: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>{proveedorSeleccionado.fechaRegistro}</span>
                                    )}
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Email</span>
                                    {modoEdicion ? (
                                        <InputEdit
                                            value={formProveedor.email || ""}
                                            onChange={(e) =>
                                                setFormProveedor({
                                                    ...formProveedor,
                                                    email: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>{proveedorSeleccionado.email}</span>
                                    )}
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Horario</span>
                                    {modoEdicion ? (
                                        <InputEdit
                                            value={formProveedor.horario || ""}
                                            onChange={(e) =>
                                                setFormProveedor({
                                                    ...formProveedor,
                                                    horario: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>{proveedorSeleccionado.horario}</span>
                                    )}
                                </div>

                            </div>

                            {/* COLUMNA 3 */}
                            <div style={styles.columnaDatos}>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>RUC / Identificación</span>
                                    {modoEdicion ? (
                                        <InputEdit
                                            value={formProveedor.ruc || ""}
                                            onChange={(e) =>
                                                setFormProveedor({
                                                    ...formProveedor,
                                                    ruc: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>{proveedorSeleccionado.ruc}</span>
                                    )}
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Tipo de Proveedor</span>
                                    {modoEdicion ? (
                                        <InputEdit
                                            value={formProveedor.tipoProveedor || ""}
                                            onChange={(e) =>
                                                setFormProveedor({
                                                    ...formProveedor,
                                                    tipoProveedor: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>{proveedorSeleccionado.tipoProveedor}</span>
                                    )}

                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Teléfono</span>

                                    {modoEdicion ? (
                                        <InputEdit
                                            value={formProveedor.telefono || ""}
                                            onChange={(e) =>
                                                setFormProveedor({
                                                    ...formProveedor,
                                                    telefono: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>{proveedorSeleccionado.telefono}</span>
                                    )}
                                </div>

                                <div style={styles.dataCard}>
                                    <span style={styles.dataLabel}>Dirección</span>
                                    {modoEdicion ? (
                                        <InputEdit
                                            value={formProveedor.direccion || ""}
                                            onChange={(e) =>
                                                setFormProveedor({
                                                    ...formProveedor,
                                                    direccion: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>{proveedorSeleccionado.direccion}</span>
                                    )}
                                </div>

                            </div>

                        </div>

                        <div style={styles.modalFooter}>

                            <button
                                onClick={() => {
                                    if (modoEdicion) {
                                        setModoEdicion(false);
                                        setModoNuevo(false);
                                        setFormProveedor(proveedorSeleccionado);
                                    } else {
                                        cerrarModal();
                                    }
                                }}
                                style={{
                                    ...styles.footerBtn,
                                    ...styles.btnCerrar
                                }}
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
                                style={{
                                    ...styles.footerBtn,
                                    ...styles.btnEditar
                                }}
                            >
                                {modoNuevo
                                    ? (modoEdicion ? "Crear Proveedor" : "Crear Proveedor")
                                    : (modoEdicion ? "Guardar Cambios" : "Editar")
                                }
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {modalType === "ordenes" && proveedorSeleccionado && (
                <div style={styles.overlay} onClick={cerrarModal}>
                    <div
                        style={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* HEADER */}
                        <div style={styles.modalHeader}>
                            <div style={styles.modalHeaderLeft}>
                                <IconoCompras size={28} color="#1D1D1D" />

                                <span style={styles.modalTitle}>
                                    Compras y Órdenes - {proveedorSeleccionado.proveedor}
                                </span>
                            </div>

                            <button onClick={cerrarModal} style={styles.closeIcon}>
                                ✕
                            </button>
                        </div>


                        <div style={styles.modalBodyOrdenes}>

                            {/* COLUMNA 1 */}
                            <div style={styles.columnaDatosOrdenes}>

                                <div style={styles.dataCardOrdenes}>
                                    <span style={styles.dataLabel}>Condiciones de Pago</span>

                                    {modoEdicionOrdenes ? (
                                        <InputEdit
                                            value={formOrdenes?.condicionesPago || ""}
                                            onChange={(e) =>
                                                setFormOrdenes({
                                                    ...formOrdenes,
                                                    condicionesPago: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>Crédito - 30 días.</span>
                                    )}
                                </div>

                                <div style={styles.dataCardOrdenes}>
                                    <span style={styles.dataLabel}>Stock Disponible</span>

                                    {modoEdicionOrdenes ? (
                                        <InputEdit
                                            value={formOrdenes?.stock || ""}
                                            onChange={(e) =>
                                                setFormOrdenes({
                                                    ...formOrdenes,
                                                    stock: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>Consultar por producto.</span>
                                    )}
                                </div>

                            </div>

                            {/* COLUMNA 2 */}
                            <div style={styles.columnaDatosOrdenes}>

                                <div style={styles.dataCardOrdenes}>
                                    <span style={styles.dataLabel}>Tiempo de Entrega</span>

                                    {modoEdicionOrdenes ? (
                                        <InputEdit
                                            value={formOrdenes?.entrega || ""}
                                            onChange={(e) =>
                                                setFormOrdenes({
                                                    ...formOrdenes,
                                                    entrega: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>6-7 días hábiles.</span>
                                    )}
                                </div>

                                <div style={styles.dataCardOrdenes}>
                                    <span style={styles.dataLabel}>Frecuencia de Compra</span>

                                    {modoEdicionOrdenes ? (
                                        <InputEdit
                                            value={formOrdenes?.frecuencia || ""}
                                            onChange={(e) =>
                                                setFormOrdenes({
                                                    ...formOrdenes,
                                                    frecuencia: e.target.value
                                                })
                                            }
                                        />
                                    ) : (
                                        <span>Quincenal</span>
                                    )}
                                </div>

                            </div>

                            <div style={styles.Historial}>
                                <h3 style={{ marginBottom: 12 }}>Historial de Órdenes</h3>

                                <Lista
                                    data={[
                                        { producto: "Nuematico Bridgeston", ultimo_precio: "G.450.000", cantidad: "10", fecha: "15/08/2024" },
                                        { producto: "Aceite Motor 5W30", ultimo_precio: "G.250.000", cantidad: "20", fecha: "10/08/2024" },
                                        { producto: "Bateria Bosch 12V", ultimo_precio: "G.600.000", cantidad: "5", fecha: "05/08/2024" }
                                    ]}
                                    columns={[
                                        { key: "producto", label: "Producto" },
                                        { key: "ultimo_precio", label: "Último Precio" },
                                        { key: "cantidad", label: "Cantidad" },
                                        { key: "fecha", label: "Fecha de Compra" }
                                    ]}
                                    selectable={false}

                                />

                            </div>

                        </div>

                    </div>
                </div>
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

    /* =========================
       MODAL INFO
    ========================== */

    modalBodyInfo: {
        padding: 24,
        display: "grid",
        gridTemplateColumns: "240px 1fr 1fr",
        gap: 20,
        alignItems: "start",
        justifyContent: "center",
    },

    /* =========================
       MODAL ORDENES
    ========================== */

    modal: {
        background: "#FFFFFF",
        width: "950px",
        maxWidth: "90vw",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0px 6px 20px rgba(0,0,0,0.25)",
        margin: "0 auto",
    },

    modalBodyOrdenes: {
        padding: 24,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        alignItems: "start",
        justifyContent: "center",
        width: "100%",
    },

    /* =========================
       FOTO Y PERFIL
    ========================== */

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

    /* =========================
       COLUMNAS
    ========================== */

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
    },

    /* =========================
       CARDS
    ========================== */

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
    },

    dataLabel: {
        fontSize: 13,
        fontWeight: 700,
        color: "#777",
        textTransform: "uppercase",
    },

    /* =========================
       HEADER MODAL
    ========================== */

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

    /* =========================
       FOOTER MODAL
    ========================== */

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
    inputEdit: {
        width: "100%",
        border: "1px solid #D0D0D0",
        borderRadius: 8,
        padding: "8px 10px",
        fontFamily: "Lato",
        fontSize: 14,
        outline: "none",
        background: "#FFFFFF",
        boxSizing: "border-box",
    },

    inputEditFocus: {
        border: `1px solid ${getColor("amarillo")}`,
        boxShadow: `0 0 0 2px rgba(255, 214, 0, 0.25)`,
    },
    Historial: {
        gridColumn: "1 / -1",
        width: "100%",
        marginTop: 10,
    }
};

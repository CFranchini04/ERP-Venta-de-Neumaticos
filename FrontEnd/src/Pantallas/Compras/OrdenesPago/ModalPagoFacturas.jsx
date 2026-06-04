import React, { useState, useEffect } from "react";
import { Button } from "../../../components/Buttons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";
import { useNavigate } from "react-router-dom";
import { crearAsientoAPI, fetchCuentas } from '../../../Pantallas/Contabilidad/contabilidadHelpers';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function ModalPagoFacturas({ proveedor, facturas, onClose, onConfirmar }) {
    const [metodosPago, setMetodosPago] = useState([]);
    const [loadingMetodos, setLoadingMetodos] = useState(true);
    const [errorMetodos, setErrorMetodos] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState("");
    const navigate = useNavigate();
    const [filas, setFilas] = useState(
        facturas.map((f) => ({
            id: Number(f.id),
            codigo: f.codigo,
            pendiente: Number(f.importe_total) || 0,
            id_metodo_pago: "",
            monto: Number(f.importe_total) || 0,
        }))
    );

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoadingMetodos(true);
                setErrorMetodos("");
                const res = await fetchConToken(`${API_BASE}/compras/metodos-pago`);
                if (!res.ok) throw new Error(`Error ${res.status}`);
                const data = await res.json();
                setMetodosPago(data || []);
                if (data?.length > 0) {
                    setFilas((prev) =>
                        prev.map((f) => ({ ...f, id_metodo_pago: String(data[0].id_metodo_de_pago) }))
                    );
                }
            } catch (err) {
                setErrorMetodos(err.message);
            } finally {
                setLoadingMetodos(false);
            }
        };
        cargar();
    }, []);

    const actualizarFila = (id, campo, valor) => {
        setFilas((prev) =>
            prev.map((f) => (f.id === id ? { ...f, [campo]: valor } : f))
        );
    };

    const totalAPagar = filas.reduce((sum, f) => sum + (parseFloat(f.monto) || 0), 0);

    const filaInvalida = filas.some(
        (f) =>
            !f.id_metodo_pago ||
            !f.monto ||
            parseFloat(f.monto) <= 0 ||
            parseFloat(f.monto) > f.pendiente
    );

    const generarCodigo = () => {
        const ts = Date.now().toString().slice(-6);
        return `OP-${new Date().getFullYear()}-${ts}`;
    };
    const generarAsientoOrdenPago = async (fecha, codigoOrden, filas) => {
        const CUENTAS_POR_METODO_PAGO = {
            1: {
                "codigo": "1.1.1.1.01",
                "cuenta": "CAJA EN MONEDA NACIONAL",
                "imputable": true,
                "saldo": 0
            },
            2: {
                "codigo": "1.1.1.2.01",
                "cuenta": "BANCO ... CTA/CTE.",
                "imputable": true,
                "saldo": 0
            },
            3: {
                "codigo": "1.1.1.2.01",
                "cuenta": "BANCO ... CTA/CTE.",
                "imputable": true,
                "saldo": 0
            },
        };
        try {
            const todasCuentas = await fetchCuentas();
            const buscarPorCodigo = (codigo) =>
                todasCuentas.find((c) => c.codigo == codigo);

            const cuentaProveedores = buscarPorCodigo("2.1.1.1.01");
            if (!cuentaProveedores)
                throw new Error("No se encontró cuenta Proveedores (2.1.1.1.01)");

            const montoTotal = filas.reduce(
                (sum, f) => sum + (parseFloat(f.monto) || 0),
                0
            );

            const lineasHaber = [];
            const porMetodo = {};
            for (const fila of filas) {
                const id = String(fila.id_metodo_pago);
                porMetodo[id] = (porMetodo[id] || 0) + (parseFloat(fila.monto) || 0);
            }

            for (const [idMetodo, monto] of Object.entries(porMetodo)) {
                const def = CUENTAS_POR_METODO_PAGO[idMetodo];
                if (!def)
                    throw new Error(`Sin cuenta configurada para método de pago id=${idMetodo}`);

                const cuenta = buscarPorCodigo(def.codigo);
                if (!cuenta)
                    throw new Error(`No se encontró cuenta ${def.nombre} (${def.codigo})`);

                lineasHaber.push({
                    codigo: cuenta.codigo,
                    cuenta: cuenta.cuenta,
                    debe: 0,
                    haber: monto,  
                });
            }

            await crearAsientoAPI({
                fecha,
                concepto: `Orden de pago - ${codigoOrden}`,
                lineas: [
                    {
                        codigo: cuentaProveedores.codigo,
                        cuenta: cuentaProveedores.cuenta,
                        debe: montoTotal,
                        haber: 0,
                    },
                    ...lineasHaber,
                ],
                id_periodo_fiscal: null,
                id_estado: 1,
            });
        } catch (err) {
            throw new Error(`Error generando asiento: ${err.message}`);
        }
    };

    const handleConfirmar = async () => {
        try {
            setEnviando(true);
            setErrorEnvio("");
            const payload = {
                fecha_creacion: new Date().toISOString().split("T")[0],
                monto_total: totalAPagar,
                id_proveedor: proveedor.id,
                codigo_orden_pago: generarCodigo(),
                id_estado: 1,
                detalles: filas.map((f) => ({
                    id_factura_compra: Number(f.id),
                    id_metodo_pago: parseInt(f.id_metodo_pago),
                    monto: parseFloat(f.monto),
                })),
            };
            const res = await fetchConToken(`${API_BASE}/compras/ordenes-pago`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `Error ${res.status}`);
            }
            await generarAsientoOrdenPago(
                payload.fecha_creacion,
                payload.codigo_orden_pago,
                filas
            );
            onConfirmar?.();
            onClose();
        } catch (err) {
            setErrorEnvio(err.message);
        } finally {
            setEnviando(false);
            navigate("/compras/ordenes-de-pago");
        }
    };

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.titulo} onClick={() => navigate("/compras/ordenes-de-pago")}>Confirmar pago</h2>
                        <p style={styles.subtitulo}>
                            Proveedor: <strong>{proveedor?.nombre}</strong> &mdash;{" "}
                            {facturas.length} factura{facturas.length !== 1 ? "s" : ""} seleccionada{facturas.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <button style={styles.btnCerrar} onClick={onClose} aria-label="Cerrar">
                        &#x2715;
                    </button>
                </div>

                <div style={styles.cuerpo}>
                    {loadingMetodos && <p style={styles.estadoTexto}>Cargando métodos de pago...</p>}
                    {errorMetodos && <p style={{ ...styles.estadoTexto, color: "red" }}>{errorMetodos}</p>}

                    {!loadingMetodos && !errorMetodos && (
                        <div style={{ overflowX: "auto" }}>
                            <table style={styles.tabla}>
                                <thead>
                                    <tr>
                                        {["Código", "Método de pago", "Pendiente", "Monto a pagar"].map((col) => (
                                            <th key={col} style={styles.th}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filas.map((fila) => {
                                        const montoNum = parseFloat(fila.monto) || 0;
                                        const excede = montoNum > fila.pendiente;
                                        const vacio = montoNum <= 0;
                                        return (
                                            <tr key={fila.id} style={styles.tr}>
                                                <td style={styles.td}>
                                                    <span style={styles.codigo}>{fila.codigo}</span>
                                                </td>
                                                <td style={styles.td}>
                                                    <select
                                                        value={fila.id_metodo_pago}
                                                        onChange={(e) => actualizarFila(fila.id, "id_metodo_pago", e.target.value)}
                                                        style={styles.select}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        {metodosPago.map((m) => (
                                                            <option key={m.id_metodo_de_pago} value={String(m.id_metodo_de_pago)}>
                                                                {m.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ ...styles.td, ...styles.tdNumero }}>
                                                    ₲ {fila.pendiente.toLocaleString("es-PY")}
                                                </td>
                                                <td style={styles.td}>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={fila.pendiente}
                                                        value={fila.monto}
                                                        onChange={(e) => actualizarFila(fila.id, "monto", e.target.value)}
                                                        style={{
                                                            ...styles.inputMonto,
                                                            borderColor: excede || vacio ? "red" : getColor("gris") ?? "#ccc",
                                                        }}
                                                    />
                                                    {excede && <span style={styles.alerta}>Supera el pendiente</span>}
                                                    {vacio && <span style={styles.alerta}>Ingresá un monto</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div style={styles.footer}>
                    {errorEnvio && (
                        <p style={{ color: "red", margin: 0, fontSize: 14 }}>{errorEnvio}</p>
                    )}
                    <div style={styles.footerCentrado}>
                        <Button
                            label="Cancelar"
                            variant="rojo"
                            size="md"
                            onClick={onClose}
                            disabled={enviando}
                        />
                        <div style={styles.totalBox}>
                            <span style={styles.totalLabel}>Total a pagar</span>
                            <span style={styles.totalValor}>
                                ₲ {totalAPagar.toLocaleString("es-PY")}
                            </span>
                        </div>
                        <Button
                            label={enviando ? "Procesando..." : "Confirmar pago"}
                            variant="amarillo"
                            size="md"
                            onClick={handleConfirmar}
                            disabled={filaInvalida || loadingMetodos || enviando}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
    },
    modal: {
        background: getColor("blanco"),
        borderRadius: 12,
        border: `1.5px solid ${getColor("negro")}`,
        width: "100%",
        maxWidth: 700,
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "20px 28px 16px",
        borderBottom: `1.5px solid ${getColor("negro")}`,
    },
    titulo: {
        fontFamily: "Lato, sans-serif",
        fontSize: 22,
        fontWeight: 700,
        color: getColor("negro"),
        margin: 0,
    },
    subtitulo: {
        fontFamily: "Lato, sans-serif",
        fontSize: 14,
        color: getColor("gris-oscuro") ?? "#555",
        margin: "4px 0 0",
    },
    btnCerrar: {
        background: "none",
        border: "none",
        fontSize: 20,
        cursor: "pointer",
        color: getColor("negro"),
        padding: "0 4px",
        lineHeight: 1,
    },
    cuerpo: {
        flex: 1,
        overflowY: "auto",
        padding: "20px 28px",
    },
    estadoTexto: {
        fontFamily: "Lato, sans-serif",
        fontSize: 14,
        color: getColor("negro"),
    },
    tabla: {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Lato, sans-serif",
        fontSize: 13,
    },
    th: {
        textAlign: "left",
        padding: "8px 10px",
        fontWeight: 700,
        fontSize: 12,
        color: getColor("negro"),
        borderBottom: `2px solid ${getColor("negro")}`,
        whiteSpace: "nowrap",
        background: getColor("gris-claro") ?? "#f5f5f5",
    },
    tr: {
        borderBottom: `1px solid ${getColor("gris") ?? "#ddd"}`,
    },
    td: {
        padding: "10px 10px",
        verticalAlign: "top",
        color: getColor("negro"),
    },
    tdNumero: {
        fontVariantNumeric: "tabular-nums",
        textAlign: "right",
        whiteSpace: "nowrap",
    },
    codigo: {
        fontFamily: "monospace",
        fontSize: 13,
        background: getColor("gris-claro") ?? "#f5f5f5",
        padding: "2px 6px",
        borderRadius: 4,
        whiteSpace: "nowrap",
    },
    select: {
        width: "100%",
        fontSize: 13,
        fontFamily: "Lato, sans-serif",
        padding: "6px 8px",
        border: `1px solid ${getColor("gris") ?? "#ccc"}`,
        borderRadius: 6,
        background: getColor("blanco"),
        color: getColor("negro"),
        cursor: "pointer",
        minWidth: 180,
    },
    inputMonto: {
        width: "100%",
        fontSize: 13,
        fontFamily: "Lato, sans-serif",
        padding: "6px 8px",
        border: "1.5px solid",
        borderRadius: 6,
        background: getColor("blanco"),
        color: getColor("negro"),
        minWidth: 120,
        boxSizing: "border-box",
    },
    alerta: {
        display: "block",
        fontSize: 11,
        color: "red",
        marginTop: 3,
    },
    footer: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "16px 28px 20px",
        borderTop: `1.5px solid ${getColor("negro")}`,
        background: getColor("gris-claro") ?? getColor("blanco"),
    },
    footerCentrado: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 70,
    },
    totalBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        marginRight: 16,
    },
    totalLabel: {
        fontSize: 12,
        color: getColor("gris-oscuro"),
        fontFamily: "Lato, sans-serif",
    },
    totalValor: {
        fontSize: 20,
        fontWeight: 700,
        fontFamily: "Lato, sans-serif",
        color: getColor("negro"),
    },
};
import React, { useEffect, useState } from 'react';
import Sidebar from "../../components/Sidebar";
import List from '../../components/Lista';
import { useNavigate } from 'react-router-dom';
import fetchConToken from '../../token'

import {
    IconoPedidos,
    IconoFactura,
    IconoMovimiento,
    IconoTesoreria
} from "../../components/Icons";

const API_BASE = "http://localhost:9128/api"

const columns = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'cuenta', label: 'Cuenta' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'total', label: 'Total' },
];

export default function Tesoreria({ usuario = 'Empleado', onLogout, onNavegar }) {
    const navigate = useNavigate();

    const [orderBy, setOrderBy] = useState("");
    const [busqueda, setBusqueda] = useState('');
    const [facturas, setFacturas] = useState([]);

    function handleNavegar(moduloId) {
        if (moduloId === 'bancos-saldos') {
            navigate('/tesoreria/bancos-saldos');
            return;
        }

        if (moduloId === 'deposito') {
            navigate('/tesoreria/deposito');
            return;
        }

        if (moduloId === 'movimiento') {
            navigate('/tesoreria/movimiento');
            return;
        }

        if (onNavegar) onNavegar(moduloId);
    }

    useEffect(() => {
        const cargarMovimientos = async () => {
            try {
                const res = await fetchConToken(`${API_BASE}/tesoreria/movimientos/tabla`)
                const data = await res.json()
                const formateados = data.map((item) => ({
                    id: item.id_movimiento,
                    fecha: item.fecha ? new Date(item.fecha).toLocaleDateString('es-ES') : '—',
                    cuenta: `${item.cuenta_origen?.bancos?.nombre ?? '—'} - ${item.cuenta_origen?.tipo_cuenta ?? '—'}`,
                    concepto: item.tipos_movimiento_bancario?.nombre ?? '—',
                    tipo: item.tipo ?? '—',
                    total: `${Number(item.monto ?? 0).toLocaleString('es-PY')} Gs.`,
                }))

                setFacturas(formateados)
            } catch (err) {
                console.error('Error cargando movimientos:', err)
            }
        }
        cargarMovimientos()
    }, [])

    const movimientosFiltrados = facturas.filter((f) =>
        Object.values(f).some((v) =>
            String(v).toLowerCase().includes(busqueda.toLowerCase())
        )
    );

    const movimientosOrdenados = [...movimientosFiltrados].sort((a, b) => {
        if (!orderBy) return 0;

        const valorA = a[orderBy];
        const valorB = b[orderBy];

        if (orderBy === 'total') {
            const numA = Number(String(valorA).replace(/\D/g, '')) || 0;
            const numB = Number(String(valorB).replace(/\D/g, '')) || 0;
            return numB - numA;
        }

        if (orderBy === 'fecha') {
            return new Date(b.fecha) - new Date(a.fecha);
        }

        return String(valorA).localeCompare(String(valorB), 'es-PY');
    });

    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />

            <main style={styles.contenido}>

                <header style={styles.encabezado}>
                    <h1 style={styles.titulo}>Módulo de Tesoreria y Bancos</h1>
                    <div style={styles.separador} />
                </header>

                <section style={styles.acciones}>
                    {[
                        { label: 'Bancos y Saldos', icon: <IconoTesoreria size={36} />, id: 'bancos-saldos' },
                        { label: 'Depositos', icon: <IconoFactura size={36} />, id: 'deposito' },
                        { label: 'Movimientos', icon: <IconoMovimiento size={36} />, id: 'movimiento' },

                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavegar(item.id)}
                            style={styles.tarjeta}
                        >
                            <span style={styles.tarjetaLabel}>{item.label}</span>
                            <div style={styles.tarjetaIcono}>{item.icon}</div>
                        </button>
                    ))}
                </section>

                <section style={styles.listaFacturas}>
                    <h3 style={styles.subtitulo}>Movimientos</h3>
                    <List
                        data={movimientosOrdenados}
                        columns={columns}
                        controls={[
                            {
                                type: 'search',
                                placeholder: 'Buscar movimientos...',
                                value: busqueda,
                                onChange: (e) => setBusqueda(e.target.value),
                            },
                            {
                                type: "select",
                                options: columns,
                                label: "Ordenar",
                                placeholder: "Ordenar por...",
                                value: orderBy,
                                onChange: (e) => setOrderBy(e.target.value)
                            },
                        ]}
                    />
                </section>

            </main>
        </div>
    );
}

const styles = {
    pagina: {
        display: 'flex',
        width: '100vw',
        height: '100vh',
        background: '#F9F9F9',
        fontFamily: 'Lato, sans-serif',
        overflow: 'hidden',
    },
    contenido: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '21px 50px',
        gap: 24,
        boxSizing: 'border-box',
        overflowY: 'auto',
    },
    encabezado: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '21px 0',
    },
    titulo: {
        color: '#000000',
        fontSize: 42,
        fontFamily: 'Lato, sans-serif',
        fontWeight: 700,
        lineHeight: 1.2,
        margin: 0,
        textAlign: 'center',
        marginTop: 15,

    },
    subtitulo: {
        color: '#000000',
        fontSize: 25,
        fontFamily: 'Lato, sans-serif',
        fontWeight: 700,
        lineHeight: 1.2,
        margin: 0,
        textAlign: 'left',
    },
    separador: {
        width: 'min(1100px, 80%)',
        height: 4,
        background: '#000000',
    },
    acciones: {
        width: '100%',
        maxWidth: 860,
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
        flexWrap: 'wrap',
    },
    tarjeta: {
        flex: '1 1 160px',
        maxWidth: 200,
        minHeight: 80,
        padding: '12px 16px',
        background: 'white',
        boxShadow: '0px 2px 2px rgba(0,0,0,0.25)',
        borderRadius: 8,
        border: '3px solid #000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        cursor: 'pointer',
    },
    tarjetaLabel: {
        color: '#444444',
        fontSize: 16,
        fontFamily: 'Lato, sans-serif',
        fontWeight: 700,
        textAlign: 'left',
    },
    tarjetaIcono: {
        width: 48,
        height: 48,
        background: '#FFCC00',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    listaFacturas: {
        width: '100%',
        maxWidth: 860,
    },
};

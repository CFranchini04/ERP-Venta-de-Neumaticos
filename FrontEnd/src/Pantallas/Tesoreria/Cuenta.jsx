import React, { useEffect, useState } from 'react';
import Sidebar from "../../components/Sidebar";
import { useNavigate, useParams } from 'react-router-dom';
import List from '../../components/Lista';
import { IconoMas } from '../../components/Icons';
import { getColor } from '../../components/Colors';
import fetchConToken from '../../token';
import ModalConciliacion from './ModalConciliacion';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:9128/api';

export default function Cuenta({ usuario = 'Empleado', onLogout, onNavegar }) {

    const navigate = useNavigate();
    const { id } = useParams();

    const [cuenta, setCuenta] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [mostrarModalConciliacion, setMostrarModalConciliacion] = useState(false);
    const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                const [resCuenta, resMov] = await Promise.all([
                    fetchConToken(`${API_BASE}/tesoreria/movimientos/cuentas/${id}`),
                    fetchConToken(`${API_BASE}/tesoreria/movimientos/cuenta/${id}`),
                ]);

                const dataCuenta = await resCuenta.json();
                const dataMov = await resMov.json();

                setCuenta({
                    id: dataCuenta.id_cuenta_bancaria,
                    nombre: `${dataCuenta.bancos?.nombre ?? '—'} - ${dataCuenta.tipo_cuenta ?? '—'}`,
                    balance: dataCuenta.saldo_disponible ?? 0,
                    saldoContable: dataCuenta.saldo_contable ?? 0,
                    pendientes: (dataCuenta.saldo_contable ?? 0) - (dataCuenta.saldo_disponible ?? 0),
                });

                const saldoActual = dataCuenta.saldo_disponible ?? 0;
                const conSaldo = dataMov.reduce((acc, mov, i) => {
                    let saldoAcumulado;
                    if (i === 0) {
                        saldoAcumulado = saldoActual;
                    } else {
                        const anterior = dataMov[i - 1];
                        const esIngreso = anterior.tipos_movimiento_bancario?.naturaleza === 'Ingreso' || anterior.tipo === 'Ingreso';
                        saldoAcumulado = esIngreso
                            ? acc[i - 1].saldo - (anterior.monto ?? 0)
                            : acc[i - 1].saldo + (anterior.monto ?? 0);
                    }
                    acc.push({
                        id: mov.id_movimiento,
                        fecha: mov.fecha ? new Date(mov.fecha).toLocaleDateString('es-ES') : '—',
                        concepto: mov.tipos_movimiento_bancario?.nombre ?? '—',
                        tipo: mov.tipos_movimiento_bancario?.naturaleza ?? mov.tipo ?? '—',
                        total: mov.monto ?? 0,
                        saldo: saldoAcumulado,
                        estado: mov.estados?.nombre ?? '—',
                        ...mov,
                    });
                    return acc;
                }, []);

                setMovimientos(conSaldo);
            } catch (err) {
                console.error('Error cargando cuenta:', err);
            } finally {
                setCargando(false);
            }
        };

        cargar();
    }, [id]);

    function handleNavegar(moduloId) {
        if (moduloId === 'cuentas') {
            navigate('/tesoreria/cuentas');
            return;
        }
        if (onNavegar) onNavegar(moduloId);
    }

    function abrirModalConciliacion(movimiento) {
        setMovimientoSeleccionado(movimiento);
        setMostrarModalConciliacion(true);
    }

    function cerrarModalConciliacion() {
        setMostrarModalConciliacion(false);
        setMovimientoSeleccionado(null);
    }

    function handleConciliarMovimiento(movimientoActualizado) {
        setMovimientos(prev => prev.map(m => m.id === movimientoActualizado.id_movimiento ? { ...m, estado: movimientoActualizado.estados?.nombre } : m));
        cerrarModalConciliacion();
    }

    if (cargando) return <div>Cargando...</div>;
    if (!cuenta) return null;

    const movimientosFiltrados = movimientos.filter((mov) => {
        const coincideBusqueda = mov.concepto.toLowerCase().includes(busqueda.toLowerCase());
        const coincideTipo = filtroTipo === '' || mov.tipo === filtroTipo;
        return coincideBusqueda && coincideTipo;
    });

    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />

            <main style={styles.contenido}>

                <h1 style={styles.nombreCuenta}>{cuenta.nombre}</h1>

                <div style={styles.resumenCuenta}>
                    <div>
                        <div style={styles.tituloBalance}>Balance Total Disponible</div>
                        <div style={styles.balance}>Gs. {cuenta.balance.toLocaleString('es-PY')}</div>
                        <div style={styles.saldos}>
                            <div>
                                <span style={styles.saldoLabel}>Saldo Contable</span>
                                <div>Gs. {cuenta.saldoContable.toLocaleString('es-PY')}</div>
                            </div>
                            <div>
                                <span style={styles.retencionLabel}>Retenciones/Pendientes</span>
                                <div>Gs. {cuenta.pendientes.toLocaleString('es-PY')}</div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.acciones}>
                        <button
                            style={styles.botonAccion}
                            onClick={() => navigate('/tesoreria/deposito', { state: { cuenta } })}
                        >
                            Depósito
                        </button>
                        <button
                            style={styles.botonAccion}
                            onClick={() => navigate('/tesoreria/movimiento', { state: { cuenta } })}
                        >
                            Movimiento
                        </button>
                    </div>
                </div>

                <div style={styles.historialContainer}>
                    <h2>Historial de movimientos</h2>
                    <List
                        data={movimientosFiltrados}
                        columns={[
                            { key: 'fecha', label: 'Fecha', width: '1fr' },
                            { key: 'concepto', label: 'Concepto', width: '2fr' },
                            { key: 'tipo', label: 'Tipo', width: '1fr' },
                            {
                                key: 'total',
                                label: 'Total',
                                width: '1fr',
                                render: (item) => `Gs. ${item.total.toLocaleString('es-PY')}`
                            },
                            {
                                key: 'saldo',
                                label: 'Saldo Acumulado',
                                width: '1.5fr',
                                render: (item) => `Gs. ${item.saldo.toLocaleString('es-PY')}`
                            },
                            {
                                key: 'estado',
                                label: 'Estado',
                                width: '1fr',
                                render: (item) => {
                                    const colores = { 'Pendiente': '#FF0000', 'Conciliado': '#22C55E', 'Completado': '#22C55E' };
                                    return <span style={{ color: colores[item.estado] || '#000', fontWeight: 700 }}>{item.estado}</span>;
                                }
                            },
                            {
                                label: 'Acciones',
                                width: '0.8fr',
                                render: (item) => {
                                    const esChequeConEstado = (item.estado === 'Pendiente' || item.estado === 'Conciliado') && item.depositos_bancarios?.some(d => d.tipo_deposito === 'Cheque Terceros');
                                    return esChequeConEstado ? (
                                        <button style={styles.botonAccion} onClick={() => abrirModalConciliacion(item)}>
                                            {item.estado === 'Pendiente' ? 'Conciliar' : 'Ver'}
                                        </button>
                                    ) : null;
                                }
                            }
                        ]}
                        controls={[
                            {
                                type: 'search',
                                placeholder: 'Buscar movimiento...',
                                value: busqueda,
                                onChange: (e) => setBusqueda(e.target.value)
                            },
                            {
                                type: 'select',
                                label: 'Filtrar por:',
                                value: filtroTipo,
                                onChange: (e) => setFiltroTipo(e.target.value),
                                options: [
                                    { key: 'Ingreso', label: 'Ingreso' },
                                    { key: 'Egreso', label: 'Egreso' }
                                ]
                            }
                        ]}
                    />
                </div>

            </main>

            {mostrarModalConciliacion && movimientoSeleccionado && (
                <ModalConciliacion
                    movimiento={movimientoSeleccionado}
                    onCerrar={cerrarModalConciliacion}
                    onConciliar={handleConciliarMovimiento}
                    modo={movimientoSeleccionado.estado === 'Pendiente' ? 'conciliar' : 'ver_detalles'}
                />
            )}
        </div>
    );
}

const styles = {
    pagina: { display: 'flex', width: '100vw', height: '100vh', background: '#F9F9F9', fontFamily: 'Lato, sans-serif', overflow: 'hidden' },
    contenido: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '21px 50px', gap: 24, boxSizing: 'border-box', overflowY: 'auto' },
    nombreCuenta: { width: '100%', maxWidth: 1200, fontSize: 32, fontWeight: 700, color: '#000', margin: 0, textAlign: 'left' },
    resumenCuenta: { width: '100%', background: '#FFF', border: '2px solid #000', borderRadius: 12, padding: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' },
    tituloBalance: { fontSize: 16, color: '#666', fontWeight: 600 },
    balance: { fontSize: 46, fontWeight: 700, color: '#000', lineHeight: 1, marginBottom: 20 },
    saldos: { display: 'flex', gap: 50, flexWrap: 'wrap' },
    saldoLabel: { fontSize: 14, color: '#196d19', fontWeight: 600 },
    retencionLabel: { fontSize: 14, color: getColor('rojo'), fontWeight: 600 },
    acciones: { display: 'flex', gap: 12, alignItems: 'center' },
    botonAccion: { padding: '10px 18px', borderRadius: 8, border: 'none', background: getColor('amarillo'), color: getColor('negro'), fontWeight: 700, cursor: 'pointer', fontSize: 14 },
    historialContainer: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12 },
    botonMas: { width: 30, height: 30, borderRadius: '20%', border: 'none', background: getColor('amarillo'), color: getColor('negro'), cursor: 'pointer', fontWeight: 700, fontSize: 18 },
    botonAccionesTabla: { background: '#3B82F6', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' },
};
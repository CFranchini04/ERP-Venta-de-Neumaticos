import React, { useEffect, useState } from 'react';
import Sidebar from "../../components/Sidebar";
import { useNavigate, useParams } from 'react-router-dom';
import List from '../../components/Lista';
import { IconoMas } from '../../components/Icons';
import { getColor } from '../../components/Colors';

export default function Cuenta({ usuario = 'Empleado', onLogout, onNavegar }) {

    const navigate = useNavigate();
    const { id } = useParams();

    const [cuenta, setCuenta] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    const [filtroTipo, setFiltroTipo] = useState('');

    const movimientos = [
        {
            fecha: '10/05/2026',
            concepto: 'Transferencia recibida',
            tipo: 'Ingreso',
            total: 2500000,
            saldo: 15000000,
        },
        {
            fecha: '09/05/2026',
            concepto: 'Pago proveedor',
            tipo: 'Egreso',
            total: 800000,
            saldo: 12500000,
        }
    ];

    useEffect(() => {
        const cuentas = [
            {
                id: 1,
                nombre: 'Banco Nacional - Cuenta Corriente',
                balance: 15000000,
                saldoContable: 15500000,
                pendientes: 500000,
            },
            {
                id: 2,
                nombre: 'Banco Itaú - Ahorros',
                balance: 8200000,
                saldoContable: 8500000,
                pendientes: 300000,
            },
            {
                id: 3,
                nombre: 'Banco Continental - Empresa',
                balance: 23450000,
                saldoContable: 24000000,
                pendientes: 550000,
            }
        ];

        setCuenta(cuentas.find(c => c.id === Number(id)));
    }, [id]);



    function handleNavegar(moduloId) {
        if (moduloId === 'cuentas') {
            navigate('/tesoreria/cuentas');
            return;
        }

        if (onNavegar) onNavegar(moduloId);
    }

    if (!cuenta) return null;

    const movimientosFiltrados = movimientos.filter((mov) => {

        const coincideBusqueda =
            mov.concepto.toLowerCase().includes(busqueda.toLowerCase());

        const coincideTipo =
            filtroTipo === '' || mov.tipo === filtroTipo;

        return coincideBusqueda && coincideTipo;
    });

    return (
        <div style={styles.pagina}>
            <Sidebar
                usuario={usuario}
                onNavegar={handleNavegar}
                onLogout={onLogout}
            />

            <main style={styles.contenido}>

                <h1 style={styles.nombreCuenta}>
                    {cuenta.nombre}
                </h1>

                <div style={styles.resumenCuenta}>

                    <div>
                        <div style={styles.tituloBalance}>
                            Balance Total Disponible
                        </div>

                        <div style={styles.balance}>
                            Gs. {cuenta.balance.toLocaleString('es-PY')}
                        </div>

                        <div style={styles.saldos}>
                            <div>
                                <span style={styles.saldoLabel}>
                                    Saldo Contable
                                </span>

                                <div>
                                    Gs. {cuenta.saldoContable.toLocaleString('es-PY')}
                                </div>
                            </div>

                            <div>
                                <span style={styles.retencionLabel}>
                                    Retenciones/Pendientes
                                </span>

                                <div>
                                    Gs. {cuenta.pendientes.toLocaleString('es-PY')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.acciones}>
                        <button
                            style={styles.botonAccion}
                            onClick={() =>
                                navigate('/tesoreria/deposito', {
                                    state: { cuenta }
                                })
                            }
                        >
                            Depósito
                        </button>
                    </div>

                </div>

                <div style={styles.historialContainer}>

                    <h2>Historial de movimientos</h2>


                    <List
                        data={movimientosFiltrados}
                        //modificar para que venga de bd
                        columns={[
                            {
                                key: 'fecha',
                                label: 'Fecha',
                                width: '1fr'
                            },
                            {
                                key: 'concepto',
                                label: 'Concepto',
                                width: '2fr'
                            },
                            {
                                key: 'tipo',
                                label: 'Tipo',
                                width: '1fr'
                            },
                            {
                                key: 'total',
                                label: 'Total',
                                width: '1fr',
                                render: (item) =>
                                    `Gs. ${item.total.toLocaleString('es-PY')}`
                            },
                            {
                                key: 'saldo',
                                label: 'Saldo Acumulado',
                                width: '1.5fr',
                                render: (item) =>
                                    `Gs. ${item.saldo.toLocaleString('es-PY')}`
                            },
                            {
                                label: 'Acciones',
                                width: '0.8fr',
                                render: () => (
                                    <button style={styles.botonMas}>
                                        <IconoMas />
                                    </button>
                                )
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
                                    {
                                        key: 'Ingreso',
                                        label: 'Ingreso'
                                    },
                                    {
                                        key: 'Egreso',
                                        label: 'Egreso'
                                    }
                                ]
                            }
                        ]}
                    />

                </div>

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
    nombreCuenta: {
        width: '100%',
        maxWidth: 1200,
        fontSize: 32,
        fontWeight: 700,
        color: '#000',
        margin: 0,
        textAlign: 'left',
    },

    informacion: {
        width: '100%',
        maxWidth: 1200,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
    },

    resumenCuenta: {
        width: '100%',
        background: '#FFF',
        border: '2px solid #000',
        borderRadius: 12,
        padding: 30,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxSizing: 'border-box',
    },

    datosCuenta: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },

    tituloBalance: {
        fontSize: 16,
        color: '#666',
        fontWeight: 600,
    },

    balance: {
        fontSize: 46,
        fontWeight: 700,
        color: '#000',
        lineHeight: 1,
        marginBottom: 20,
    },

    saldos: {
        display: 'flex',
        gap: 50,
        flexWrap: 'wrap',
    },

    saldoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
    },

    saldoLabel: {
        fontSize: 14,
        color: '#196d19',
        fontWeight: 600,
    },
    retencionLabel: {
        fontSize: 14,
        color: getColor('rojo'),
        fontWeight: 600,
    },

    saldoValor: {
        fontSize: 18,
        fontWeight: 700,
        color: '#000',
    },

    acciones: {
        display: 'flex',
        gap: 12,
        alignItems: 'center',
    },

    botonAccion: {
        padding: '10px 18px',
        borderRadius: 8,
        border: 'none',
        background: getColor('amarillo'),
        color: getColor('negro'),
        fontWeight: 700,
        cursor: 'pointer',
        fontSize: 14,
    },

    historialContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },

    tituloHistorial: {
        fontSize: 24,
        fontWeight: 700,
        margin: 0,
        color: '#000',
    },

    botonMas: {
        width: 30,
        height: 30,
        borderRadius: '20%',
        border: 'none',
        background: getColor('amarillo'),
        color: getColor('negro'),
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: 18,
    },

};
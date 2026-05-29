import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';



export default function BancosSaldos({ usuario = 'Empleado', onLogout, onNavegar }) {

    const [bancos, setBancos] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const data = [
            { id: 1, cuenta: 'Banco Nacional - Cuenta Corriente', saldo: 15000000 },
            { id: 2, cuenta: 'Banco Itaú - Ahorros', saldo: 8200000 },
            { id: 3, cuenta: 'Banco Continental - Empresa', saldo: 23450000 },
        ];

        setBancos(data);
    }, []);

    function handleNavegar(moduloId) {
        if (onNavegar) onNavegar(moduloId);
    }

    function verCuenta(id) {
        navigate(`/tesoreria/cuentas/${id}`);
    }

    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />

            <main style={styles.contenido}>

                <header style={styles.encabezado}>
                    <h1 style={styles.titulo}>Módulo de Tesoreria y Bancos</h1>
                    <div style={styles.separador} />
                </header>

                <div style={styles.panel}>

                    <div style={styles.headerPanel}>
                        <h2 style={styles.subtitulo}>Resumen y Cuentas.</h2>

                        <button style={styles.botonAgregar}>
                            Agregar
                        </button>
                    </div>

                    <div style={styles.grid}>
                        {bancos.map((banco) => (
                            <div key={banco.id} style={styles.card}>

                                <div style={styles.info}>
                                    <h3 style={styles.cuenta}>{banco.cuenta}</h3>
                                    <p style={styles.saldo}>
                                        Saldo: {banco.saldo.toLocaleString('es-PY')} Gs.
                                    </p>
                                </div>

                                <button
                                    style={styles.boton}
                                    onClick={() => verCuenta(banco.id)}
                                >
                                    Ver más
                                </button>

                            </div>
                        ))}
                    </div>

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
        fontSize: 30,
        fontFamily: 'Lato, sans-serif',
        fontWeight: 700,
        lineHeight: 1.2,
        margin: 0,
        textAlign: 'center',
        marginTop: 15,
    },

    panel: {
        width: '100%',
        maxWidth: 1100,
        background: '#fff',
        borderRadius: 12,
        border: '2px solid #000',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },

    headerPanel: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },

    subtitulo: {
        fontSize: 18,
        fontWeight: 700,
        margin: 0,
    },

    botonAgregar: {
        padding: '8px 14px',
        borderRadius: 6,
        border: '2px solid #000',
        background: '#fff',
        color: '#000',
        cursor: 'pointer',
        fontWeight: 700,
    },

    grid: {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 20,
    },

    card: {
        background: '#fff',
        borderRadius: 10,
        border: '2px solid #000',
        padding: 22,
        minHeight: 150,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
    },

    info: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
    },

    cuenta: {
        fontSize: 16,
        fontWeight: 700,
        margin: 0,
    },

    saldo: {
        fontSize: 14,
        color: '#333',
        margin: 0,
    },

    boton: {
        padding: '8px 12px',
        border: 'none',
        borderRadius: 6,
        background: '#000',
        color: '#fff',
        cursor: 'pointer',
        fontWeight: 600,
    },
};
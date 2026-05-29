import React, { useEffect, useState } from 'react';
import Sidebar from "../../components/Sidebar";
import List from '../../components/Lista';
import { useNavigate } from 'react-router-dom';

export default function Cuenta({ usuario = 'Empleado', onLogout, onNavegar }) {
    
    function handleNavegar(moduloId) {
        if (moduloId === 'cuentas') {
            navigate('/tesoreria/cuentas');
            return;
        }
        if (onNavegar) onNavegar(moduloId);
    }
    const navigate = useNavigate();

    
    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />

            <main style={styles.contenido}>

                <header style={styles.encabezado}>
                    <h1 style={styles.titulo}>hola</h1>
                    <div style={styles.separador} />
                </header>
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
};
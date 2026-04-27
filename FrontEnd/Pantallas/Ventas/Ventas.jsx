import React, { useState } from 'react';
import Sidebar from "../../components/Sidebar";
import List from '../../components/Lista';
import {
IconoPedidos,
IconoFactura,
IconoFacturaCancel,
IconoMas
} from "../../components/Icons";

const PLACEHOLDER_FACTURAS = [
    { id: 1, codigo: 'FAC-000004', cliente: 'Garfield Logan',  total: '396.000 Gs.',   fecha: '04/04/2025' },
    { id: 2, codigo: 'FAC-000003', cliente: 'Victor Stone',    total: '2.132.000 Gs.', fecha: '04/04/2025' },
    { id: 3, codigo: 'FAC-000002', cliente: 'Barry Allen',     total: '682.000 Gs.',   fecha: '03/04/2025' },
    { id: 4, codigo: 'FAC-000001', cliente: 'Diana Prince',    total: '4.048.000 Gs.', fecha: '02/04/2025' },
];

const columns = [
    { key: 'codigo',  label: 'Código'  },
    { key: 'cliente', label: 'Cliente' },
    { key: 'total',   label: 'Total'   },
    { key: 'fecha',   label: 'Fecha'   },
];

export default function Ventas({ usuario = 'Empleado', onLogout, onNavegar }) {
    const [orderBy, setOrderBy] = useState("");
    const [busqueda, setBusqueda] = useState('');

    const facturasFiltradas = PLACEHOLDER_FACTURAS.filter((f) =>
    Object.values(f).some((v) =>
        String(v).toLowerCase().includes(busqueda.toLowerCase())
    )
    );

function handleNavegar(moduloId) {
    if (onNavegar) onNavegar(moduloId);
}

return (
    <div style={styles.pagina}>
    <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />

    <main style={styles.contenido}>

        <header style={styles.encabezado}>
        <h1 style={styles.titulo}>Módulo de Ventas</h1>
        <div style={styles.separador} />
        </header>

        <section style={styles.acciones}>
        {[
            { label: 'Presupuestos',     icon: <IconoPedidos size={36} />,      id: 'presupuestos'    },
            { label: 'Facturas',         icon: <IconoFactura size={36} />,       id: 'facturas_ventas' },
            { label: 'Notas de Crédito', icon: <IconoFacturaCancel size={36} />, id: 'notas_credito'   },
            { label: 'Venta Directa',    icon: <IconoMas size={36} />,           id: 'venta_directa'   },
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
        <List
            data={facturasFiltradas}
            columns={columns}
            controls={[
            {
                type: 'search',
                placeholder: 'Buscar factura...',
                value: busqueda,
                onChange: (e) => setBusqueda(e.target.value),
            },
            {
                type: "select",
                options: columns,
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
    color: '#444444',
    fontSize: 42,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textAlign: 'center',
},
separador: {
    width: 'min(1100px, 80%)',
    height: 4,
    background: '#444444',
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
    border: '3px solid #444444',
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

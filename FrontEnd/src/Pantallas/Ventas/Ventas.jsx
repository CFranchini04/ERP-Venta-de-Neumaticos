import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../components/Sidebar";
import List from '../../components/Lista';
import {
IconoPedidos,
IconoFactura,
IconoFacturaCancel,
IconoMas
} from "../../components/Icons";

const SUPABASE_URL = "https://ufpvebypnhcbvgyrkzrw.supabase.co";
const SUPABASE_KEY = "sb_publishable_3zNPvTHmiYmwG-BMVDDk9g_KZ_li66L";

const columns = [
  { key: 'codigo',  label: 'Código',  width: '110px' },
  { key: 'cliente', label: 'Cliente', width: '1fr'   },
  { key: 'total',   label: 'Total',   width: '140px' },
  { key: 'fecha',   label: 'Fecha',   width: '120px' },
];

export default function Ventas({ usuario = 'Empleado', onLogout, onNavegar }) {
    const navigate = useNavigate();
    const [orderBy, setOrderBy] = useState("");
    const [busqueda, setBusqueda] = useState('');
    const [facturas, setFacturas] = useState([]);

    useEffect(() => {
        const cargarFacturas = async () => {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/facturas_ventas?select=id_factura,nro_factura,importe_total,fecha_emision,clientes(personas(nombre))&order=id_factura.desc`,
                {
                    headers: {
                        apikey: SUPABASE_KEY,
                        Authorization: `Bearer ${SUPABASE_KEY}`,
                    },
                }
            );

            const data = await res.json();

            const formateadas = data.map((item) => ({
                id: item.id_factura,
                codigo: item.codigo_factura ? item.codigo_factura : `FAC-${String(item.id_factura).padStart(6, '0')}`,
                cliente: item.clientes?.personas? [item.clientes.personas.nombre, item.clientes.personas.apellido].filter(Boolean).join(' ') : 'Agregar en BD',
                total: `${Number(item.importe_total ?? 0).toLocaleString('es-PY')} Gs.`,
                fecha: item.fecha_emision ? new Date(item.fecha_emision).toLocaleDateString('es-ES') : 'Agregar en BD',
            }));

            setFacturas(formateadas);
        };

        cargarFacturas();
    }, []);

    const facturasFiltradas = facturas.filter((f) =>
    Object.values(f).some((v) =>
        String(v).toLowerCase().includes(busqueda.toLowerCase())
    )
    );

function handleNavegar(moduloId) {
    navigate(`/ventas/${moduloId}`);
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
            { label: 'Presupuestos',     icon: <IconoPedidos size={36} />,      id: 'presupuestos' },
            { label: 'Facturas',         icon: <IconoFactura size={36} />,      id: 'facturas' },
            { label: 'Notas de Crédito', icon: <IconoFacturaCancel size={36} />,id: 'notas-credito' },
            { label: 'Venta Directa',    icon: <IconoMas size={36} />,          id: 'venta-directa' },
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
    color: '#000000',
    fontSize: 42,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textAlign: 'center',
    marginTop: 15,
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
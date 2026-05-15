import React from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../components/Sidebar";
import { Button } from "../../components/Buttons";
import List from '../../components/Lista';
import { getColor } from '../../components/Colors';



import {
  IconoPedidos,
  IconoCotizaciones,
  IconoOrdenCompra,
  IconoOrdenPago,
  IconoFactura,
  IconoProveedor,
  IconoLupa
} from "../../components/Icons";

const CardModulo = ({ titulo, Icono, onClick }) => (
  <div className="card">
    <span>{titulo}</span>

    <div className="card-btn">
      <Button
        variant="amarillo"
        onClick={onClick}
        label={<Icono />}
      />
    </div>
  </div>
);

//*STYLES */

const styles = `
  .titulo {
    text-align: center;
    margin-bottom: 20px;
    border-bottom: 4px solid #000000;
    padding-bottom: 10px;
    fontSize: 42;
  }


  
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    border-radius: 1px solid  #000000;
    margin-bottom: 30px;
  }

  .card {
    background: #FFFFFF;
    padding: 12px 16px;            
    border-radius: 8px;
    border: 3px solid #000000;
    box-shadow: 0px 2px 2px rgba(0,0,0,0.25); 
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    min-height: 80px;
    
  }

  .card-btn {
    display: flex;
    align-items: center;
  }

  .seccion-tablas {
    display: grid;
    padding: 15px;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    text-align: center;
    border-radius: 8px;
  }

  .tabla {
    background: #ffffff;
    padding: 5px;
    border-radius: 10px;
    border: 1px solid #000000;
    box-shadow: 0px 2px 2px rgba(0,0,0,0.25);
    
  }

`;




export default function Compras({ usuario = 'Empleado', onNavegar, onLogout }) {
  const navigate = useNavigate();

  const handleNavegar = (clave) => {
    const rutas = {
      pedidos: '/compras/pedidos',
      cotizaciones: '/compras/cotizaciones',
      ordenesCompra: '/compras/ordenes-de-compra',
      ordenesPago: '/compras/ordenes-de-pago',
      facturas: '/compras/facturas',
      proveedores: '/compras/proveedores',
    };

    const ruta = rutas[clave] || (clave.startsWith('/') ? clave : `/compras/${clave}`);
    navigate(ruta);
    if (typeof onNavegar === 'function') {
      try { onNavegar(ruta); } catch (e) {}
    }
  };
  // FACTURAS
  const columnasFacturas = [
    { key: "codigo", label: "Código" },
    { key: "proveedor", label: "Proveedor" },
    { key: "fechaCreacion", label: "Fecha de Creación" },
    { key: "fechaVencimiento", label: "Fecha de Vencimiento" }
  ];

  const dataFacturas = [
    {
      id: 1,
      codigo: "FAC_COM_048",
      proveedor: "Rusteeze",
      fechaCreacion: "05/04/2026",
      fechaVencimiento: "05/04/2036"
    },
    {
      id: 2,
      codigo: "FAC_COM_049",
      proveedor: "Dinoco",
      fechaCreacion: "05/03/2026",
      fechaVencimiento: "05/03/2036"
    }
  ];

  //COTIZACIONES
  const columnasCotizaciones = [
    { key: "codigo", label: "Código" },
    { key: "estado", label: "Estado" },
    { key: "fecha", label: "Fecha de Creación" },
    { key: "accion", label: "" }
  ];

  const dataCotizaciones = [
    {
      id: 1,
      codigo: "COT_038",
      estado: "Lista",
      fecha: "05/04/2026",
      accion: <IconoLupa />
    },
    {
      id: 2,
      codigo: "COT_167",
      estado: "Lista",
      fecha: "21/03/2026",
      accion: <IconoLupa />
    }
  ];

 
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />

      <div style={{ 
          flex: 1, 
          padding: '50px', 
          overflowY: 'auto', 
          background: getColor("blanco"),
          fontFamily: 'Lato, sans-serif',
        }}>
        <style>{styles}</style>

        <h1 className="titulo">Módulo de Compras</h1>
 
        {/*CARDS */}
        <div className="cards-grid">
          <CardModulo titulo="Pedidos" Icono={IconoPedidos} onClick={() => handleNavegar("pedidos")}/>
          <CardModulo titulo="Cotizaciones" Icono={IconoCotizaciones} onClick={() => handleNavegar("cotizaciones")} />
          <CardModulo titulo="Órdenes de compra" Icono={IconoOrdenCompra} onClick={() => handleNavegar("ordenesCompra")} />
          <CardModulo titulo="Órdenes de pago" Icono={IconoOrdenPago} onClick={() => handleNavegar("ordenesPago")} />
          <CardModulo titulo="Facturas" Icono={IconoFactura} onClick={() => handleNavegar("facturas")}/>
          <CardModulo titulo="Proveedores" Icono={IconoProveedor} onClick={() => handleNavegar("proveedores")}/>
        </div>

        {/* 🔹 TABLAS */}
        <div className="seccion-tablas">

          {/* FACTURAS */}
          <div className="tabla">
            <h2>Facturas pendientes de pago</h2>
            <List
              data={dataFacturas}
              columns={columnasFacturas}
            />
          </div>

          {/* COTIZACIONES */}
          <div className="tabla">
            <h2>Cotizaciones</h2>
            <List
              data={dataCotizaciones}
              columns={columnasCotizaciones}
            />
          </div>

        </div>

      </div>
    </div>
    
  );
 }

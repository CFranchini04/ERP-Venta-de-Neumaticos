import React from "react";
import Sidebar from "../../components/Sidebar";
import { Button } from "../../components/Buttons";



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
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    border-radius: 1px solid  #3f3a3a;
    margin-bottom: 30px;
  }

  .card {
    background: #EDEDED;
    padding: 15px;
    border-radius: 10px;
    border: 2px solid #ccc; 
    border-radius: 8px;     
    padding: 20px;  
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-btn {
    display: flex;
    align-items: center;
  }

  .seccion-tablas {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .tabla {
    background: #EDEDED;
    padding: 15px;
    border-radius: 10px;
    border-radius: #3f3a3a;
  }

  .fila {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 8px;
    border-bottom: 1px solid #ccc;
    align-items: center;
  }

  .header {
    font-weight: bold;
    background: #FFCC00;
  }

  .icono-accion {
    display: flex;
    justify-content: center;
  }
`;




export default function Compras({ usuario = 'Empleado', onNavegar, onLogout }) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: '#F9F9F9' }}>
        <style>{styles}</style>

        <h1 className="titulo">Módulo de Compras</h1>
 
        {/*CARDS */}
        <div className="cards-grid">
          <CardModulo titulo="Pedidos" Icono={IconoPedidos} onClick={() => onNavegar("pedidos")}/>
          <CardModulo titulo="Cotizaciones" Icono={IconoCotizaciones} />
          <CardModulo titulo="Órdenes de compra" Icono={IconoOrdenCompra} />
          <CardModulo titulo="Órdenes de pago" Icono={IconoOrdenPago} />
          <CardModulo titulo="Facturas" Icono={IconoFactura} />
          <CardModulo titulo="Proveedores" Icono={IconoProveedor} />
        </div>

        {/* 🔹 TABLAS */}
        <div className="seccion-tablas">

          {/* FACTURAS */}
          <div className="tabla">
            <h3>Facturas pendientes de pago</h3>

            <div className="fila header">
              <span>Código</span>
              <span>Proveedor</span>
              <span>Fecha de Creación</span>
              <span>Fecha de Vencimiento</span>
            </div>

            <div className="fila">
              <span>FAC_COM_048</span>
              <span>Rusteeze</span>
              <span>05/04/2026</span>
              <span>05/04/2036</span>
            </div>

            <div className="fila">
              <span>FAC_COM_048</span>
              <span>Dinoco</span>
              <span>05/03/2026</span>
              <span>05/03/2036</span>
            </div>
          </div>

          {/* COTIZACIONES */}
          <div className="tabla">
            <h3>Cotizaciones</h3>

            <div className="fila header">
              <span>Código</span>
              <span>Estado</span>
              <span>Fecha de Creación</span>
              <span></span>
            </div>

            <div className="fila">
              <span>COT_038</span>
              <span>Lista</span>
              <span>05/04/2026</span>
              <div className="icono-accion">
                <IconoLupa />
              </div>
            </div>

            <div className="fila">
              <span>COT_167</span>
              <span>Lista</span>
              <span>21/03/2026</span>
              <div className="icono-accion">
                <IconoLupa />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
    
  );
 }


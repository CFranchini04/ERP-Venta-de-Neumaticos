import React, { useEffect, useState } from "react";
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

const SUPABASE_URL = "https://skumubfkuzruzgkswutv.supabase.co";
const SUPABASE_KEY = "sb_publishable_Achm8f37YDHChJy_mS0SGw_GBAdKfC6";

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
  const [cotizaciones, setCotizaciones] = useState([]);
  const [facturas, setFacturas] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const resCot = await fetch(
        `${SUPABASE_URL}/rest/v1/cotizaciones?select=id_cotizacion,elegida,monto_total,pedidos_compras(fecha),proveedores(personas(nombre))&order=id_cotizacion.asc`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      const dataCot = await resCot.json();

      const cotFormateadas = dataCot.map((item) => ({
        codigo: `COT_${String(item.id_cotizacion).padStart(3, '0')}`,
        estado: item.elegida ? 'Lista' : 'Pendiente',
        fecha: item.pedidos_compras?.fecha ?? 'Agregar en BD',
      }));

      setCotizaciones(cotFormateadas);

      const resFac = await fetch(
        `${SUPABASE_URL}/rest/v1/facturas_compras?select=id_factura_compra,nro_factura,fecha,importe_total,ordenes_compras(fecha),proveedores(personas(nombre))&order=id_factura_compra.asc`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      const dataFac = await resFac.json();

      const facFormateadas = dataFac.map((item) => ({
        codigo: item.nro_factura ? item.nro_factura : `FAC_COM_${String(item.id_factura_compra).padStart(3, '0')}`,
        proveedor: item.proveedores?.personas?.nombre ?? 'Agregar en BD',
        fecha_creacion: item.fecha ?? 'Agregar en BD',
        fecha_vencimiento: 'Agregar en BD',
      }));

      setFacturas(facFormateadas);
    };

    cargarDatos();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: '#F9F9F9' }}>
        <style>{styles}</style>

        <h1 className="titulo">Módulo de Compras</h1>

        {/*CARDS */}
        <div className="cards-grid">
          <CardModulo titulo="Pedidos" Icono={IconoPedidos} onClick={() => onNavegar("pedidos")} />
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

            {facturas.map((item, index) => (
              <div className="fila" key={index}>
                <span>{item.codigo}</span>
                <span>{item.proveedor}</span>
                <span>{item.fecha_creacion}</span>
                <span>{item.fecha_vencimiento}</span>
              </div>
            ))}
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

            {cotizaciones.map((item, index) => (
              <div className="fila" key={index}>
                <span>{item.codigo}</span>
                <span>{item.estado}</span>
                <span>{item.fecha}</span>
                <div className="icono-accion">
                  <IconoLupa />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
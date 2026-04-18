import React from "react";
import Sidebar from "../components/Sidebar";

const styles = `
  .container {
    display: flex;
    height: 100vh;
  }
  .main {
    flex: 1;
    padding: 40px;
    overflow-y: auto;
    background: #F9F9F9;
  }
  .titulo {
    text-align: center;
    margin-bottom: 20px;
  }
  .cards-top {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .tabla {
    margin-top: 30px;
    background: #eee;
    padding: 20px;
    border-radius: 10px;
  }
  .fila {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 10px;
  }
`;

export default function Compras({ usuario = 'Empleado', onNavegar, onLogout }) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: '#F9F9F9' }}>
        <style>{styles}</style>

        <h1 className="titulo">Módulo de Compras</h1>
        <div className="cards-top">
          <div className="card">Nuevo pedido</div>
          <div className="card">Cotizaciones</div>
          <div className="card">Facturas</div>
          <div className="card">Proveedores</div>
        </div>
        <div className="tabla">
          <h3>Últimas Facturas</h3>
          <div className="fila">
            <span>FAC - 000004</span>
            <span>Garfield Logan</span>
            <span>396.000 Gs.</span>
            <span>04/04/2025</span>
          </div>
          <div className="fila">
            <span>FAC - 000003</span>
            <span>Victor Stone</span>
            <span>2.132.000 Gs.</span>
            <span>04/04/2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}

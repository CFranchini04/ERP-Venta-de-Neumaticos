import React from "react";
import "./Compras.css";

export default function Compras() {
  return (
    <div className="main">
      
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
  );
}
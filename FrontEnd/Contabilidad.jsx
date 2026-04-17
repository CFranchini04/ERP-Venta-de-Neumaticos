/*MAL IMPLEMENTADO PERO SIRVE PARA PROBARR */ 
import React from "react";
import "./App.css";

const modules = [
  "Plan de Cuentas",
  "Libro Diario",
  "Libro Mayor",
  "Balance General",
  "Balance de Sumas y Saldos",
  "Balance de Resultados"
];

export default function App() {
  return (
    <div className="container">
      
      <aside className="sidebar">
        <div className="logo">Nombre</div>

        <ul className="menu">
          <li>Compras</li>
          <li>Tesorería</li>
          <li>Ventas</li>
          <li>RR.HH</li>
          <li className="active">Contabilidad</li>
        </ul>

        <div className="user">El Ingeniero 13</div>
      </aside>

      <main className="main">
        
        <div className="header">
          Periodo Contable Enero 2026 - Diciembre 2026
        </div>

        <div className="cards">
          {modules.map((mod, index) => (
            <div key={index} className="card">
              <span>{mod}</span>
              <button className="btn">📝</button>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

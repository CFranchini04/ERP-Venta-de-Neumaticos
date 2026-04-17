import React from "react";

export default function Contabilidad() {
  const modules = [
    "Plan de Cuentas",
    "Libro Diario",
    "Libro Mayor",
    "Balance General",
    "Balance de Sumas y Saldos",
    "Balance de Resultados"
  ];

  return (
    <div className="main">
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
    </div>
  );
}
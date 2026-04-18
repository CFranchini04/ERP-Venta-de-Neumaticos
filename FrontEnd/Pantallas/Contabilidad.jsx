/*MAL IMPLEMENTADO PERO SIRVE PARA PROBARR */ 
import React from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";

const modules = [
  "Plan de Cuentas",
  "Libro Diario",
  "Libro Mayor",
  "Balance General",
  "Balance de Sumas y Saldos",
  "Balance de Resultados"
];
/*Este export de aca es el que hace que se pueda navegar, aclaro para que esto no se modifique.*/
export default function Contabilidad({ usuario = 'Empleado', onNavegar, onLogout }) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/*Este es para que cuando se aprieta el logo se va al homepage*/}
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />
      
      <main className="main" style={{ flex: 1, overflowY: 'auto' }}>
        
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

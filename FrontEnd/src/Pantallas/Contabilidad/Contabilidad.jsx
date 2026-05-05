/*MAL IMPLEMENTADO PERO SIRVE PARA PROBARR */ 
import React from "react";
import '../../App.css';
import Sidebar from "../../components/Sidebar";
import { Button } from "../../components/Buttons";
import { getColor } from '../../components/Colors';

import {
  IconoCalculadora,
  IconoResultados,
  IconoLibro,
  IconoSumas,
  IconoCuentas
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
    padding-bottom: 10px;
    border-bottom: 4px solid #000000;
    fontFamily: 'Lato, sans-serif';
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    border-radius: 1px solid  #000000;
    margin-bottom: 10px;
    padding: 20px 190px;
  }

  .card {
    background: #FFFFFF;
    padding: 12px 40px;
    border-radius: 8px;
    border: 3px solid #000000;
    box-shadow: 0px 3px 3px rgba(0,0,0,0.25);
    display: flex;
    justify-content: space-between;
    gap: 10px;
    min-height: 80px;
  }

  .card-btn {
    display: flex;
    align-items: center;
  }
`;




export default function Contabilidad({ usuario = 'Empleado', onNavegar, onLogout }) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: '#F9F9F9', fontFamily: 'Lato, sans-serif' }}>
        <style>{styles}</style>

        <h1 className="titulo">Periodo Contable Enero 2026 - Diciembre 2026</h1>
 
        {/*CARDS */}
        <div className="cards-grid">
          <CardModulo titulo="Plan de Cuentas" Icono={IconoCuentas} />
          <CardModulo titulo="Libro Diario" Icono={IconoLibro}  />
          <CardModulo titulo="Libro Mayor" Icono={IconoLibro}  />
          <CardModulo titulo="Balance General" Icono={IconoCalculadora} />
          <CardModulo titulo="Balance de Sumas y Saldos" Icono={IconoSumas} />
          <CardModulo titulo="Balance de Resultados" Icono={IconoResultados} />
        </div>

       </div>
       </div>
  );
  }



/*
const modules = [
  "Plan de Cuentas",
  "Libro Diario",
  "Libro Mayor",
  "Balance General",
  "Balance de Sumas y Saldos",
  "Balance de Resultados"
];
/*Este export de aca es el que hace que se pueda navegar, aclaro para que esto no se modifique.*/
/*export default function Contabilidad({ usuario = 'Empleado', onNavegar, onLogout }) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
    
     /* <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />
      
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
}*/
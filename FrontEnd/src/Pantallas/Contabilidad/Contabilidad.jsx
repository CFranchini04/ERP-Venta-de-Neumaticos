// Versión actualizada de Contabilidad.jsx con navegación cableada.
// Copiá los cambios marcados con // ⬇ a tu archivo Contabilidad.jsx.
import React from "react";
import { useNavigate } from "react-router-dom"; // ⬇ NUEVO
import "../../App.css";
import Sidebar from "../../components/Sidebar";
import { Button } from "../../components/Buttons";
import { getColor } from "../../components/Colors";

import {
  IconoCalculadora,
  IconoResultados,
  IconoLibro,
  IconoSumas,
  IconoCuentas,
} from "../../components/Icons";

const CardModulo = ({ titulo, Icono, onClick }) => (
  <div className="card">
    <span>{titulo}</span>
    <div className="card-btn">
      <Button variant="amarillo" onClick={onClick} label={<Icono />} />
    </div>
  </div>
);

const styles = `
  .titulo { text-align:center; margin-bottom:20px; padding-bottom:10px; border-bottom:4px solid #000; fontFamily:'Lato, sans-serif'; }
  .cards-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; border-radius:1px solid #000; margin-bottom:10px; padding:20px 190px; }
  .card { background:#FFF; padding:12px 40px; border-radius:8px; border:3px solid #000; box-shadow:0 3px 3px rgba(0,0,0,.25); display:flex; justify-content:space-between; gap:10px; min-height:80px; }
  .card-btn { display:flex; align-items:center; }
`;

export default function Contabilidad({ usuario = "Empleado", onNavegar, onLogout }) {
  const navigate = useNavigate(); // ⬇ NUEVO

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <div style={{ flex: 1, padding: 40, overflowY: "auto", background: "#F9F9F9", fontFamily: "Lato, sans-serif" }}>
        <style>{styles}</style>

        <h1 className="titulo">Periodo Contable Enero 2026 - Diciembre 2026</h1>

        <div className="cards-grid">
          {/* ⬇ Cada card ahora navega a su flujo */}
          <CardModulo titulo="Plan de Cuentas"          Icono={IconoCuentas}      onClick={() => navigate("/contabilidad/plan-de-cuentas")} />
          <CardModulo titulo="Libro Diario"             Icono={IconoLibro}        onClick={() => navigate("/contabilidad/libro-diario")} />
          <CardModulo titulo="Libro Mayor"              Icono={IconoLibro}        onClick={() => navigate("/contabilidad/libro-mayor")} />
          <CardModulo titulo="Balance General"          Icono={IconoCalculadora}  onClick={() => navigate("/contabilidad/balance-general")} />
          <CardModulo titulo="Balance de Sumas y Saldos" Icono={IconoSumas}       onClick={() => navigate("/contabilidad/balance-sumas-saldos")} />
          <CardModulo titulo="Balance de Resultados"    Icono={IconoResultados}   onClick={() => navigate("/contabilidad/balance-resultados")} />
        </div>
      </div>
    </div>
  );
}

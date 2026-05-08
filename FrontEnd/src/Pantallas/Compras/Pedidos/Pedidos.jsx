import React from "react";
import Sidebar from "../../../components/Sidebar";
import { useState } from "react";
import Lista from "../../../components/Lista";

import {
  IconoLupa
} from "../../../components/Icons";
import { getColor } from "../../../components/Colors";



export default function Pedidos({ usuario, onNavegar, onLogout }) {
  const pedidosIniciales = [
    { codigo: "PED_004", estado: "Aprobado", fecha: "2026-04-05" },
    { codigo: "PED_003", estado: "En Espera", fecha: "2026-03-21" },
    { codigo: "PED_002", estado: "Cancelado", fecha: "2026-01-30" },
    { codigo: "PED_001", estado: "Aprobado", fecha: "2025-12-28" }
  ];

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [orden, setOrden] = useState("default");

  const pedidosFiltrados = pedidosIniciales
  .filter((p) => {
    const texto = busqueda.toLowerCase();
    return (
      p.codigo.toLowerCase().includes(texto) ||
      p.estado.toLowerCase().includes(texto) ||
      p.fecha.toLowerCase().includes(texto)
    );
  })
  .filter((p) =>
    filtroEstado === "Todos" ? true : p.estado === filtroEstado
  )
  .sort((a, b) => {
    if (orden === "fechaDesc") {
      return new Date(b.fecha) - new Date(a.fecha); // más nuevos primero
    }

    if (orden === "fechaAsc") {
      return new Date(a.fecha) - new Date(b.fecha);
    }

    if (orden === "codigo") {
      return a.codigo.localeCompare(b.codigo);
    }

    return 0; // default
  });

  const FilaPedido = ({ pedido }) => (
  <div style={{ alignSelf: 'stretch', height: 50, display: 'flex' }}>
    <div style={{ flex: 1, padding: 10, display: 'flex', justifyContent: 'center' }}>
      {pedido.codigo}
    </div>

    <div style={{ flex: 1, padding: 10, display: 'flex', justifyContent: 'center' }}>
      {pedido.estado}
    </div>

    <div style={{ flex: 1, padding: 10, display: 'flex', justifyContent: 'center' }}>
      {pedido.fecha}
    </div>

    <div style={{ width: 200, display: 'flex', justifyContent: 'center' }}>
      <IconoLupa />
    </div>
  </div>
);


  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <div style={{ flex: 1, padding: '40px', background: '#F9F9F9' }}>
        <h1 className="titulo">Pedidos</h1>
 

        <div style={{width: '100%', height: '100%', paddingLeft: 25, paddingRight: 25, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
<div style={{alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 25, paddingRight: 25, paddingTop: 10, paddingBottom: 10, background: getColor('blanco'), boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)', overflow: 'hidden', borderRadius: 16, outline: '1px #444444 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
<div style={{alignSelf: 'stretch', padding: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 25, display: 'inline-flex'}}>
<div style={{flex: '1 1 0', height: 30, background: '#F9F9F9', overflow: 'hidden', borderRadius: 8, outline: '1px #444444 solid', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
<div style={{flex: '1 1 0', alignSelf: 'stretch', padding: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
<input
  placeholder="Buscar producto..."
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  style={{
    color: '#444444',
    fontSize: 16,
    fontFamily: 'Lato',
    fontWeight: '400',
    lineHeight: '19.20px',
    border: 'none',
    outline: 'none',
    width: '100%',
    background: 'transparent'
  }}
/>
</div>
<div style={{width: 50, alignSelf: 'stretch', padding: 10, background: '#F9F9F9', boxShadow: '-4px 0px 4px rgba(0, 0, 0, 0.25)', overflow: 'hidden', borderLeft: '1px #1D1D1D solid', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
<div className="icono-accion"> <IconoLupa />
<div style={{width: 20, height: 20, left: 0, top: 0, position: 'absolute', background: '#1D1D1D'}} />
</div>
</div>
</div>
<div style={{height: 30, background: '#F9F9F9', overflow: 'hidden', borderRadius: 8, outline: '1px #444444 solid', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
<div style={{alignSelf: 'stretch', padding: 10, background: '#F9F9F9', overflow: 'hidden', borderRight: '1px #444444 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
<div style={{color: '#1D1D1D', fontSize: 16, fontFamily: 'Lato', fontWeight: '700', lineHeight: 19.20, wordWrap: 'break-word'}}>Filtrar por:</div>
</div>

<div style={{alignSelf: 'stretch', padding: 10, background: '#F9F9F9', boxShadow: '2px 0px 2px rgba(0, 0, 0, 0.25) inset', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
<select
  value={filtroEstado}
  onChange={(e) => setFiltroEstado(e.target.value)}
  style={{
    border: "none",
    background: "transparent",
    fontSize: 16
  }}
>
  <option value="Todos">Por defecto</option>
  <option value="Aprobado">Aprobado</option>
  <option value="En Espera">En Espera</option>
  <option value="Cancelado">Cancelado</option>
</select>
<div style={{width: 19.59, height: 11.33, left: 0.21, top: 4, position: 'absolute', background: '#444444'}} />
</div>
</div>

<div style={{height: 30, background: '#F9F9F9', overflow: 'hidden', borderRadius: 8, outline: '1px #444444 solid', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
<div style={{alignSelf: 'stretch', padding: 10, background: '#F9F9F9', overflow: 'hidden', borderRight: '1px #444444 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
<div style={{color: '#1D1D1D', fontSize: 16, fontFamily: 'Lato', fontWeight: '700', lineHeight: 19.20, wordWrap: 'break-word'}}>Ordenar por:</div>
</div>
<div style={{alignSelf: 'stretch', padding: 10, background: '#F9F9F9', boxShadow: '2px 0px 2px rgba(0, 0, 0, 0.25) inset', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
<select
  value={orden}
  onChange={(e) => setOrden(e.target.value)}
  style={{ border: "none", background: "transparent", fontSize: 16 }}
>
  <option value="default">Por defecto</option>
  <option value="fechaDesc">Más recientes</option>
  <option value="fechaAsc">Más antiguos</option>
</select>
<div style={{width: 19.59, height: 11.33, left: 0.21, top: 4, position: 'absolute', background: '#444444'}} />
</div>
</div>
<div data-prop="Principal" style={{height: 30, paddingLeft: 20, paddingRight: 20, background: '#FFCC00', boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)', overflow: 'hidden', borderRadius: 8, outline: '1px #444444 solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
<div style={{color: '#1D1D1D', fontSize: 16, fontFamily: 'Lato', fontWeight: '700', lineHeight: 19.20, wordWrap: 'break-word'}}>Nuevo Pedido</div>
</div>
</div>
<div style={{
  alignSelf: 'stretch',
  flex: '1 1 0',
  overflow: 'hidden',
  borderRadius: 8,
  outline: '1px #1D1D1D solid',
  outlineOffset: '-1px',
  display: 'flex',
  flexDirection: 'column'
}}>

  {/* HEADER */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr) 200px',
    background: '#FFCC00',
    padding: 10,
    fontWeight: '700'
  }}>
    <div>Codigo</div>
    <div>Estado</div>
    <div>Fecha de Creacion</div>
    <div></div>
  </div>

  {/* FILAS DINÁMICAS */}
  {pedidosFiltrados.map((pedido, index) => (
    <div
      key={pedido.codigo}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr) 200px',
        padding: 10,
        background: index % 2 === 0 ? '#F9F9F9' : '#CECECE',
        alignItems: 'center'
      }}
    >
      <div>{pedido.codigo}</div>
      <div>{pedido.estado}</div>
      <div>{pedido.fecha}</div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <IconoLupa />
      </div>
    </div>
  ))}

</div>

<div style={{width: 200, alignSelf: 'stretch', padding: 10, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>

</div>
</div>
</div>
</div>
</div>
      
  );
}

/* CODIGO LIMPIO pero qu no queda igual al figma

import React from "react";
import Sidebar from "../../components/Sidebar";
import { Button } from "../../components/Buttons";
import { IconoLupa } from "../../components/Icons";

// 🔹 COMPONENTES

const Buscador = () => (
  <div className="buscador">
    <input placeholder="Buscar producto..." />
    <div className="icono">
      <IconoLupa />
    </div>
  </div>
);

const Filtro = ({ label }) => (
  <div className="filtro">
    <span className="label">{label}</span>
    <span className="valor">Por defecto</span>
  </div>
);

const FilaPedido = ({ codigo, estado, fecha }) => (
  <div className="fila">
    <span>{codigo}</span>
    <span>{estado}</span>
    <span>{fecha}</span>
    <div className="icono-accion">
      <IconoLupa />
    </div>
  </div>
);

// 🔹 STYLES (mismo enfoque que Compras)

const styles = `
  .container {
    padding: 40px;
    background: #F9F9F9;
    height: 100%;
  }

  .titulo {
    text-align: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
  }

  .toolbar {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    align-items: center;
  }

  .buscador {
    display: flex;
    border: 1px solid #444;
    border-radius: 8px;
    overflow: hidden;
    background: white;
  }

  .buscador input {
    border: none;
    padding: 10px;
    outline: none;
    width: 200px;
  }

  .buscador .icono {
    background: #F9F9F9;
    padding: 10px;
    border-left: 1px solid #444;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .filtro {
    display: flex;
    border: 1px solid #444;
    border-radius: 8px;
    overflow: hidden;
  }

  .filtro .label {
    background: #F9F9F9;
    padding: 10px;
    font-weight: bold;
    border-right: 1px solid #444;
  }

  .filtro .valor {
    padding: 10px;
  }

  .tabla {
    background: #EDEDED;
    border-radius: 10px;
    overflow: hidden;
  }

  .fila {
    display: grid;
    grid-template-columns: repeat(3, 1fr) 80px;
    padding: 10px;
    border-bottom: 1px solid #ccc;
    align-items: center;
  }

  .header {
    background: #FFCC00;
    font-weight: bold;
  }

  .icono-accion {
    display: flex;
    justify-content: center;
  }

  .btn-nuevo {
    margin-left: auto;
  }
`;


// 🔹 MAIN

export default function Pedidos({ usuario, onNavegar, onLogout }) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <div className="container">
        <style>{styles}</style>

        <h1 className="titulo">Pedidos</h1>*/

    //{/* 🔹 TOOLBAR */}
      /*  <div className="toolbar">
          <Buscador />
          <Filtro label="Filtrar por:" />
          <Filtro label="Ordenar por:" />

          <div className="btn-nuevo">
            <Button label="Nuevo Pedido" variant="amarillo" />
          </div>
        </div>*/

       //{/* 🔹 TABLA */} 
        /*<div className="tabla">
          <div className="fila header">
            <span>Código</span>
            <span>Estado</span>
            <span>Fecha de Creación</span>
            <span></span>
          </div>

          <FilaPedido codigo="PED_004" estado="Aprobado" fecha="05/04/2026" />
          <FilaPedido codigo="PED_003" estado="En Espera" fecha="21/03/2026" />
          <FilaPedido codigo="PED_002" estado="Cancelado" fecha="30/01/2026" />
          <FilaPedido codigo="PED_001" estado="Aprobado" fecha="28/12/2025" />
        </div>
      </div>
    </div>
  );
} 




*/

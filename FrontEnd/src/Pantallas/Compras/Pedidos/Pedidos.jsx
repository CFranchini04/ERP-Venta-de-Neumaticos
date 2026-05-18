import React from "react";
import Sidebar from "../../../components/Sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  IconoLupa
} from "../../../components/Icons";

import { getColor } from "../../../components/Colors";

export default function Pedidos({ usuario, onNavegar, onLogout }) {
 
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [orden, setOrden] = useState("default");
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH AGREGADO
  useEffect(() => {
  const fetchPedidos = async () => {
    try {
      const response = await fetch(
        'http://localhost:9128/api/compras/pedidos/tabla'
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setPedidos(data);

    } catch (error) {
      console.error(error.message);

    } finally {
      setLoading(false);
    }
  };

  fetchPedidos();
}, []);

  const pedidosFiltrados = pedidos
    .filter((p) => {
      const texto = busqueda.toLowerCase();

      return (
        p.codigo_pedido.toLowerCase().includes(texto) ||
        p.estados.nombre.toLowerCase().includes(texto) ||
        p.fecha_creacion.toLowerCase().includes(texto)
      );
    })
    .filter((p) =>
      filtroEstado === "Todos"
        ? true
        : p.estados.nombre === filtroEstado
    )
    .sort((a, b) => {

      if (orden === "fechaDesc") {
        return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
      }

      if (orden === "fechaAsc") {
        return new Date(a.fecha_creacion) - new Date(b.fecha_creacion);
      }

      if (orden === "codigo") {
        return a.codigo_pedido.localeCompare(b.codigo_pedido);
      }

      return 0;
    });
    
  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 24
        }}
      >
        Cargando pedidos...
      </div>
    );
  }    

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <div style={{
            flex: 1,
            padding: '10px',
            background: '#ffffff',
            textAlign: 'center',
          }}
        >
          <h1 className="titulo" 
            >Pedidos</h1>

          


        <div style={{ width: '100%', height: '100%', paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex' }}>

          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10, background: getColor('blanco'), boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)', overflow: 'hidden', borderRadius: 16, outline: '1px #444444 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>

            <div style={{ alignSelf: 'stretch', padding: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 15, display: 'inline-flex' }}>

              {/* BUSCADOR */}
              <div style={{ flex: '1 1 0', height: 30, background: '#F9F9F9', overflow: 'hidden', borderRadius: 8, outline: '1px #444444 solid', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                <div style={{ flex: '1 1 0', alignSelf: 'stretch', padding: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                  <input
                    placeholder="Buscar pedido..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{
                      color: '#000000',
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

                <div style={{ width: 50, alignSelf: 'stretch', padding: 10, background: '#F9F9F9', boxShadow: '-4px 0px 4px rgba(0, 0, 0, 0.25)', overflow: 'hidden', borderLeft: '1px #1D1D1D solid', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
                  <div className="icono-accion">
                    <IconoLupa />
                  </div>
                </div>
              </div>

              {/* FILTRO */}
              <div style={{ height: 30, background: '#ffffff', overflow: 'hidden', borderRadius: 8, outline: '1px #444444 solid', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>

                <div style={{ alignSelf: 'stretch', padding: 10, background: '#F9F9F9', overflow: 'hidden', borderRight: '1px #444444 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                  <div style={{ color: '#1D1D1D', fontSize: 16, fontFamily: 'Lato', fontWeight: '700' }}>
                    Filtrar por:
                  </div>
                </div>

                <div style={{ alignSelf: 'stretch', padding: 10, background: '#F9F9F9', boxShadow: '2px 0px 2px rgba(0, 0, 0, 0.25) inset', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
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
                </div>
              </div>

              {/* ORDEN */}
              <div style={{ height: 30, background: '#F9F9F9', overflow: 'hidden', borderRadius: 8, outline: '1px #444444 solid', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>

                <div style={{ alignSelf: 'stretch', padding: 10, background: '#F9F9F9', overflow: 'hidden', borderRight: '1px #444444 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                  <div style={{ color: '#1D1D1D', fontSize: 16, fontFamily: 'Lato', fontWeight: '700' }}>
                    Ordenar por:
                  </div>
                </div>

                <div style={{ alignSelf: 'stretch', padding: 10, background: '#F9F9F9', boxShadow: '2px 0px 2px rgba(0, 0, 0, 0.25) inset', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                  <select
                    value={orden}
                    onChange={(e) => setOrden(e.target.value)}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: 16
                    }}
                  >
                    <option value="default">Por defecto</option>
                    <option value="fechaDesc">Más recientes</option>
                    <option value="fechaAsc">Más antiguos</option>
                  </select>
                </div>
              </div>

               {/* BOTON */}
              <div
                onClick={() => navigate("/compras/pedidos/nuevo-pedido")}
                style={{
                  height: 30,
                  paddingLeft: 20,
                  paddingRight: 20,
                  background: getColor("amarillo"),
                  boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
                  overflow: 'hidden',
                  borderRadius: 8,
                  outline: '1px #000000 solid',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    color: getColor("negro"),
                    fontSize: 16,
                    fontFamily: 'Lato',
                    fontWeight: '700'
                  }}
                >
                  Nuevo Pedido
                </div>
              </div>

            </div>

            {/* TABLA */}
            <div style={{
              alignSelf: 'stretch',
              flex: '1 1 0',
              overflow: 'hidden',
              borderRadius: 8,
              outline: '1px #000000 solid',
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

              {/* FILAS */}
              {pedidosFiltrados.map((pedido, index) => (
                <div
                  key={pedido.codigo_pedido}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr) 200px',
                    padding: 10,
                    background: index % 2 === 0 ? '#ffffff' : '#CECECE',
                    alignItems: 'center'
                  }}
                >
                  <div>{pedido.codigo_pedido}</div>
                  <div>{pedido.estados.nombre}</div>
                  <div>{pedido.fecha_creacion}</div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <IconoLupa />
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

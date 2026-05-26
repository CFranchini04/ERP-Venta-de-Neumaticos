import React from "react";
import Sidebar from "../../../components/Sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  IconoLupa
} from "../../../components/Icons";

import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

export default function Cotizaciones({ usuario, onNavegar, onLogout }) {

  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [orden, setOrden] = useState("default");
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        const response = await fetchConToken(
          "http://localhost:9128/api/compras/cotizaciones/tabla"
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }
        setCotizaciones(data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCotizaciones();
  }, []);

  const cotizacionesFiltradas = cotizaciones
    .filter((p) => {
      const texto = busqueda.toLowerCase();
      return (
        p.codigo_cotizacion?.toLowerCase().includes(texto) ||
        p.estados?.nombre?.toLowerCase().includes(texto) ||
        p.fecha_respuesta?.toLowerCase().includes(texto) ||
        p.proveedores?.personas?.nombre?.toLowerCase().includes(texto) ||
        p.proveedores?.personas?.apellido?.toLowerCase().includes(texto)
      );
    })
    .filter((p) =>
      filtroEstado === "Todos"
        ? true
        : p.estados?.nombre === filtroEstado
    )
    .sort((a, b) => {
      if (orden === "fechaDesc") {
        return new Date(b.fecha_respuesta) - new Date(a.fecha_respuesta);
      }
      if (orden === "fechaAsc") {
        return new Date(a.fecha_respuesta) - new Date(b.fecha_respuesta);
      }
      if (orden === "codigo") {
        return a.codigo_cotizacion.localeCompare(b.codigo_cotizacion);
      }
      return 0;
    });

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 24
        }}
      >
        Cargando cotizaciones...
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
      }}>
        <h1 className="titulo">Cotizaciones</h1>

        <div style={{ width: '100%', height: '100%', paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10, background: getColor('blanco'), boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)', overflow: 'hidden', borderRadius: 16, outline: '1px #444444 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>

            <div style={{ alignSelf: 'stretch', padding: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 15, display: 'inline-flex' }}>

              {/* BUSCADOR */}
              <div style={{ flex: '1 1 0', height: 30, background: '#F9F9F9', overflow: 'hidden', borderRadius: 8, outline: '1px #444444 solid', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                <div style={{ flex: '1 1 0', alignSelf: 'stretch', padding: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                  <input
                    placeholder="Buscar cotización..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ color: '#000000', fontSize: 16, fontFamily: 'Lato', fontWeight: '400', lineHeight: '19.20px', border: 'none', outline: 'none', width: '100%', background: 'transparent' }}
                  />
                </div>
                <div style={{ width: 50, alignSelf: 'stretch', padding: 10, background: '#F9F9F9', boxShadow: '-4px 0px 4px rgba(0, 0, 0, 0.25)', overflow: 'hidden', borderLeft: '1px #1D1D1D solid', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
                  <div className="icono-accion"><IconoLupa /></div>
                </div>
              </div>

              {/* FILTRO */}
              <div style={{ height: 30, background: '#ffffff', overflow: 'hidden', borderRadius: 8, outline: '1px #444444 solid', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
                <div style={{ alignSelf: 'stretch', padding: 10, background: '#F9F9F9', overflow: 'hidden', borderRight: '1px #444444 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                  <div style={{ color: '#1D1D1D', fontSize: 16, fontFamily: 'Lato', fontWeight: '700' }}>Filtrar por:</div>
                </div>
                <div style={{ alignSelf: 'stretch', padding: 10, background: '#F9F9F9', boxShadow: '2px 0px 2px rgba(0, 0, 0, 0.25) inset', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                  <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 16 }}>
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
                  <div style={{ color: '#1D1D1D', fontSize: 16, fontFamily: 'Lato', fontWeight: '700' }}>Ordenar por:</div>
                </div>
                <div style={{ alignSelf: 'stretch', padding: 10, background: '#F9F9F9', boxShadow: '2px 0px 2px rgba(0, 0, 0, 0.25) inset', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                  <select value={orden} onChange={(e) => setOrden(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 16 }}>
                    <option value="default">Por defecto</option>
                    <option value="fechaDesc">Más recientes</option>
                    <option value="fechaAsc">Más antiguos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TABLA */}
            <div style={{ alignSelf: 'stretch', flex: '1 1 0', overflow: 'hidden', borderRadius: 8, outline: '1px #000000 solid', outlineOffset: '-1px', display: 'flex', flexDirection: 'column' }}>

              {/* HEADER - 4 columnas de datos + 1 de acción */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 120px', background: '#FFCC00', padding: 10, fontWeight: '700' }}>
                <div>Código</div>
                <div>Proveedor</div>
                <div>Estado</div>
                <div>Fecha de Respuesta</div>
                <div></div>
              </div>

              {cotizacionesFiltradas.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: '#888', fontFamily: 'Lato' }}>
                  No se encontraron cotizaciones.
                </div>
              )}

              {cotizacionesFiltradas.map((cotizacion, index) => (
                <div
                  key={cotizacion.id_cotizacion ?? cotizacion.codigo_cotizacion}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 120px', padding: 10, background: index % 2 === 0 ? '#ffffff' : '#CECECE', alignItems: 'center' }}
                >
                  <div>{cotizacion.codigo_cotizacion}</div>
                  <div>
                    {[cotizacion.proveedores?.personas?.nombre, cotizacion.proveedores?.personas?.apellido]
                      .filter(Boolean).join(" ") || "—"}
                  </div>
                  <div>{cotizacion.estados?.nombre ?? "—"}</div>
                  <div>{cotizacion.fecha_respuesta ?? "—"}</div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      style={{
                        border: "none",
                        background: getColor("amarillo"),
                        borderRadius: 6,
                        cursor: "pointer",
                        padding: "5px 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => navigate(`/compras/cotizaciones/${cotizacion.codigo_cotizacion}`)}
                    >
                      <IconoLupa />
                    </button>
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

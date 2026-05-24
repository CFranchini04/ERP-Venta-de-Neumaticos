import React from "react";
import Sidebar from "../../../components/Sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { IconoLupa } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";

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
        const response = await fetch(
          "http://localhost:9128/api/compras/cotizaciones/tabla"
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
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
    .filter((c) => {
      const texto = busqueda.toLowerCase();
      const proveedor = `${c.proveedores?.personas?.nombre ?? ""} ${c.proveedores?.personas?.apellido ?? ""}`.toLowerCase();
      const pedidoCodigo = c.pedidos_compras?.codigo_pedido?.toLowerCase() ?? "";
      return (
        c.codigo_cotizacion?.toLowerCase().includes(texto) ||
        c.estados?.nombre?.toLowerCase().includes(texto) ||
        c.fecha_respuesta?.toLowerCase().includes(texto) ||
        proveedor.includes(texto) ||
        pedidoCodigo.includes(texto)
      );
    })
    .filter((c) =>
      filtroEstado === "Todos" ? true : c.estados?.nombre === filtroEstado
    )
    .sort((a, b) => {
      if (orden === "fechaDesc") return new Date(b.fecha_respuesta) - new Date(a.fecha_respuesta);
      if (orden === "fechaAsc") return new Date(a.fecha_respuesta) - new Date(b.fecha_respuesta);
      if (orden === "codigo") return (a.codigo_cotizacion ?? "").localeCompare(b.codigo_cotizacion ?? "");
      return 0;
    });

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 24 }}>
        Cargando cotizaciones...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <div style={{ flex: 1, padding: "10px", background: "#ffffff", textAlign: "center", overflowY: "auto" }}>
        <h1 className="titulo">Cotizaciones</h1>

        <div style={{ width: "100%", height: "100%", paddingLeft: 25, paddingRight: 25, paddingTop: 10, paddingBottom: 10, overflow: "hidden", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", gap: 10, display: "inline-flex" }}>
          <div style={{ alignSelf: "stretch", flex: "1 1 0", paddingLeft: 25, paddingRight: 25, paddingTop: 10, paddingBottom: 10, background: "#F9F9F9", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.25)", overflow: "hidden", borderRadius: 16, outline: "1px #444444 solid", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", gap: 10, display: "flex" }}>

            {/* CONTROLES */}
            <div style={{ alignSelf: "stretch", padding: 10, overflow: "hidden", justifyContent: "flex-start", alignItems: "center", gap: 25, display: "inline-flex" }}>

              {/* BUSCADOR */}
              <div style={{ flex: "1 1 0", height: 30, background: "#F9F9F9", overflow: "hidden", borderRadius: 8, outline: "1px #444444 solid", justifyContent: "center", alignItems: "center", display: "flex" }}>
                <div style={{ flex: "1 1 0", alignSelf: "stretch", padding: 10, overflow: "hidden", justifyContent: "flex-start", alignItems: "center", gap: 10, display: "flex" }}>
                  <input
                    placeholder="Buscar cotización, proveedor o pedido..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ color: "#444444", fontSize: 16, fontFamily: "Lato", fontWeight: "400", lineHeight: "19.20px", border: "none", outline: "none", width: "100%", background: "transparent" }}
                  />
                </div>
                <div style={{ width: 50, alignSelf: "stretch", padding: 10, background: "#F9F9F9", boxShadow: "-4px 0px 4px rgba(0, 0, 0, 0.25)", overflow: "hidden", borderLeft: "1px #1D1D1D solid", justifyContent: "center", alignItems: "center", gap: 10, display: "flex" }}>
                  <IconoLupa />
                </div>
              </div>

              {/* FILTRO ESTADO */}
              <div style={{ height: 30, background: "#F9F9F9", overflow: "hidden", borderRadius: 8, outline: "1px #444444 solid", justifyContent: "flex-start", alignItems: "flex-start", display: "flex" }}>
                <div style={{ alignSelf: "stretch", padding: 10, background: "#F9F9F9", overflow: "hidden", borderRight: "1px #444444 solid", justifyContent: "flex-start", alignItems: "center", gap: 10, display: "flex" }}>
                  <div style={{ color: "#1D1D1D", fontSize: 16, fontFamily: "Lato", fontWeight: "700" }}>Filtrar por:</div>
                </div>
                <div style={{ alignSelf: "stretch", padding: 10, background: "#F9F9F9", boxShadow: "2px 0px 2px rgba(0, 0, 0, 0.25) inset", overflow: "hidden", justifyContent: "flex-start", alignItems: "center", gap: 10, display: "flex" }}>
                  <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 16 }}>
                    <option value="Todos">Por defecto</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="En Espera">En Espera</option>
                    <option value="Cancelado">Cancelado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              {/* ORDENAR */}
              <div style={{ height: 30, background: "#F9F9F9", overflow: "hidden", borderRadius: 8, outline: "1px #444444 solid", justifyContent: "flex-start", alignItems: "flex-start", display: "flex" }}>
                <div style={{ alignSelf: "stretch", padding: 10, background: "#F9F9F9", overflow: "hidden", borderRight: "1px #444444 solid", justifyContent: "flex-start", alignItems: "center", gap: 10, display: "flex" }}>
                  <div style={{ color: "#1D1D1D", fontSize: 16, fontFamily: "Lato", fontWeight: "700" }}>Ordenar por:</div>
                </div>
                <div style={{ alignSelf: "stretch", padding: 10, background: "#F9F9F9", boxShadow: "2px 0px 2px rgba(0, 0, 0, 0.25) inset", overflow: "hidden", justifyContent: "flex-start", alignItems: "center", gap: 10, display: "flex" }}>
                  <select value={orden} onChange={(e) => setOrden(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 16 }}>
                    <option value="default">Por defecto</option>
                    <option value="fechaDesc">Más recientes</option>
                    <option value="fechaAsc">Más antiguos</option>
                    <option value="codigo">Código</option>
                  </select>
                </div>
              </div>

            </div>

            {/* TABLA */}
            <div style={{ alignSelf: "stretch", flex: "1 1 0", overflow: "hidden", borderRadius: 8, outline: "1px #1D1D1D solid", outlineOffset: "-1px", display: "flex", flexDirection: "column" }}>

              {/* HEADER — 5 columnas: Código | Pedido | Proveedor | Estado | Fecha | Acción */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 1fr 1fr 80px", background: "#FFCC00", padding: 10, fontWeight: "700", textAlign: "center" }}>
                <div>Código</div>
                <div>Pedido</div>
                <div>Proveedor</div>
                <div>Estado</div>
                <div>Fecha</div>
                <div></div>
              </div>

              {cotizacionesFiltradas.length === 0 && (
                <div style={{ padding: 20, textAlign: "center", color: "#888", fontFamily: "Lato" }}>
                  No se encontraron cotizaciones.
                </div>
              )}

              {cotizacionesFiltradas.map((cot, index) => {
                const proveedor = `${cot.proveedores?.personas?.nombre ?? ""} ${cot.proveedores?.personas?.apellido ?? ""}`.trim() || "—";
                const pedidoCodigo = cot.pedidos_compras?.codigo_pedido ?? "—";
                const estado = cot.estados?.nombre ?? "—";
                const fecha = cot.fecha_respuesta ?? "—";

                return (
                  <div
                    key={cot.codigo_cotizacion ?? index}
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 1fr 1fr 80px", padding: 10, background: index % 2 === 0 ? "#F9F9F9" : "#CECECE", alignItems: "center", textAlign: "center" }}
                  >
                    <div>{cot.codigo_cotizacion ?? "—"}</div>
                    <div>{pedidoCodigo}</div>
                    <div>{proveedor}</div>
                    <div>{estado}</div>
                    <div>{fecha}</div>
                    <div style={{ display: "flex", justifyContent: "center", cursor: "pointer" }}
                      onClick={() => navigate(`/compras/cotizaciones/${cot.codigo_cotizacion}`)}
                    >
                      <button style={{ border: "none", background: getColor("amarillo"), borderRadius: 6, cursor: "pointer", padding: "5px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconoLupa />
                      </button>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import List from "../../../components/Lista";


export default function OrdenesCompra({ usuario, onNavegar, onLogout }) {

  const pedidosIniciales = [
    { id: 1, codigo: "ODC_004", estado: "Aprobado", fecha: "2026-04-05" },
    { id: 2, codigo: "ODC_003", estado: "En Espera", fecha: "2026-03-21" },
    { id: 3, codigo: "ODC_002", estado: "Cancelado", fecha: "2026-01-30" },
    { id: 4, codigo: "ODC_001", estado: "Aprobado", fecha: "2025-12-28" }
  ];

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [orden, setOrden] = useState("");

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
      !filtroEstado ? true : p.estado === filtroEstado
    )
    .sort((a, b) => {
      if (orden === "fechaDesc") return new Date(b.fecha) - new Date(a.fecha);
      if (orden === "fechaAsc") return new Date(a.fecha) - new Date(b.fecha);
      if (orden === "codigo") return a.codigo.localeCompare(b.codigo);
      return 0;
    });

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "estado", label: "Estado" },
    { key: "fecha", label: "Fecha de Creación" }
  ];

  return (
    <div style={styles.pagina}>

      <Sidebar
        usuario={usuario}
        onNavegar={onNavegar}
        onLogout={onLogout}
      />

      <main style={styles.contenido}>

        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Ordenes de Compra</h1>
          <div style={styles.separador} />
        </header>

        <div style={{ width: "100%", maxWidth: 860 }}>
          <List
            data={pedidosFiltrados}
            columns={columns}
            selectable
            onRowClick={(pedido) => {
              onNavegar("informacion-orden", pedido);
            }}
            controls={[
              {
                type: "search",
                placeholder: "Buscar orden...",
                value: busqueda,
                onChange: (e) => setBusqueda(e.target.value)
              },
              {
                type: "select",
                placeholder: "Filtrar por estado",
                value: filtroEstado,
                onChange: (e) => setFiltroEstado(e.target.value),
                options: [
                  { key: "Aprobado", label: "Aprobado" },
                  { key: "En Espera", label: "En Espera" },
                  { key: "Cancelado", label: "Cancelado" }
                ]
              },
              {
                type: "select",
                placeholder: "Ordenar por",
                value: orden,
                onChange: (e) => setOrden(e.target.value),
                options: [
                  { key: "fechaDesc", label: "Más recientes" },
                  { key: "fechaAsc", label: "Más antiguos" },
                  { key: "codigo", label: "Código" }
                ]
              }
            ]}
          />
        </div>

      </main>
    </div>
  );
}
const styles = {
  pagina: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F5F5F5',
  },

  contenido: {
    flex: 1,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  encabezado: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '21px 0',
  },
  titulo: {
    color: '#000000',
    fontSize: 42,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textAlign: 'center',

  },
  separador: {
    width: 'min(1100px, 80%)',
    height: 4,
    background: '#000000',
  },
};

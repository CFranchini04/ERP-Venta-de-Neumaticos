// Sidebar.jsx
import React from "react";
import { IconoSalir } from "./Icons";
import { MODULOS } from "./modules";
import LogoFukuchi from "../LogoFukuchi.png";
import { getColor } from "./Colors";

export default function Sidebar({ usuario, onNavegar, onLogout }) {
  function handleSalir() {
    if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      onLogout();
    }
  }

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <button
        onClick={() => onNavegar('home')}
        style={styles.sidebarTituloContainer}
        title="Ir a inicio"
      >
        <img
          src={LogoFukuchi}
          alt="Logo Neumáticos FUKUCHI"
          style={styles.sidebarLogo}
        />
      </button>

      {/* Navegación */}
      <nav style={styles.sidebarNav}>
        {MODULOS.map((m) => (
          <button
            key={m.id}
            onClick={() => onNavegar(m.id)}
            style={styles.sidebarItem}
          >
            <span style={styles.sidebarItemIcono}>{m.icon}</span>
            <span style={styles.sidebarItemLabel}>{m.label}</span>
            <span style={styles.sidebarFlecha}>›</span>
          </button>
        ))}
      </nav>

      {/* Usuario */}
      <div style={styles.sidebarUsuario}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          style={{ color: getColor("blanco") }}
        >
          <path
            fill="currentColor"
            d="M8 8.5c3.85 0 7 2.5 7 4.5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2c0-2 3.15-4.5 7-4.5M8 10c-1.61 0-3.064.526-4.092 1.234C2.798 12.001 2.798 12.001 2.5 13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5c0-.267-.297-1-1.408-1.766C11.064 10.526 9.609 10 8 10m0-9a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7m0 1.5a2 2 0 1 0 0 4a2 2 0 0 0 0-4"
          />
        </svg>

        <span style={styles.sidebarUsuarioNombre}>{usuario}</span>

        <button
          onClick={handleSalir}
          style={styles.sidebarBotonSalir}
          title="Log Out"
        >
          <IconoSalir />
        </button>
      </div>
    </aside>
  );
}

//  Estilos para sidebar
const styles = {
  sidebar: {
    width: 250,
    minWidth: 250,
    height: "100vh",
    background: getColor("negro"),
    borderRight: `1px solid ${getColor("negro")}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 45,
    paddingBottom: 45,
    gap: 30,
    boxSizing: "border-box",
  },

  sidebarTituloContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  sidebarLogo: {
    width: 210,
    height: "auto",
    objectFit: "contain",
  },

  sidebarNav: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 1,
    flex: 1,
  },

  sidebarItem: {
    width: "100%",
    height: 60,
    padding: 10,
    background: getColor("amarillo"),
    border: "none",
    borderBottom: `2px solid ${getColor("negro")}`,
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    boxSizing: "border-box",
  },

  sidebarItemIcono: {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: getColor("negro"), 
  },

  sidebarItemLabel: {
    color: getColor("negro"),
    fontSize: 22,
    fontFamily: "Lato, sans-serif",
    fontWeight: 700,
    flex: 1,
    textAlign: "left",
  },

  sidebarFlecha: {
    color: getColor("negro"),
    fontSize: 22,
    fontWeight: 700,
  },

  sidebarUsuario: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },

  sidebarUsuarioNombre: {
    color: getColor("blanco"),
    fontSize: 20,
    fontFamily: "Lato, sans-serif",
    textAlign: "center",
  },

  sidebarBotonSalir: {
    width: 100,
    height: 50,
    background: getColor("blanco"),
    border: "none",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
};

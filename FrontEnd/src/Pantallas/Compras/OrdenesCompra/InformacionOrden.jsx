import React, { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import { Button } from "../../../components/Buttons";

export default function InformacionOrden({
  usuario,
  orden,
  onVolver,
  onLogout,
  onNavegar
}) {

  if (!orden) {
    return <div>No hay orden seleccionada</div>;
  }

  return (
    <div style={styles.pagina}>

      <Sidebar
        usuario={usuario}
        onNavegar={onNavegar}
        onLogout={onLogout}
      />

      <main style={styles.contenido}>

        <h1>Información de Orden</h1>

        <div style={styles.card}>
          <p><strong>Código:</strong> {orden.codigo}</p>
          <p><strong>Estado:</strong> {orden.estado}</p>
          <p><strong>Fecha:</strong> {orden.fecha}</p>
        </div>

        <Button
          label="Volver"
          onClick={onVolver}
          variant="amarillo"
        />

      </main>
    </div>
  );
}

const styles = {
  pagina: {
    display: "flex",
    minHeight: "100vh",
    background: "#F5F5F5",
  },

  contenido: {
    flex: 1,
    padding: 30,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },

  card: {
    width: "100%",
    maxWidth: 600,
    background: "white",
    padding: 20,
    borderRadius: 8,
    border: "2px solid black",
  },
};

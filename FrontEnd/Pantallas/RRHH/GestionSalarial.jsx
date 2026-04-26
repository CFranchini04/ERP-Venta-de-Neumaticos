import React from 'react';
import Sidebar from "../../components/Sidebar";
import { Button } from '../../components/Button';

export default function GestionPersonal({ usuario, empleado, onVolver, onLogout, onNavegar }) {

  if (!empleado) return <div>No hay empleado seleccionado</div>;

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <h1>{"Gestion Salarial"}</h1>
        <h2>{empleado.nombre} {empleado.apellido}</h2>
        <p>Cargo: {empleado.cargo}</p>

        <Button label="Volver" 
        onClick={onVolver}
        variant="amarillo" />
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
  },
};
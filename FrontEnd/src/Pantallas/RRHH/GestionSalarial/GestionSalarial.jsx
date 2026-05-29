import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import { Button } from '../../../components/Buttons';
import fetchConToken from '../../../token';
import { getColor } from '../../../components/Colors';

export default function GestionSalarial({ usuario, onVolver, onLogout, onNavegar }) {
  const { id } = useParams();
  const [empleado, setEmpleado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [periodo, setPeriodo] = useState({
    fechaInicio: "",
    fechaFin: ""
  });

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

  useEffect(() => {
    if (!id) {
      setCargando(false);
      return;
    }

    const cargarEmpleado = async () => {
      try {
        const res = await fetchConToken(`${API_BASE}/rrhh/empleados/${id}`);
        const data = await res.json();
        console.log("Respuesta de la API:", data);

        setEmpleado({
          nombre: data?.personas?.nombre ?? '',
          apellido: data?.personas?.apellido ?? '',
          cargo: data?.personas_horario_cargo?.[0]?.cargo?.nombre ?? '',
        });
      } catch (error) {
        console.error("Error cargando empleado:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarEmpleado();
  }, [id]);

  if (cargando) return <div>Cargando...</div>;

  if (!empleado) return <div>No hay empleado seleccionado</div>;

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>

        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Gestion Salarial</h1>
        </header>

        <div style={styles.contenedorEmpleado}>

          <div style={styles.infoEmpleado}>
            <span style={styles.labelInfo}>Nombre:</span>
            <span style={styles.valorInfo}>
              {empleado.nombre}
            </span>
          </div>

          <div style={styles.infoEmpleado}>
            <span style={styles.labelInfo}>Cargo:</span>
            <span style={styles.valorInfo}>
              {empleado.cargo}
            </span>
          </div>

          <div style={styles.periodoContainer}>

            <div style={styles.periodoCard}>
              <span style={styles.dataLabel}>Fecha de Inicio</span>

              <input
                type="date"
                value={periodo.fechaInicio}
                onChange={(e) =>
                  setPeriodo({
                    ...periodo,
                    fechaInicio: e.target.value
                  })
                }
                style={styles.inputFecha}
              />
            </div>

            <div style={styles.periodoCard}>
              <span style={styles.dataLabel}>Fecha de Fin</span>

              <input
                type="date"
                value={periodo.fechaFin}
                onChange={(e) =>
                  setPeriodo({
                    ...periodo,
                    fechaFin: e.target.value
                  })
                }
                style={styles.inputFecha}
              />
            </div>

          </div>

          <div style={styles.botonContainer}>
            <button
              style={styles.btnContinuar}
              onClick={() => onNavegar("siguientePagina")}
            >
              Continuar
            </button>
          </div>

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
  },
  pagina: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    background: '#F9F9F9',
    fontFamily: 'Lato, sans-serif',
    overflow: 'hidden',
  },
  contenido: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    textAlign: 'center',
    padding: 0,
    boxSizing: 'border-box',
    gap: 20,
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
    fontSize: 35,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textAlign: 'center',
    marginTop: 15,
  },
  contenedorEmpleado: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    padding: 24,
  },

  infoEmpleado: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    fontSize: 18,
  },

  labelInfo: {
    fontWeight: 700,
    color: "#555",
  },

  valorInfo: {
    color: "#1D1D1D",
  },

  periodoContainer: {
    display: "flex",
    gap: 20,
    marginTop: 10,
  },

  periodoCard: {
    flex: 1,
    background: "#F9F9F9",
    border: "1px solid #E5E5E5",
    borderRadius: 10,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  botonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 10,
  },

  btnContinuar: {
    background: getColor("amarillo"),
    color: "#1D1D1D",
    border: "none",
    borderRadius: 8,
    padding: "12px 24px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Lato",
  },
  inputFecha: {
    width: "100%",
    border: "1px solid #D0D0D0",
    borderRadius: 8,
    padding: "10px 12px",
    fontFamily: "Lato",
    fontSize: 14,
    outline: "none",
    background: "#FFFFFF",
    boxSizing: "border-box",
    cursor: "pointer",
  },
};

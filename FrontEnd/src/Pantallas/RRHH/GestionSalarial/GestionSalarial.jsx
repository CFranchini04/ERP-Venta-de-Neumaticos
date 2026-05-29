import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import fetchConToken from '../../../token';
import { getColor } from '../../../components/Colors';

export default function GestionSalarial({ usuario, onLogout, onNavegar }) {
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

        setEmpleado({
          nombre: data?.personas?.nombre ?? '',
          apellido: data?.personas?.apellido ?? '',
          cargo: data?.personas_horario_cargo?.[0]?.cargo?.nombre ?? '',
        });
      } catch (error) {
        console.error(error);
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

        <h1 style={styles.titulo}>Gestión Salarial</h1>

        {/* ================= EMPLEADO ================= */}
        <div style={styles.seccionEmpleado}>

          <div style={styles.infoEmpleadoContainer}>

            <div style={styles.infoEmpleado}>
              <span style={styles.labelInfo}>Nombre:</span>
              <span style={styles.valorInfo}>{empleado.nombre}</span>
            </div>

            <div style={styles.infoEmpleado}>
              <span style={styles.labelInfo}>Cargo:</span>
              <span style={styles.valorInfo}>{empleado.cargo}</span>
            </div>

          </div>

        </div>

        {/* ================= PERIODO ================= */}
        <div style={styles.seccionPeriodo}>

          <div style={styles.periodoGeneral}>

            <span style={styles.tituloPeriodo}>
              Seleccionar Período
            </span>

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

          </div>

        </div>

        {/* ================= BOTÓN ================= */}
        <div style={styles.botonContainer}>
          <button
            style={styles.btnContinuar}
            onClick={() => onNavegar("siguientePagina")}
          >
            Continuar
          </button>
        </div>

      </main>
    </div>
  );
}

const styles = {

  pagina: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    background: "#F9F9F9",
    fontFamily: "Lato, sans-serif",
  },

  contenido: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "20px 40px",
    gap: 25,
  },

  titulo: {
    fontSize: 35,
    fontWeight: 700,
    marginTop: 10,
  },

  seccionEmpleado: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    paddingLeft: 10,
  },

  infoEmpleadoContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  infoEmpleado: {
    display: "flex",
    gap: 8,
    fontSize: 18,
  },

  labelInfo: {
    fontWeight: 700,
    color: "#555",
  },

  valorInfo: {
    color: "#1D1D1D",
  },

  seccionPeriodo: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },

  periodoGeneral: {
    width: "100%",
    maxWidth: 750,
    background: "#F5F5F5",
    border: "1px solid #E5E5E5",
    borderRadius: 12,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  tituloPeriodo: {
    fontSize: 18,
    fontWeight: 700,
  },

  periodoContainer: {
    display: "flex",
    gap: 20,
    justifyContent: "center",
  },

  periodoCard: {
    flex: 1,
    background: "#fff",
    border: "1px solid #E5E5E5",
    borderRadius: 10,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  dataLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#777",
  },

  inputFecha: {
    width: "100%",
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  botonContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },

  btnContinuar: {
    background: getColor("amarillo"),
    border: "none",
    padding: "12px 24px",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
  }
};

// HomePage.jsx
// Pantalla principal

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Sidebar from "../../components/Sidebar";
import ModuloCard from "../../components/ModuloCard";
import { MODULOS } from "../../components/modules";
import { getColor } from "../../components/Colors";
import fetchConToken from "../../token";

// ─── Rutas disponibles del sistema ───────────────────────────────────────────
const RUTAS_SISTEMA = [
  { id: "rrhh", label: "RRHH", path: "/rrhh" },
  { id: "compras", label: "Compras", path: "/compras" },
  { id: "ventas", label: "Ventas", path: "/ventas" },
  { id: "tesoreria", label: "Tesorería", path: "/tesoreria" },
  {
    id: "contabilidad",
    label: "Contabilidad",
    path: "/contabilidad",
  },
];

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:9128";

// ─── Modal de Permisos ────────────────────────────────────────────────────────
function ModalPermisos({ onCerrar }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(null); // id del usuario que se está guardando
  const [usuarioAEliminar, setUsuarioAEliminar] =
    useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [mostrarFormNuevo, setMostrarFormNuevo] =
    useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    password: "",
    rutas: [],
  });
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");
  const [errorGlobal, setErrorGlobal] = useState("");

  // ── Cargar usuarios desde Supabase ──
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setErrorGlobal("");
      try {
        const res = await fetchConToken(
          `${API_BASE}/auth/usuarios`,
        );
        if (!res)
          throw new Error(
            `Sin respuesta del servidor (URL: ${API_BASE}/auth/usuarios). Verificá que el backend esté corriendo y el token sea válido.`,
          );
        if (!res.ok) {
          let detalle = "";
          try {
            const body = await res.json();
            detalle = body.message || JSON.stringify(body);
          } catch {}
          throw new Error(
            `Error ${res.status} en /auth/usuarios${detalle ? ": " + detalle : ""}`,
          );
        }
        const data = await res.json();
        setUsuarios(
          data.map((u) => ({
            ...u,
            rutas: u.rol === "admin" ? null : (u.rutas ?? []),
          })),
        );
      } catch (e) {
        setErrorGlobal(e.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // ── Togglear ruta de un usuario ──
  const toggleRuta = (usuarioId, path) => {
    setUsuarios((prev) =>
      prev.map((u) => {
        if (u.id !== usuarioId) return u;
        const rutas = u.rutas.includes(path)
          ? u.rutas.filter((r) => r !== path)
          : [...u.rutas, path];
        return { ...u, rutas };
      }),
    );
  };

  // ── Guardar permisos de un usuario ──
  const handleGuardar = async (u) => {
    setGuardando(u.id);
    try {
      const res = await fetchConToken(
        `${API_BASE}/auth/usuarios/${u.id}/permisos`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rutas: u.rutas }),
        },
      );
      if (!res || !res.ok) throw new Error("Error al guardar");
    } catch {
      setErrorGlobal(
        "Error al guardar los permisos. Intentá de nuevo.",
      );
    } finally {
      setGuardando(null);
    }
  };

  // ── Eliminar usuario ──
  const handleConfirmarEliminar = async () => {
    setEliminando(true);
    try {
      const res = await fetchConToken(
        `${API_BASE}/auth/usuarios/${usuarioAEliminar.id}`,
        {
          method: "DELETE",
        },
      );
      if (!res || !res.ok) throw new Error("Error al eliminar");
      setUsuarios((prev) =>
        prev.filter((u) => u.id !== usuarioAEliminar.id),
      );
      setUsuarioAEliminar(null);
    } catch {
      setErrorGlobal("Error al eliminar el usuario.");
      setUsuarioAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  // ── Crear usuario nuevo ──
  const handleCrearUsuario = async () => {
    setError("");
    if (
      !nuevoUsuario.nombre.trim() ||
      !nuevoUsuario.email.trim() ||
      !nuevoUsuario.password.trim()
    ) {
      setError("Nombre, correo y contraseña son obligatorios.");
      return;
    }
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoUsuario.email)
    ) {
      setError("Correo electrónico no válido.");
      return;
    }
    setCreando(true);
    try {
      const res = await fetchConToken(
        `${API_BASE}/auth/usuarios`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoUsuario),
        },
      );
      if (!res || !res.ok)
        throw new Error("Error al crear usuario");
      const creado = await res.json();
      setUsuarios((prev) => [
        ...prev,
        { ...creado, rutas: creado.rutas ?? [] },
      ]);
      setNuevoUsuario({
        nombre: "",
        email: "",
        password: "",
        rutas: [],
      });
      setMostrarFormNuevo(false);
    } catch {
      setError(
        "No se pudo crear el usuario. Verificá los datos.",
      );
    } finally {
      setCreando(false);
    }
  };

  return (
    <div style={ms.overlay}>
      <div style={ms.modal}>
        {/* Encabezado */}
        <div style={ms.header}>
          <h2 style={ms.titulo}>Gestión de Permisos</h2>
          <button style={ms.btnCerrar} onClick={onCerrar}>
            ✕
          </button>
        </div>

        {errorGlobal && (
          <p style={ms.errorGlobal}>{errorGlobal}</p>
        )}

        {/* Contenido */}
        {cargando ? (
          <p style={ms.cargando}>Cargando usuarios…</p>
        ) : (
          <div style={ms.listaUsuarios}>
            {usuarios.map((u) => (
              <div key={u.id} style={ms.tarjetaUsuario}>
                {/* Info usuario */}
                <div style={ms.usuarioInfo}>
                  <div>
                    <span style={ms.usuarioNombre}>
                      {u.nombre}
                    </span>
                    <span style={ms.usuarioEmail}>
                      {u.email}
                    </span>
                  </div>
                  {u.rol === "admin" ? (
                    <span style={ms.badgeAdmin}>
                      Administrador
                    </span>
                  ) : (
                    <div style={ms.acciones}>
                      <button
                        style={{
                          ...ms.btnGuardar,
                          opacity: guardando === u.id ? 0.6 : 1,
                        }}
                        disabled={guardando === u.id}
                        onClick={() => handleGuardar(u)}
                      >
                        {guardando === u.id
                          ? "Guardando…"
                          : "Guardar"}
                      </button>
                      <button
                        style={ms.btnEliminar}
                        onClick={() => setUsuarioAEliminar(u)}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>

                {/* Rutas */}
                {u.rol === "admin" ? (
                  <p style={ms.adminTexto}>
                    Acceso total a todas las rutas (no
                    modificable)
                  </p>
                ) : (
                  <div style={ms.rutasGrid}>
                    {RUTAS_SISTEMA.map((r) => {
                      const checked = u.rutas.includes(r.path);
                      return (
                        <label
                          key={r.id}
                          style={{
                            ...ms.checkLabel,
                            ...(checked
                              ? ms.checkLabelActivo
                              : {}),
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleRuta(u.id, r.path)
                            }
                            style={ms.checkbox}
                          />
                          {r.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Formulario nuevo usuario */}
        {mostrarFormNuevo && (
          <div style={ms.formNuevo}>
            <h3 style={ms.subtitulo}>Nuevo usuario</h3>
            {error && <p style={ms.error}>{error}</p>}
            <div style={ms.formFila}>
              <input
                style={ms.input}
                placeholder="Nombre completo"
                value={nuevoUsuario.nombre}
                onChange={(e) =>
                  setNuevoUsuario((p) => ({
                    ...p,
                    nombre: e.target.value,
                  }))
                }
              />
              <input
                style={ms.input}
                placeholder="Correo electrónico"
                value={nuevoUsuario.email}
                onChange={(e) =>
                  setNuevoUsuario((p) => ({
                    ...p,
                    email: e.target.value,
                  }))
                }
              />
              <input
                style={ms.input}
                placeholder="Contraseña"
                type="password"
                value={nuevoUsuario.password}
                onChange={(e) =>
                  setNuevoUsuario((p) => ({
                    ...p,
                    password: e.target.value,
                  }))
                }
              />
            </div>
            <p style={ms.labelRutas}>Acceso a módulos:</p>
            <div style={ms.rutasGrid}>
              {RUTAS_SISTEMA.map((r) => {
                const checked = nuevoUsuario.rutas.includes(
                  r.path,
                );
                return (
                  <label
                    key={r.id}
                    style={{
                      ...ms.checkLabel,
                      ...(checked ? ms.checkLabelActivo : {}),
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const rutas = checked
                          ? nuevoUsuario.rutas.filter(
                              (x) => x !== r.path,
                            )
                          : [...nuevoUsuario.rutas, r.path];
                        setNuevoUsuario((p) => ({
                          ...p,
                          rutas,
                        }));
                      }}
                      style={ms.checkbox}
                    />
                    {r.label}
                  </label>
                );
              })}
            </div>
            <div style={ms.formAcciones}>
              <button
                style={{
                  ...ms.btnCrear,
                  opacity: creando ? 0.6 : 1,
                }}
                disabled={creando}
                onClick={handleCrearUsuario}
              >
                {creando ? "Creando…" : "Crear usuario"}
              </button>
              <button
                style={ms.btnCancelar}
                onClick={() => {
                  setMostrarFormNuevo(false);
                  setError("");
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Pie */}
        {!mostrarFormNuevo && !cargando && (
          <div style={ms.pie}>
            <button
              style={ms.btnNuevo}
              onClick={() => setMostrarFormNuevo(true)}
            >
              + Nuevo usuario
            </button>
          </div>
        )}
      </div>

      {/* Modal advertencia eliminación */}
      {usuarioAEliminar && (
        <div style={ms.overlayAdvertencia}>
          <div style={ms.modalAdvertencia}>
            <div style={ms.iconoAdvert}>
              <svg
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="11"
                  stroke="#c62828"
                  strokeWidth="2"
                  fill="#fff3f3"
                />
                <path
                  d="M12 7v5"
                  stroke="#c62828"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="16.5"
                  r="1.2"
                  fill="#c62828"
                />
              </svg>
            </div>
            <h3 style={ms.tituloAdvert}>¿Eliminar usuario?</h3>
            <p style={ms.textoAdvert}>
              Estás por eliminar a{" "}
              <strong>{usuarioAEliminar.nombre}</strong>.<br />
              Esta acción no se puede deshacer.
            </p>
            <div style={ms.advertAcciones}>
              <button
                style={{
                  ...ms.btnConfirmarElim,
                  opacity: eliminando ? 0.6 : 1,
                }}
                disabled={eliminando}
                onClick={handleConfirmarEliminar}
              >
                {eliminando ? "Eliminando…" : "Sí, eliminar"}
              </button>
              <button
                style={ms.btnCancelar}
                onClick={() => setUsuarioAEliminar(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function HomePage() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [modalPermisos, setModalPermisos] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={styles.pagina}>
      <Sidebar
        usuario={usuario?.nombre}
        onNavegar={(path) => navigate(path)}
        onLogout={handleLogout}
      />

      <main style={styles.main}>
        <header style={styles.encabezado}>
          <h1 style={styles.tituloBienvenida}>
            Bienvenido,{" "}
            {usuario?.nombre ||
              usuario?.display_name ||
              usuario?.email ||
              "Usuario"}
          </h1>
          <div style={styles.lineaEncabezado} />
        </header>

        <section style={styles.contenedor}>
          <div style={styles.tituloContenedor}>
            <h2 style={styles.tituloContenedorTexto}>
              ¿A qué módulo desea acceder?
            </h2>
            <div style={styles.lineaContenedor} />
          </div>

          <div style={styles.modulosGrid}>
            {MODULOS.map((m) => (
              <ModuloCard
                key={m.id}
                label={m.label}
                icon={m.icon}
                onClick={() => navigate(`/${m.id}`)}
              />
            ))}
          </div>

          {(usuario?.rol === "admin" ||
            usuario?.user_metadata?.rol === "admin") && (
            <button
              style={styles.btnPermisos}
              onClick={() => setModalPermisos(true)}
            >
              Modificar Permisos
            </button>
          )}
        </section>
      </main>

      {modalPermisos && (
        <ModalPermisos
          onCerrar={() => setModalPermisos(false)}
        />
      )}
    </div>
  );
}

// ─── Estilos página ───────────────────────────────────────────────────────────
const styles = {
  pagina: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    background: getColor("blanco"),
    fontFamily: "Lato, sans-serif",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "21px 50px",
    gap: 40,
    boxSizing: "border-box",
  },
  encabezado: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "21px 0",
  },
  tituloBienvenida: {
    color: getColor("negro"),
    fontSize: "42px",
    fontFamily: "Lato, sans-serif",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textAlign: "center",
  },
  lineaEncabezado: {
    width: "min(1100px, 80%)",
    height: 4,
    background: getColor("negro"),
  },
  contenedor: {
    width: "100%",
    maxWidth: 1550,
    padding: 25,
    background: getColor("blanco"),
    boxShadow: "0px 8px 8px 2px rgba(0,0,0,0.25)",
    borderRadius: 32,
    border: "5px solid #FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 30,
    boxSizing: "border-box",
  },
  tituloContenedor: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "20px 77px",
  },
  tituloContenedorTexto: {
    color: getColor("gris"),
    fontSize: "32px",
    fontFamily: "Lato, sans-serif",
    fontWeight: 400,
    lineHeight: 1.2,
    textAlign: "center",
    textShadow: "0px 1px 1px rgba(0,0,0,0.10)",
    margin: 0,
  },
  lineaContenedor: {
    width: "min(1080px, 90%)",
    height: 3,
    background: getColor("geis"),
    boxShadow: "0px 6px 2px rgba(0,0,0,0.10)",
  },
  modulosGrid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 25,
    padding: "30px 0",
  },
  btnPermisos: {
    padding: "12px 32px",
    background: getColor("negro") || "#222",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 16,
    fontFamily: "Lato, sans-serif",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0px 4px 8px rgba(0,0,0,0.18)",
    marginBottom: 8,
  },
};

// ─── Estilos modal ────────────────────────────────────────────────────────────
const ms = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.50)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: getColor("blanco"),
    borderRadius: 32,
    padding: 36,
    width: "min(860px, 95vw)",
    maxHeight: "88vh",
    display: "flex",
    flexDirection: "column",
    gap: 24,
    boxShadow: "0px 8px 8px 2px rgba(0,0,0,0.25)",
    border: "5px solid #FFFFFF",
    fontFamily: "Lato, sans-serif",
    overflowY: "auto",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `3px solid ${getColor("negro")}`,
    paddingBottom: 16,
  },
  titulo: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: getColor("negro"),
  },
  subtitulo: {
    margin: "0 0 14px",
    fontSize: 18,
    fontWeight: 700,
    color: getColor("negro"),
  },
  btnCerrar: {
    background: getColor("negro"),
    border: "none",
    borderRadius: 8,
    width: 32,
    height: 32,
    fontSize: 16,
    cursor: "pointer",
    color: getColor("blanco"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    lineHeight: 1,
    flexShrink: 0,
  },
  cargando: {
    textAlign: "center",
    color: getColor("gris"),
    fontSize: 15,
    padding: "28px 0",
    fontStyle: "italic",
  },
  errorGlobal: {
    background: "#fff3f3",
    color: "#b71c1c",
    padding: "12px 18px",
    borderRadius: 12,
    fontSize: 14,
    margin: 0,
    border: "1.5px solid #ffcdd2",
    fontWeight: 600,
  },
  listaUsuarios: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  tarjetaUsuario: {
    border: `2px solid ${getColor("negro")}`,
    borderRadius: 16,
    padding: "18px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    background: getColor("blanco"),
    boxShadow: "0px 4px 4px rgba(0,0,0,0.10)",
  },
  usuarioInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  usuarioNombre: {
    display: "block",
    fontWeight: 700,
    fontSize: 16,
    color: getColor("negro"),
  },
  usuarioEmail: {
    display: "block",
    fontSize: 13,
    color: getColor("gris"),
    marginTop: 3,
  },
  acciones: {
    display: "flex",
    gap: 10,
  },
  badgeAdmin: {
    background: getColor("amarillo"),
    color: getColor("negro"),
    padding: "5px 14px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 700,
    border: `1.5px solid ${getColor("negro")}`,
  },
  adminTexto: {
    margin: 0,
    fontSize: 13,
    color: getColor("gris"),
    fontStyle: "italic",
  },
  rutasGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 14,
    fontWeight: 600,
    color: getColor("negro"),
    cursor: "pointer",
    background: getColor("blanco"),
    border: `2px solid ${getColor("negro")}`,
    borderRadius: 10,
    padding: "7px 14px",
    userSelect: "none",
    transition: "background 0.15s",
  },
  checkbox: {
    cursor: "pointer",
    width: 16,
    height: 16,
    accentColor: "#2e7d32",
  },
  labelRutas: {
    margin: "6px 0 6px",
    fontSize: 13,
    fontWeight: 700,
    color: getColor("gris"),
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  formNuevo: {
    background: "#f7f7f7",
    borderRadius: 16,
    padding: "22px",
    border: `2px solid ${getColor("negro")}`,
    boxShadow: "0px 4px 4px rgba(0,0,0,0.08)",
  },
  formFila: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  input: {
    flex: 1,
    minWidth: 160,
    padding: "9px 14px",
    borderRadius: 10,
    border: `2px solid ${getColor("negro")}`,
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
    background: getColor("blanco"),
    color: getColor("negro"),
    outline: "none",
  },
  formAcciones: {
    display: "flex",
    gap: 12,
    marginTop: 16,
  },
  pie: {
    display: "flex",
    justifyContent: "flex-start",
  },
  btnNuevo: {
    padding: "11px 28px",
    background: getColor("amarillo"),
    color: getColor("negro"),
    border: `2px solid ${getColor("negro")}`,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Lato, sans-serif",
    boxShadow: "0px 4px 4px rgba(0,0,0,0.15)",
  },
  btnGuardar: {
    padding: "8px 20px",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Lato, sans-serif",
  },
  checkLabelActivo: {
    background: "#e8f5e9",
    border: "2px solid #2e7d32",
    color: "#2e7d32",
  },
  btnCrear: {
    padding: "10px 24px",
    background: getColor("negro"),
    color: getColor("blanco"),
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Lato, sans-serif",
  },
  btnEliminar: {
    padding: "8px 20px",
    background: getColor("blanco"),
    color: "#c62828",
    border: "2px solid #c62828",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Lato, sans-serif",
  },
  btnCancelar: {
    padding: "10px 24px",
    background: getColor("blanco"),
    color: getColor("negro"),
    border: `2px solid ${getColor("negro")}`,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Lato, sans-serif",
  },
  error: {
    color: "#c62828",
    fontSize: 13,
    margin: "0 0 10px",
    fontWeight: 600,
  },
  overlayAdvertencia: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.60)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100,
  },
  modalAdvertencia: {
    background: getColor("blanco"),
    borderRadius: 24,
    padding: "40px 44px",
    maxWidth: 420,
    width: "90vw",
    textAlign: "center",
    boxShadow: "0px 8px 8px 2px rgba(0,0,0,0.25)",
    border: "5px solid #FFFFFF",
    fontFamily: "Lato, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  iconoAdvert: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tituloAdvert: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: getColor("negro"),
  },
  textoAdvert: {
    margin: 0,
    fontSize: 15,
    color: getColor("gris"),
    lineHeight: 1.7,
  },
  advertAcciones: { display: "flex", gap: 14, marginTop: 8 },
  btnConfirmarElim: {
    padding: "11px 26px",
    background: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Lato, sans-serif",
  },
};

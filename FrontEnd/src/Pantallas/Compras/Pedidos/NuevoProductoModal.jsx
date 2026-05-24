import React, { useState, useEffect } from "react";
import { IconoCerrar } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

const FORM_INICIAL = {
  nombre: "",
  codigo: "",
  descripcion: "",
  precio_compra: "",
  precio_venta: "",
  stock_maximo: "",
  stock_minimo: "",
  id_marca: "",
  id_categoria: "",
};

export default function NuevoProductoModal({ open, onClose, onProductoCreado }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!open) return;
    setForm(FORM_INICIAL);
    setError("");

    const cargarOpciones = async () => {
      try {
        setCargando(true);
        const [resMarcas, resCat] = await Promise.all([
          fetchConToken(`${API_BASE}/misc/productos/marcas`),
          fetchConToken(`${API_BASE}/misc/productos/categorias`),
        ]);
        const [dataMarcas, dataCat] = await Promise.all([
          resMarcas.json(),
          resCat.json(),
        ]);
        setMarcas(Array.isArray(dataMarcas) ? dataMarcas : []);
        setCategorias(Array.isArray(dataCat) ? dataCat : []);
      } catch (err) {
        console.error("Error cargando marcas/categorías:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarOpciones();
  }, [open]);

  if (!open) return null;

  const handleChange = (campo, valor) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }
    if (!form.id_marca) {
      setError("Debes seleccionar una marca.");
      return;
    }

    setError("");
    setGuardando(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        codigo: form.codigo.trim() || null,
        descripcion: form.descripcion.trim() || null,
        precio_compra: form.precio_compra !== "" ? Number(form.precio_compra) : null,
        precio_venta: form.precio_venta !== "" ? Number(form.precio_venta) : null,
        stock_minimo: form.stock_minimo !== "" ? Number(form.stock_minimo) : null,
        stock_maximo: form.stock_maximo !== "" ? Number(form.stock_maximo) : null,
        id_marca: Number(form.id_marca),
        id_categoria: form.id_categoria !== "" ? Number(form.id_categoria) : null,
      };

      const res = await fetchConToken(`${API_BASE}/misc/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear el producto");

      if (onProductoCreado) onProductoCreado(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* ── HEADER ── */}
        <div style={styles.header}>
          <h2 style={styles.headerTitulo}>Registrar Nuevo Producto</h2>
          <button onClick={onClose} style={styles.botonCerrar} title="Cerrar">
            <IconoCerrar />
          </button>
        </div>

        {/* ── BODY ── */}
        {cargando ? (
          <div style={styles.cargando}>Cargando opciones...</div>
        ) : (
          <div style={styles.body}>

            {/* Fila 1: Nombre + Código */}
            <div style={styles.fila}>
              <Campo label="Nombre *" style={{ flex: 2 }}>
                <input
                  style={styles.input}
                  placeholder="Ej: Neumático Pirelli 195/65 R15"
                  value={form.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                />
              </Campo>
              <Campo label="Código" style={{ flex: 1 }}>
                <input
                  style={styles.input}
                  placeholder="Ej: NEU-001"
                  value={form.codigo}
                  onChange={(e) => handleChange("codigo", e.target.value)}
                />
              </Campo>
            </div>

            {/* Fila 2: Marca + Categoría */}
            <div style={styles.fila}>
              <Campo label="Marca *" style={{ flex: 1 }}>
                <select
                  style={styles.select}
                  value={form.id_marca}
                  onChange={(e) => handleChange("id_marca", e.target.value)}
                >
                  <option value="">-- Seleccionar --</option>
                  {marcas.map((m) => (
                    <option key={m.id_marca} value={m.id_marca}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Categoría" style={{ flex: 1 }}>
                <select
                  style={styles.select}
                  value={form.id_categoria}
                  onChange={(e) => handleChange("id_categoria", e.target.value)}
                >
                  <option value="">-- Seleccionar --</option>
                  {categorias.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            {/* Fila 3: Precio compra + Precio venta */}
            <div style={styles.fila}>
              <Campo label="Precio de Compra (Gs.)" style={{ flex: 1 }}>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.precio_compra}
                  onChange={(e) => handleChange("precio_compra", e.target.value)}
                />
              </Campo>
              <Campo label="Precio de Venta (Gs.)" style={{ flex: 1 }}>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.precio_venta}
                  onChange={(e) => handleChange("precio_venta", e.target.value)}
                />
              </Campo>
            </div>

            {/* Fila 4: Stock maximo + Stock mínimo */}
            <div style={styles.fila}>
              <Campo label="Stock Máximo" style={{ flex: 1 }}>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock_maximo}
                  onChange={(e) => handleChange("stock_maximo", e.target.value)}
                />
              </Campo>
              <Campo label="Stock Mínimo" style={{ flex: 1 }}>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock_minimo}
                  onChange={(e) => handleChange("stock_minimo", e.target.value)}
                />
              </Campo>
            </div>

            {/* Fila 5: Descripción */}
            <Campo label="Descripción">
              <textarea
                style={{ ...styles.input, height: 80, resize: "vertical" }}
                placeholder="Descripción opcional del producto..."
                value={form.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
              />
            </Campo>

            {/* Error */}
            {error && <div style={styles.error}>{error}</div>}
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={styles.footer}>
          <button
            style={styles.botonCancelar}
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            style={{
              ...styles.botonGuardar,
              opacity: guardando || cargando ? 0.6 : 1,
              cursor: guardando || cargando ? "not-allowed" : "pointer",
            }}
            onClick={handleGuardar}
            disabled={guardando || cargando}
          >
            {guardando ? "Guardando..." : "Confirmar"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ── Campo wrapper ── */
function Campo({ label, children, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

/* ── Estilos ── */
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    width: 680,
    maxWidth: "95vw",
    maxHeight: "92vh",
    background: "#fff",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
  },
  header: {
    background: getColor("amarillo"),
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  },
  headerTitulo: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    fontFamily: "Lato, sans-serif",
    color: "#000",
  },
  botonCerrar: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: 4,
  },
  body: {
    padding: "24px 28px",
    overflowY: "auto",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  cargando: {
    padding: 40,
    textAlign: "center",
    color: "#666",
    fontFamily: "Lato, sans-serif",
    fontSize: 16,
  },
  fila: {
    display: "flex",
    gap: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "Lato, sans-serif",
    color: "#333",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1.5px solid #DADADA",
    outline: "none",
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
    background: "#FAFAFA",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  select: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1.5px solid #DADADA",
    outline: "none",
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
    background: "#FAFAFA",
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  error: {
    background: "#fff0f0",
    border: "1px solid #E30613",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#E30613",
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
  },
  footer: {
    padding: "16px 28px",
    borderTop: "1px solid #EBEBEB",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    flexShrink: 0,
    background: "#fff",
  },
  botonCancelar: {
    padding: "10px 24px",
    borderRadius: 999,
    border: "1.5px solid #999",
    background: "#fff",
    cursor: "pointer",
    fontSize: 15,
    fontFamily: "Lato, sans-serif",
  },
  botonGuardar: {
    padding: "10px 28px",
    borderRadius: 999,
    border: "none",
    background: getColor("amarillo"),
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "Lato, sans-serif",
  },
};
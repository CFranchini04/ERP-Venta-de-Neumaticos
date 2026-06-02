import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';

const camposVacios = {
  nombre: '',
  banco: '',
  tipo: '',
  moneda: '',
  numeroCuenta: '',
  saldoInicial: '',
};

export default function BancosSaldos({ usuario = 'Empleado', onLogout, onNavegar }) {
  const [bancos, setBancos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(camposVacios);

  const navigate = useNavigate();

  useEffect(() => {
    setBancos([
      { id: 1, cuenta: 'Banco Nacional - Cuenta Corriente', saldo: 15000000 },
      { id: 2, cuenta: 'Banco Itaú - Ahorros', saldo: 8200000 },
      { id: 3, cuenta: 'Banco Continental - Empresa', saldo: 23450000 },
    ]);
  }, []);

  function handleNavegar(moduloId) {
    if (onNavegar) onNavegar(moduloId);
  }

  function verCuenta(id) {
    navigate(`/tesoreria/cuentas/${id}`);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleGuardar() {
    // TODO: conectar con BD cuando esté disponible
    console.log('Nueva cuenta a guardar:', form);
    setModalAbierto(false);
    setForm(camposVacios);
  }

  function handleCerrar() {
    setModalAbierto(false);
    setForm(camposVacios);
  }

  const camposIncompletos = !form.nombre || !form.banco || !form.tipo || !form.moneda;

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>

        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Módulo de Tesorería y Bancos</h1>
          <div style={styles.separador} />
        </header>

        <div style={styles.panel}>
          <div style={styles.headerPanel}>
            <h2 style={styles.subtitulo}>Resumen y Cuentas.</h2>
            <button style={styles.botonAgregar} onClick={() => setModalAbierto(true)}>
              Agregar
            </button>
          </div>

          <div style={styles.grid}>
            {bancos.map((banco) => (
              <div key={banco.id} style={styles.card}>
                <div style={styles.info}>
                  <h3 style={styles.cuenta}>{banco.cuenta}</h3>
                  <p style={styles.saldo}>Saldo: {banco.saldo.toLocaleString('es-PY')} Gs.</p>
                </div>
                <button style={styles.boton} onClick={() => verCuenta(banco.id)}>
                  Ver más
                </button>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ── MODAL ── */}
      {modalAbierto && (
        <div style={styles.overlay}>
          <div style={styles.modal}>

            <h2 style={styles.modalTitulo}>Nueva cuenta bancaria</h2>

            <div style={styles.modalGrid}>

              <div style={styles.campo}>
                <label style={styles.label}>Nombre de la cuenta *</label>
                <input name="nombre" value={form.nombre} onChange={handleChange}
                  placeholder="Ej: Cuenta operativa" style={styles.input} />
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Banco *</label>
                <input name="banco" value={form.banco} onChange={handleChange}
                  placeholder="Ej: Banco Itaú" style={styles.input} />
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Tipo de cuenta *</label>
                <select name="tipo" value={form.tipo} onChange={handleChange} style={styles.input}>
                  <option value="">Seleccionar...</option>
                  <option value="Corriente">Corriente</option>
                  <option value="Ahorros">Ahorros</option>
                  <option value="Empresarial">Empresarial</option>
                </select>
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Moneda *</label>
                <select name="moneda" value={form.moneda} onChange={handleChange} style={styles.input}>
                  <option value="">Seleccionar...</option>
                  <option value="PYG">Guaraní (PYG)</option>
                </select>
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Número de cuenta</label>
                <input name="numeroCuenta" value={form.numeroCuenta} onChange={handleChange}
                  placeholder="Ej: 0001-123456-7" style={styles.input} />
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Saldo inicial</label>
                <input name="saldoInicial" type="number" value={form.saldoInicial} onChange={handleChange}
                  placeholder="0" style={styles.input} />
              </div>

            </div>

            <p style={styles.nota}>* Campos obligatorios</p>

            <div style={styles.modalBotones}>
              <button style={styles.btnCancelar} onClick={handleCerrar}>Cancelar</button>
              <button
                style={{ ...styles.btnGuardar, opacity: camposIncompletos ? 0.5 : 1, cursor: camposIncompletos ? 'not-allowed' : 'pointer' }}
                disabled={camposIncompletos}
                onClick={handleGuardar}
              >
                Guardar cuenta
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  pagina: { display: 'flex', width: '100vw', height: '100vh', background: '#F9F9F9', fontFamily: 'Lato, sans-serif', overflow: 'hidden' },
  contenido: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '21px 50px', gap: 24, boxSizing: 'border-box', overflowY: 'auto' },
  encabezado: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '21px 0' },
  separador: { width: '90%', height: 1, background: '#E0E0E0' },
  titulo: { color: '#000', fontSize: 30, fontWeight: 700, lineHeight: 1.2, margin: 0, textAlign: 'center', marginTop: 15 },
  panel: { width: '100%', maxWidth: 1100, background: '#fff', borderRadius: 12, border: '2px solid #000', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 },
  headerPanel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  subtitulo: { fontSize: 18, fontWeight: 700, margin: 0 },
  botonAgregar: { padding: '8px 14px', borderRadius: 6, border: '2px solid #000', background: '#fff', color: '#000', cursor: 'pointer', fontWeight: 700 },
  grid: { width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 10, border: '2px solid #000', padding: 22, minHeight: 150, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' },
  info: { display: 'flex', flexDirection: 'column', gap: 6 },
  cuenta: { fontSize: 16, fontWeight: 700, margin: 0 },
  saldo: { fontSize: 14, color: '#333', margin: 0 },
  boton: { padding: '8px 12px', border: 'none', borderRadius: 6, background: '#000', color: '#fff', cursor: 'pointer', fontWeight: 600 },

  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  modal: { width: '100%', maxWidth: 560, background: '#fff', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
  modalTitulo: { margin: 0, fontSize: 22, fontWeight: 700, textAlign: 'center' },
  modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' },
  campo: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 13, fontWeight: 700, color: '#555' },
  input: { padding: '9px 12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 14, fontFamily: 'Lato, sans-serif', background: '#FAFAFA' },
  nota: { margin: 0, fontSize: 12, color: '#999' },
  modalBotones: { display: 'flex', justifyContent: 'flex-end', gap: 12 },
  btnCancelar: { padding: '10px 18px', borderRadius: 8, border: 'none', background: '#E0E0E0', fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato, sans-serif' },
  btnGuardar: { padding: '10px 20px', borderRadius: 8, border: 'none', background: '#FFCC00', fontWeight: 700, fontFamily: 'Lato, sans-serif' },
};

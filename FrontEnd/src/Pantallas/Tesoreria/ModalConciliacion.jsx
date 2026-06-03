import React, { useState } from 'react';
import { formatearGs } from '../../components/formato';
import fetchConToken from '../../token';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:9128/api';

export default function ModalConciliacion({ movimiento, onCerrar, onConciliar, modo = 'conciliar' }) {
  const [fechaConciliacion, setFechaConciliacion] = useState(movimiento?.fecha_conciliacion || '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const deposito = movimiento?.depositos_bancarios?.[0] || {};

  const handleConciliar = async () => {
    if (!fechaConciliacion) {
      setError('Ingrese la fecha de conciliación');
      return;
    }

    setGuardando(true);
    setError('');
    try {
      const res = await fetchConToken(`${API_BASE}/tesoreria/movimientos/${movimiento.id_movimiento}/conciliar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fechaConciliacion }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al conciliar');
      }

      const actualizado = await res.json();
      onConciliar(actualizado);
    } catch (err) {
      setError(err.message || 'Error al conciliar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.titulo}>
            {modo === 'conciliar' ? 'Conciliar cheque' : 'Detalles del movimiento'}
          </h2>
          <button style={styles.btnCerrar} onClick={onCerrar}>×</button>
        </div>

        <div style={styles.seccion}>
          <div style={styles.grid}>
            <div style={styles.campo}>
              <label style={styles.label}>Número de cheque</label>
              <input type="text" value={deposito.nro_cheque || ''} disabled style={styles.inputDisabled} />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Banco emisor</label>
              <input type="text" value={deposito.banco_emisor || ''} disabled style={styles.inputDisabled} />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Monto</label>
              <input type="text" value={movimiento.monto ? formatearGs(movimiento.monto) : ''} disabled style={styles.inputDisabled} />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Fecha del movimiento</label>
              <input type="date" value={movimiento.fecha || ''} disabled style={styles.inputDisabled} />
            </div>

            {modo === 'conciliar' && (
              <div style={{ ...styles.campo, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Fecha de conciliación *</label>
                <input
                  type="date"
                  value={fechaConciliacion}
                  onChange={(e) => {
                    setFechaConciliacion(e.target.value);
                    if (error) setError('');
                  }}
                  style={styles.input}
                />
              </div>
            )}

            {movimiento.observacion && (
              <div style={{ ...styles.campo, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Observaciones</label>
                <textarea value={movimiento.observacion} disabled style={styles.textareaDisabled} />
              </div>
            )}
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.footer}>
          <button style={styles.btnCancelar} onClick={onCerrar} disabled={guardando}>
            {modo === 'conciliar' ? 'Cancelar' : 'Cerrar'}
          </button>
          {modo === 'conciliar' && (
            <button style={{ ...styles.btnConciliar, opacity: guardando ? 0.6 : 1 }} onClick={handleConciliar} disabled={guardando}>
              {guardando ? 'Conciliando...' : 'Conciliar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90vh',
    overflowY: 'auto',
    background: '#FFF',
    borderRadius: 14,
    padding: 24,
    boxShadow: '0 12px 30px rgba(0,0,0,0.20)',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titulo: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
  },
  btnCerrar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: 'none',
    background: '#F0F0F0',
    fontSize: 24,
    cursor: 'pointer',
    lineHeight: 1,
  },
  seccion: {
    border: '1px solid #E0E0E0',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px 16px',
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: '#555',
  },
  input: {
    height: 40,
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid #CCC',
    fontSize: 14,
    fontFamily: 'Lato, sans-serif',
  },
  inputDisabled: {
    height: 40,
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid #DDD',
    fontSize: 14,
    fontFamily: 'Lato, sans-serif',
    background: '#F5F5F5',
    color: '#666',
    cursor: 'not-allowed',
  },
  textareaDisabled: {
    minHeight: 60,
    padding: 12,
    borderRadius: 8,
    border: '1px solid #DDD',
    fontSize: 14,
    fontFamily: 'Lato, sans-serif',
    background: '#F5F5F5',
    color: '#666',
    cursor: 'not-allowed',
    resize: 'vertical',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    margin: 0,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btnCancelar: {
    background: '#EEE',
    border: 'none',
    padding: '0 20px',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    height: 42,
    cursor: 'pointer',
  },
  btnConciliar: {
    background: '#22C55E',
    color: '#FFF',
    border: 'none',
    padding: '0 20px',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    height: 42,
    cursor: 'pointer',
  },
};

// ModuloCard.jsx
// Componente para las tarjetas de módulos

export default function ModuloCard({ label, icon, onClick }) {
  return (
    <button onClick={onClick} style={styles.moduloCard}>
      <div style={styles.moduloIcono}>{icon}</div>
      <span style={styles.moduloLabel}>{label}</span>
    </button>
  );
}

// Estilos para ModuloCard
const styles = {
  moduloCard: {
    width: 180,
    height: 180,
    paddingTop: 10,
    paddingBottom: 10,
    background: '#FFCC00',
    boxShadow: '0px 6px 4px rgba(0,0,0,0.25)',
    borderRadius: 16,
    border: '2px solid #444444',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  moduloIcono: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduloLabel: {
    color: '#1D1D1D',
    fontSize: 18,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
    lineHeight: '31.2px',
    textAlign: 'center',
    width: '100%',
  },
};
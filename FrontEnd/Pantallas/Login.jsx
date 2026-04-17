import React, { useState } from "react";
import { IconoCarga } from "../components/Icons";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
  e.preventDefault();

  if (usuario === "compras" && password === "1234") {
    onLogin({
      user: usuario,
      rol: "compras"
    });
  }

  else if (usuario === "contabilidad" && password === "1234") {
    onLogin({
      user: usuario,
      rol: "contabilidad"
    });
  }

  else if (usuario === "admin" && password === "1234") {
    onLogin({
      user: usuario,
      rol: "admin"
    });
  }

  else {
    alert("Credenciales incorrectas");
  }
};

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>

    
        <div style={styles.iconoContainer}>
          <div style={styles.iconoCargaWrapper}>
            <IconoCarga />
          </div>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    viewBox="0 0 24 24"
    style={styles.iconoUsuario}
  >
    <g
      fill="none"
      stroke="#ffc107"
      strokeDasharray={28}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path d="M4 21v-1c0 -3.31 2.69 -6 6 -6h4c3.31 0 6 2.69 6 6v1">
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.4s"
          values="28;0"
        />
      </path>
      <path
        strokeDashoffset={28}
        d="M12 11c-2.21 0 -4 -1.79 -4 -4c0 -2.21 1.79 -4 4 -4c2.21 0 4 1.79 4 4c0 2.21 -1.79 4 -4 4Z"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          begin="0.4s"
          dur="0.4s"
          to={0}
        />
      </path>
    </g>
  </svg>
</div>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Usuario</label>
          <input
            style={styles.input}
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <label style={styles.label}>Contraseña</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} type="submit">Iniciar Sesión</button>
        </form>

      </div>
    </div>
  );
}

// Estilos para Login
const styles = {
  loginContainer: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(#dcdcdc, #a0a0a0)',
  },
  loginBox: {
    background: '#4a4a4a',
    padding: '40px',
    borderRadius: '20px',
    width: '300px',
    textAlign: 'center',
    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
  },
  iconoContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 20px auto',
    width: '140px',
    height: '140px',
  },
  iconoCargaWrapper: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    width: '100px',
    height: '100px',
  },
  iconoUsuario: {
    position: 'relative',
    zIndex: 2,
  },
  label: {
    display: 'block',
    color: 'white',
    marginTop: '10px',
    textAlign: 'left',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    borderRadius: '8px',
    border: 'none',
  },
  button: {
    marginTop: '20px',
    background: '#ffc107',
    border: 'none',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

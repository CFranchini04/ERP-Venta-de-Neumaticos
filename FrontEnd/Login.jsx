import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import "./Login.css";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
  e.preventDefault();

  if (usuario === "compras" && password === "1234") {
    onLogin({
      user: "comprasUser",
      rol: "compras"
    });
  }

  else if (usuario === "contabilidad" && password === "1234") {
    onLogin({
      user: "contaUser",
      rol: "contabilidad"
    });
  }

  else {
    alert("Credenciales incorrectas");
  }
};

  return (
    <div className="login-container">
      <div className="login-box">

    
        <div className="icono-container"> 
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    viewBox="0 0 24 24"
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
          <label>Usuario</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Iniciar Sesión</button>
        </form>

      </div>
    </div>
  );
}
import React, { useState } from "react";
import "./App.css";

import Login from "./Login";
import Compras from "./Compras";
import Contabilidad from "./Contabilidad";
import "./Compras.css";

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (user.rol === "compras") {
    return <Compras />;
  }

  if (user.rol === "contabilidad") {
    return <Contabilidad />;
  }

  return <h1>Rol no válido</h1>;
}
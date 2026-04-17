import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import HomePage from './Pantallas/HomePage';
import Login from './Pantallas/Login';
import Compras from './Pantallas/Compras';
import Contabilidad from './Pantallas/Contabilidad';

export default function App() {
  const [usuario, setUsuario] = useState(null);

  const handleLogin = (data) => {
    setUsuario(data);
  };

  if (usuario && usuario.rol === 'admin') {
    return <HomePage usuario={usuario.user} onLogout={() => setUsuario(null)} />;
  }

  if (usuario && usuario.rol === 'compras') {
    return <Compras usuario={usuario.user} onLogout={() => setUsuario(null)} />;
  }

  if (usuario && usuario.rol === 'contabilidad') {
    return <Contabilidad usuario={usuario.user} onLogout={() => setUsuario(null)} />;
  }

  return <Login onLogin={handleLogin} />;
}


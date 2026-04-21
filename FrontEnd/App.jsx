import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import HomePage from './Pantallas/Main/HomePage';
import Login from './Pantallas/Login/Login';
import { Compras, Pedidos } from './Pantallas/Compras';
import Contabilidad from './Pantallas/Contabilidad/Contabilidad';
import RRHH from './Pantallas/RRHH/rrhh';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState('home');

  const handleLogin = (data) => {
    setUsuario(data);
    setPagina('home');
  };

  const handleNavegar = (moduloId) => {
    if (moduloId === 'home') {
      setPagina('home');
    }
    else if (moduloId === 'rrhh') {
      setPagina('rrhh');
    }
    else if (moduloId === 'compras') {
      setPagina('compras');
    }
    else if (moduloId === 'pedidos') {
      setPagina('pedidos');
    }
    else if (moduloId === 'contabilidad') {
      setPagina('contabilidad');
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    setPagina('home');
  };

  if (usuario && usuario.rol === 'admin') {
    if (pagina === 'rrhh') {
      return <RRHH usuario={usuario.user} onNavegar={handleNavegar} onLogout={handleLogout} />;
    }
    if (pagina === 'compras') {
      return <Compras usuario={usuario.user} onNavegar={handleNavegar} onLogout={handleLogout} />;
    }
    if (pagina === 'pedidos') {
      return <Pedidos usuario={usuario.user} onNavegar={handleNavegar} onLogout={handleLogout} />;
    }
    if (pagina === 'contabilidad') {
      return <Contabilidad usuario={usuario.user} onNavegar={handleNavegar} onLogout={handleLogout} />;
    }

    return <HomePage usuario={usuario.user} onNavegar={handleNavegar} onLogout={handleLogout} />;
  }

  if (usuario && usuario.rol === 'compras') {
    return <Compras usuario={usuario.user} onLogout={() => setUsuario(null)} />;
  }

  if (usuario && usuario.rol === 'contabilidad') {
    return <Contabilidad usuario={usuario.user} onLogout={() => setUsuario(null)} />;
  }

  if (usuario && usuario.rol === 'rrhh') {
    return <RRHH usuario={usuario.user} onLogout={() => setUsuario(null)} />;
  }

  return <Login onLogin={handleLogin} />;
}

import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import HomePage from './Pantallas/Main/HomePage';
import Login from './Pantallas/Login/Login';
import { Compras, Pedidos } from './Pantallas/Compras';
import Contabilidad from './Pantallas/Contabilidad/Contabilidad';
import RRHH from './Pantallas/RRHH/rrhh';
import GestionPersonal from './Pantallas/RRHH/GestionPersonal';
import GestionSalarial from './Pantallas/RRHH/GestionSalarial';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState('home');

  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

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
    // RRHH
    else if (moduloId === 'gestion-personal') {
      setEmpleadoSeleccionado(empleado);
      setPagina('gestion-personal');
    }

    else if (moduloId === 'crear-empleado') {
      setEmpleadoSeleccionado(null);
      setPagina('gestion-personal');
    }

    else if (moduloId === 'gestion-salarios') {
      setEmpleadoSeleccionado(empleado);
      setPagina('gestion-salarios');
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
        //RRHH
    if (pagina === 'gestion-personal') {
      return (
        <GestionPersonal
          usuario={usuario.user}
          empleado={empleadoSeleccionado}
          onNavegar={handleNavegar}
          onLogout={handleLogout}
          onVolver={() => setPagina('rrhh')}
        />
      );
    }

    if (pagina === 'gestion-salarios') {
      return (
        <GestionSalarial
          empleado={empleadoSeleccionado}
          onVolver={() => setPagina('rrhh')}
        />
      );
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

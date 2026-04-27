import './App.css';
import { useState } from 'react';
import HomePage from './Pantallas/Main/HomePage';
import Login from './Pantallas/Login/Login';
import { Compras, Pedidos } from './Pantallas/Compras';
import Contabilidad from './Pantallas/Contabilidad/Contabilidad';
import RRHH from './Pantallas/RRHH/rrhh';
import GestionPersonal from './Pantallas/RRHH/GestionPersonal';
import GestionSalarial from './Pantallas/RRHH/GestionSalarial';
import Ventas from './Pantallas/Ventas/Ventas';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState('home');

  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  const handleLogin = (data) => {
    setUsuario(data);
    
    if (data.rol === 'rrhh') setPagina('rrhh');
    else if (data.rol === 'compras') setPagina('compras');
    else if (data.rol === 'contabilidad') setPagina('contabilidad');
    else if (data.rol === 'ventas') setPagina('ventas');
    else if (data.rol === 'admin') setPagina('home');
  };

  const handleNavegar = (moduloId, empleado) => {
    if (moduloId === 'home') {
      setPagina('home');
    }
    else if (moduloId === 'rrhh') {
      setPagina('rrhh');
    }
    else if (moduloId === 'ventas') {
      setPagina('ventas');
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
      return (
        <RRHH
          usuario={usuario.user}
          onNavegar={handleNavegar}
          onLogout={handleLogout}
        />
      );
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

    if (pagina === 'ventas') {
      return <Ventas usuario={usuario.user} onNavegar={handleNavegar} onLogout={handleLogout} />;
    }

    return <HomePage usuario={usuario.user} onNavegar={handleNavegar} onLogout={handleLogout} />;
  }

  if (usuario && usuario.rol === 'compras') {
    return <Compras usuario={usuario.user} onLogout={() => setUsuario(null)} />;
  }

  if (usuario && usuario.rol === 'contabilidad') {
    return <Contabilidad usuario={usuario.user} onLogout={() => setUsuario(null)} />;
  }

  if (usuario && usuario.rol === 'ventas') {
    if (pagina === 'ventas') {
      return <Ventas usuario={usuario.user} onNavegar={handleNavegar} onLogout={handleLogout} />;
    }
    return <Ventas usuario={usuario.user} onNavegar={handleNavegar} onLogout={handleLogout} />;
  }

  if (usuario && usuario.rol === 'rrhh') {
    if (pagina === 'rrhh') {
      return (
        <RRHH
          usuario={usuario.user}
          onNavegar={handleNavegar}
          onLogout={handleLogout}
        />
      );
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
    return <HomePage usuario={usuario.user} onNavegar={handleNavegar} onLogout={handleLogout} />;
  }

  return <Login onLogin={handleLogin} />;
}

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const normalizeUsuario = (data) => {
  if (!data) return null;

  const nombre =
    data.nombre ||
    data.name ||
    data.display_name ||
    data.user_metadata?.display_name ||
    data.user_metadata?.full_name ||
    data.user_metadata?.name ||
    data.user ||
    data.email ||
    '';

  return {
    ...data,
    nombre,
  };
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? normalizeUsuario(JSON.parse(guardado)) : null;
  });

  const login = (data) => {
    const normalized = normalizeUsuario(data);
    setUsuario(normalized);
    localStorage.setItem('usuario', JSON.stringify(normalized));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// SearchBar.jsx
// Barra de búsqueda en tiempo real reutilizable con dropdown y botón de limpieza.
//
// Props:
//   apiUrl       {string}   URL base del endpoint, ej: "http://localhost:9128/api/compras/productos"
//   queryParam   {string}   Nombre del query param (default: "search")
//   placeholder  {string}   Texto placeholder del input
//   onSelect     {function} Callback cuando se selecciona un ítem; recibe el objeto raw del API
//   onClear      {function} Callback cuando se limpia la selección
//   renderOption {function} (opcional) Cómo renderizar cada ítem del dropdown; recibe el objeto raw
//   getLabel     {function} (opcional) Extrae el texto a mostrar en el input al seleccionar; recibe el objeto raw
//   style        {object}   Estilos extra para el contenedor raíz
//   fetchOnMount {boolean}  Si true, hace fetch al montar el componente para pre-cargar resultados (default: false)

import { useState, useEffect, useRef } from 'react';
import { getColor } from './Colors';
import { IconoLupa } from './Icons';
import fetchConToken from '../token';

export default function Searchbar({
  apiUrl,
  queryParam = 'search',
  placeholder = 'Buscar...',
  onSelect,
  onClear,
  renderOption,
  getLabel = (item) => item?.nombre || item?.label || '',
  style = {},
  fetchOnMount = false,
}) {
  const [inputValue, setInputValue]     = useState('');
  const [results, setResults]           = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  const debounceRef        = useRef(null);
  const containerRef       = useRef(null);
  // Guarda los resultados del fetch inicial para restaurarlos al limpiar el input
  const initialResultsRef  = useRef([]);

  // Cierra el dropdown si el usuario hace click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch inicial al montar el componente
  useEffect(() => {
    if (!fetchOnMount) return;

    const init = async () => {
      try {
        setLoading(true);
        const url  = `${apiUrl}?${queryParam}=`;
        const res  = await fetchConToken(url);
        const data = await res.json();
        const arr  = Array.isArray(data) ? data : [];
        setResults(arr);
        initialResultsRef.current = arr;
      } catch (err) {
        console.error('SearchBar initial fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResults = (text) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      // Si no hay texto y tenemos resultados precargados, los restauramos
      if (fetchOnMount) {
        setResults(initialResultsRef.current);
        setShowDropdown(initialResultsRef.current.length > 0);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const url  = `${apiUrl}?${queryParam}=${encodeURIComponent(text.trim())}`;
        const res  = await fetchConToken(url);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } catch (err) {
        console.error('SearchBar fetch error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleChange = (e) => {
    const text = e.target.value;
    setInputValue(text);
    setHasSelection(false);

    if (!text.trim() && onClear) onClear();
    fetchResults(text);
  };

  const handleSelect = (item) => {
    setInputValue(getLabel(item));
    setHasSelection(true);
    setShowDropdown(false);
    setResults([]);
    if (onSelect) onSelect(item);
  };

  const handleClear = () => {
    setInputValue('');
    setHasSelection(false);
    setShowDropdown(false);
    // Restaura resultados precargados si los hay
    if (fetchOnMount) {
      setResults(initialResultsRef.current);
    } else {
      setResults([]);
    }
    if (onClear) onClear();
  };

  const handleFocus = () => {
    if (results.length > 0 && !hasSelection) setShowDropdown(true);
  };

  return (
    <div ref={containerRef} style={{ ...styles.root, ...style }}>

      {/* Input + botón icono */}
      <div style={styles.inputWrapper}>
        <input
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          style={styles.input}
          autoComplete="off"
        />

        {hasSelection ? (
          /* Botón limpiar (X) */
          <button
            onClick={handleClear}
            style={styles.iconBtn}
            title="Quitar selección"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
              />
            </svg>
          </button>
        ) : (
          /* Icono lupa */
          <div style={styles.iconStatic}>
            <IconoLupa />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div style={styles.dropdown}>
          {results.length === 0 && !loading ? (
            <div style={styles.noResults}>Sin resultados</div>
          ) : (
            results.map((item, i) => (
              <DropdownItem
                key={item.id_producto ?? item.id ?? i}
                item={item}
                onSelect={handleSelect}
                renderOption={renderOption}
                getLabel={getLabel}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Item del dropdown ─────────────────────────────── */
function DropdownItem({ item, onSelect, renderOption, getLabel }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.dropdownItem,
        background: hovered ? getColor('amarillo-claro') : '#fff',
      }}
    >
      {renderOption
        ? renderOption(item)
        : <span>{getLabel(item)}</span>
      }
    </div>
  );
}

/* ─── Estilos ───────────────────────────────────────── */
const styles = {
  root: {
    position: 'relative',
    flex: 1,
    minWidth: 250,
  },

  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #000000',
    borderRadius: 8,
    background: '#FAFAFA',
    overflow: 'hidden',
    height: 42,
  },

  input: {
    flex: 1,
    padding: '0 12px',
    border: 'none',
    outline: 'none',
    fontSize: 14,
    fontFamily: 'Lato, sans-serif',
    background: 'transparent',
    color: '#444',
    height: '100%',
  },

  iconBtn: {
    width: 44,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F0F0F0',
    borderLeft: '1px solid #ddd',
    cursor: 'pointer',
    border: 'none',
    padding: 0,
    color: '#444',
    transition: 'background 0.15s',
  },

  iconStatic: {
    width: 44,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F0F0F0',
    borderLeft: '1px solid #ddd',
  },

  spinner: {
    fontSize: 14,
  },

  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 2px)',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
    zIndex: 200,
    maxHeight: 220,
    overflowY: 'auto',
  },

  dropdownItem: {
    padding: '10px 14px',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'Lato, sans-serif',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.1s',
  },

  noResults: {
    padding: '10px 14px',
    fontSize: 13,
    color: '#888',
    fontFamily: 'Lato, sans-serif',
  },
};
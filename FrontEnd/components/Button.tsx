import { ButtonProps } from "./Button.types";

export const Button: React.FC<ButtonProps> = ({
  disabled = false,
  variant = "amarilloclaro",
  label,
  onClick,
}) => {

  const getColor = () => {
    switch (variant) {
      case "amarillo":
        return "#FFCC00"; //amarillo
      case "blanco":
        return "#ffffff";
      case "gris":
        return "#444444";
      default:
        return "#FFAE00"; // naranja
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        paddingLeft: 20,
        paddingRight: 20,
        background: getColor(), 
        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
        borderRadius: 8,
        border: '3px solid #444444',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
      }}
    >
      <span
        style={{
          color: '#1D1D1D',
          fontSize: 20,
          fontFamily: 'Lato'
        }}
      >
        {label}
      </span>
    </button>
  );
};
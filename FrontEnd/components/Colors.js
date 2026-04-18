export const getColor = (variant) => {
  switch (variant) {
    case "amarillo":
      return "#FFCC00";
    case "naranja":
      return "#FFAE00";
    case "blanco":
      return "#ffffff";
    case "gris":
      return "#444444";
     case "gris-claro":
      return "#CECECE";
      case "rojo":
      return "#E30613";
      case "negro":
      return "#000000";
    default:
      return "#1D1D1D";
  }
};

import React from "react";
import { getColor } from "./Colors";

export const Button = ({
  disabled = false,
  variant = "amarillo",
  label,
  onClick,
  size = "md",
}) => {

  const sizes = {
    sm: {
      padding: "6px 12px",
      fontSize: 12,
    },
    md: {
      padding: "10px 18px",
      fontSize: 14,
    },
    lg: {
      padding: "14px 26px",
      fontSize: 16,
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sizes[size],

        background: getColor(variant),
        boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
        borderRadius: 8,
        border: "3px solid #444444",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span style={{
        color: getColor("negro"),
        fontSize: sizes[size].fontSize,
        fontFamily: "Lato"
      }}>
        {label}
      </span>
    </button>
  );
};

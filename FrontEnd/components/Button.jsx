import React from "react";
import { getColor } from "./Colors";

export const Button = ({
  disabled = false,
  variant = "amarilloclaro",
  label,
  onClick,
  size = 20,
}) => {

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        paddingLeft: 20,
        paddingRight: 20,
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
      <span style={{ color: "#1D1D1D", fontSize: size, fontFamily: "Lato" }}>
        {label}
      </span>
    </button>
  );
};

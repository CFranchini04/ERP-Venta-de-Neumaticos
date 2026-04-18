import React from 'react';

const BUTTON_VARIANTS = {
  amarillo: {
    background: '#FFCC00',
    color: '#1D1D1D',
    outline: '#444444',
  },
  blanco: {
    background: '#FFFFFF',
    color: '#1D1D1D',
    outline: '#444444',
  },
  naranja: {
    background: '#FFAE00',
    color: '#FFFFFF',
    outline: 'transparent',
  },
  grisclaro: {
    background: '#00875A',
    color: '#CECECE',
    outline: 'transparent',
  },
};

const BUTTON_SIZES = {
  small: {
    maxWidth: 220,
    minHeight: 64,
    padding: '14px',
  },
  medium: {
    maxWidth: 320,
    minHeight: 96,
    padding: '20px',
  },
  large: {
    maxWidth: 420,
    minHeight: 120,
    padding: '24px',
  },
};

export function Button({
  label = 'Boton',
  variant = 'amarillo',
  size = 'medium',
  onClick,
  style = {},
  children,
  type = 'button',
  ...props
}) {
  const variantStyle = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.amarillo;
  const sizeStyle = BUTTON_SIZES[size] || BUTTON_SIZES.medium;

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        width: '100%',
        ...sizeStyle,
        borderRadius: 8,
        border: 'none',
        outline: `3px solid ${variantStyle.outline}`,
        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        background: variantStyle.background,
        color: variantStyle.color,
        fontFamily: 'Lato, system-ui, sans-serif',
        fontSize: 42,
        fontWeight: 400,
        lineHeight: '50.4px',
        textAlign: 'center',
        cursor: 'pointer',
        wordWrap: 'break-word',
        ...style,
      }}
      {...props}
    >
      <span style={{ width: '100%' }}>{children || label}</span>
    </button>
  );
}

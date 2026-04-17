export interface ButtonProps {
    size?: "small" | "medium" | "large";
    disabled?: boolean;
    variant: "amarillo" | "naranja" | "blanco" | "gris";
    label: string;
    onClick?: () => void;
}

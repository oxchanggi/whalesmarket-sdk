import React from "react";

export interface ButtonProps {
  /**
   * Button content
   */
  children: React.ReactNode;
  /**
   * Button variant
   */
  variant?: "primary" | "secondary" | "outline";
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * Is button disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Primary UI component for user interaction
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  className = "",
}) => {
  // Base styles
  let baseStyles =
    "px-4 py-2 rounded font-medium focus:outline-none transition-colors";

  // Variant styles
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    outline:
      "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50",
  };

  // Combine styles
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${className} ${
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  }`;

  return (
    <button
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
};

export default Button;

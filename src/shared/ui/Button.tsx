import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
};

type LinkButtonProps = {
  children: ReactNode;
  to: string;
  variant?: "primary" | "secondary" | "quiet";
  className?: string;
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`button button--${variant} ${className}`} {...props}>{children}</button>;
}

export function LinkButton({ children, to, variant = "primary", className = "" }: LinkButtonProps) {
  return <Link className={`button button--${variant} ${className}`} to={to}>{children}</Link>;
}

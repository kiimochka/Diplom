import React, { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type BackButtonProps = {
  fallback?: string;
  className?: string;
  children?: ReactNode;
  ariaLabel?: string;
};

type BackLocationState = {
  from?: string;
  fromState?: unknown;
};

const isSafeInternalPath = (path: unknown): path is string => {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
};

const BackButton: React.FC<BackButtonProps> = ({
  fallback = "/",
  className = "back-button",
  children = "← Назад",
  ariaLabel = "Назад",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as BackLocationState | null;

  const handleBack = () => {
    const from = state?.from;

    if (isSafeInternalPath(from)) {
      navigate(from, { state: state?.fromState });
      return;
    }

    navigate(fallback);
  };

  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={handleBack}
    >
      {children}
    </button>
  );
};

export default BackButton;

// src/components/layout/PageHeader.tsx
import React from "react";
import { Arrow } from "../../icons/IconsIndex";
import BackButton from "../navigation/BackButton";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  fallback?: string;
};

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  backTo,
  fallback,
}) => {
  return (
    <header className="page-header">
      {showBack && (
        <BackButton
          className="page-header-back"
          fallback={backTo ?? fallback ?? "/"}
          ariaLabel="Назад"
        >
          <Arrow />
        </BackButton>
      )}
      <div className="page-header-text">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <div className="page-header-subtitle">{subtitle}</div>}
      </div>
    </header>
  );
};

export default PageHeader;

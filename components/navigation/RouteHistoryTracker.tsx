// src/components/navigation/RouteHistoryTracker.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveNavigationPath } from "../../utils/navigationHistory";

const RouteHistoryTracker = () => {
  const location = useLocation();

  useEffect(() => {
    saveNavigationPath(`${location.pathname}${location.search}${location.hash}`);
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default RouteHistoryTracker;

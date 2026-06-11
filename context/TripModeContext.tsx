import React, { createContext, ReactNode, useContext, useState } from "react";

export type TripMode = "passenger" | "cargo";

type TripModeContextValue = {
  tripMode: TripMode;
  setTripMode: (mode: TripMode) => void;
};

const TripModeContext = createContext<TripModeContextValue | undefined>(
  undefined,
);

export const TripModeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tripMode, setTripMode] = useState<TripMode>("passenger");

  return (
    <TripModeContext.Provider value={{ tripMode, setTripMode }}>
      {children}
    </TripModeContext.Provider>
  );
};

export const useTripMode = () => {
  const context = useContext(TripModeContext);

  if (!context) {
    throw new Error("useTripMode must be used within TripModeProvider");
  }

  return context;
};

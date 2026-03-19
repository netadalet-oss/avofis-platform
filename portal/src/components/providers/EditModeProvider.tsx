"use client";

import { createContext, useContext, useState } from "react";

type EditModeContextType = {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
};

const EditModeContext = createContext<EditModeContextType | null>(null);

export function EditModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [editMode, setEditMode] = useState(false);

  return (
    <EditModeContext.Provider value={{ editMode, setEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);

  if (!context) {
    throw new Error("useEditMode must be used within EditModeProvider");
  }

  return context;
}
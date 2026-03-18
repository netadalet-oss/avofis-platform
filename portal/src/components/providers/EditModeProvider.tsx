"use client";

import { createContext, useContext, useState } from "react";

type EditModeContextType = {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
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
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    throw new Error("useEditMode must be used within EditModeProvider");
  }
  return ctx;
}

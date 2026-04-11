"use client";

import { createContext, useContext } from "react";

interface AdminContextValue {
  isMasterAdmin: boolean;
}

const AdminContext = createContext<AdminContextValue>({ isMasterAdmin: false });

export function AdminProvider({
  isMasterAdmin,
  children,
}: {
  isMasterAdmin: boolean;
  children: React.ReactNode;
}) {
  return (
    <AdminContext.Provider value={{ isMasterAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}

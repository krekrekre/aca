"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AdminHeaderSlotContextValue {
    content: ReactNode;
    setContent: (node: ReactNode) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const AdminHeaderSlotContext = createContext<AdminHeaderSlotContextValue | null>(null);

export function AdminHeaderSlotProvider({ children }: { children: ReactNode }) {
    const [content, setContent] = useState<ReactNode>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <AdminHeaderSlotContext.Provider value={{ content, setContent, sidebarOpen, setSidebarOpen }}>
            {children}
        </AdminHeaderSlotContext.Provider>
    );
}

export function useAdminHeaderSlot() {
    const ctx = useContext(AdminHeaderSlotContext);
    return ctx;
}

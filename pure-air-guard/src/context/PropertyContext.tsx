import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Property {
  id: string;
  name: string;
  address: string;
  postcode: string;
  notes?: string;
  createdAt: string;
}

interface PropertyContextValue {
  properties: Property[];
  activeProperty: Property | null;
  setActiveProperty: (id: string) => void;
  addProperty: (p: Omit<Property, "id" | "createdAt">) => void;
  updateProperty: (id: string, p: Partial<Omit<Property, "id" | "createdAt">>) => void;
  removeProperty: (id: string) => void;
}

const PropertyContext = createContext<PropertyContextValue | null>(null);

const STORAGE_KEY = "pag_properties";
const ACTIVE_KEY = "pag_active_property";

function load(): Property[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(properties: Property[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
}

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(load);
  const [activeId, setActiveId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_KEY) || null
  );

  const activeProperty = properties.find(p => p.id === activeId) || properties[0] || null;

  const setActiveProperty = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }, []);

  const addProperty = useCallback((data: Omit<Property, "id" | "createdAt">) => {
    const newProp: Property = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProperties(prev => {
      const updated = [...prev, newProp];
      save(updated);
      return updated;
    });
    setActiveId(id => {
      if (!id) {
        localStorage.setItem(ACTIVE_KEY, newProp.id);
        return newProp.id;
      }
      return id;
    });
  }, []);

  const updateProperty = useCallback((id: string, data: Partial<Omit<Property, "id" | "createdAt">>) => {
    setProperties(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...data } : p);
      save(updated);
      return updated;
    });
  }, []);

  const removeProperty = useCallback((id: string) => {
    setProperties(prev => {
      const updated = prev.filter(p => p.id !== id);
      save(updated);
      if (activeId === id) {
        const next = updated[0]?.id || null;
        setActiveId(next);
        if (next) localStorage.setItem(ACTIVE_KEY, next);
        else localStorage.removeItem(ACTIVE_KEY);
      }
      return updated;
    });
  }, [activeId]);

  return (
    <PropertyContext.Provider value={{ properties, activeProperty, setActiveProperty, addProperty, updateProperty, removeProperty }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error("useProperty must be used within PropertyProvider");
  return ctx;
}

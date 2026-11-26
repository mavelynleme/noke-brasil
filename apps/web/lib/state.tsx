"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { demoRepository, initialState, type DemoState } from "./demo";
type StateContext = {
  state: DemoState;
  update: (change: (current: DemoState) => DemoState) => void;
};
const Context = createContext<StateContext | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>();
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      setState(demoRepository.load());
    } catch {
      setStorageAvailable(false);
      setState(initialState());
    }
  }, []);
  useEffect(() => {
    if (!state || !storageAvailable) return;
    try {
      demoRepository.save(state);
    } catch {
      setStorageAvailable(false);
    }
  }, [state, storageAvailable]);

  if (!state)
    return (
      <main className="page">
        <p role="status">Carregando demonstração…</p>
      </main>
    );

  return (
    <Context.Provider
      value={{
        state,
        update: (change) => setState((current) => current && change(current)),
      }}
    >
      {!storageAvailable && (
        <p className="storage-notice" role="status">
          O navegador bloqueou o armazenamento. Os dados durarão até esta página
          ser fechada ou recarregada.
        </p>
      )}
      {children}
    </Context.Provider>
  );
}
export function useDemo() {
  const context = useContext(Context);
  if (!context) throw new Error("DemoProvider ausente");
  return context;
}

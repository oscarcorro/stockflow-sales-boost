import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigationType, NavigationType } from "react-router-dom";

/**
 * Devuelve 'forward' o 'back' en función del movimiento del usuario.
 * Usa el índice del historial (history.state.idx) y el tipo de navegación.
 */
export function useRouteDirection() {
  const location = useLocation();
  const navType = useNavigationType();
  const [dir, setDir] = useState<"forward" | "back">("forward");
  const lastIdxRef = useRef<number | null>(null);

  useEffect(() => {
    // React Router v6 guarda el índice en history.state.idx
    const currentIdx = (window.history.state && window.history.state.idx) ?? 0;

    // Recuperamos el último índice guardado en sessionStorage
    const stored = sessionStorage.getItem("__rr_last_idx__");
    const prevIdx = stored ? Number(stored) : null;

    let nextDir: "forward" | "back" = "forward";

    if (navType === NavigationType.Pop) {
      // Gestos del navegador (atrás/adelante)
      if (prevIdx !== null) {
        nextDir = currentIdx < prevIdx ? "back" : "forward";
      } else {
        nextDir = "back";
      }
    } else if (navType === NavigationType.Push) {
      nextDir = "forward";
    } else if (navType === NavigationType.Replace) {
      // reemplazos suelen sentirse neutrales → lo tratamos como forward
      nextDir = "forward";
    }

    setDir(nextDir);
    sessionStorage.setItem("__rr_last_idx__", String(currentIdx));
    lastIdxRef.current = currentIdx;
  }, [location.key, navType]);

  return dir;
}

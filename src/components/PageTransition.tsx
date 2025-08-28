import React from "react";
import { motion, useReducedMotion } from "framer-motion";

type Variant = "forward" | "back" | "detail";

/**
 * Exageramos forward y detail, mantenemos back (volver al dashboard) igual.
 * - forward: slide más largo (±64px)
 * - back: slide corto (±28px) → NO tocamos (dashboard)
 * - detail: zoom-in más marcado (0.9 → 1), con leve desplazamiento vertical
 */
const variantsByType = (reduced: boolean) => ({
  // AVANZAR (push): SOLO slide derecha -> centro, y salida a la izq
  forward: {
    initial: reduced ? { opacity: 0 } : { opacity: 0, x: 64 },
    animate: reduced ? { opacity: 1 } : { opacity: 1, x: 0 },
    exit: reduced ? { opacity: 0 } : { opacity: 0, x: -64 },
  },

  // VOLVER (pop): SOLO slide izquierda -> centro, y salida a la dcha
  // ⚠️ No lo exageramos: esta es la que usamos para / y /dashboard
  back: {
    initial: reduced ? { opacity: 0 } : { opacity: 0, x: -28 },
    animate: reduced ? { opacity: 1 } : { opacity: 1, x: 0 },
    exit: reduced ? { opacity: 0 } : { opacity: 0, x: 28 },
  },

  // DETALLE: SOLO zoom-in más marcado (0.9 → 1), leve y para refuerzo
  detail: {
    initial: reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 },
    animate: reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 },
    exit: reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -12 },
  },
});

const PageTransition: React.FC<{
  children: React.ReactNode;
  variant?: Variant;
}> = ({ children, variant = "forward" }) => {
  const reduced = useReducedMotion();
  const v = variantsByType(reduced)[variant];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }} // un pelín más lenta y suave
        className="absolute inset-0 h-full w-full overflow-hidden transform-gpu"
        style={{ willChange: "transform" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PageTransition;

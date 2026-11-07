import { lazy, Suspense, useRef } from "react";

const Scene3D = lazy(() => import("./Scene3D"));

// The 3D headphones, fixed behind the whole page.
// Drag sideways (mouse or finger) to turn them; scrolling up and down still works.
export default function Stage({ color, stage, glow, rtl }) {
  const spin = useRef(0);
  const lastX = useRef(null);

  const down = (e) => (lastX.current = e.clientX);
  const move = (e) => {
    if (lastX.current === null) return;
    spin.current += (e.clientX - lastX.current) * 0.01;
    lastX.current = e.clientX;
  };
  const up = () => (lastX.current = null);

  return (
    <div
      className="fixed inset-0 z-10 cursor-grab active:cursor-grabbing touch-pan-y"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
    >
      {/* Spotlight behind the product, in the chosen color */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vmin] h-[70vmin] rounded-full blur-[120px] opacity-35 transition-colors duration-1000 pointer-events-none"
        style={{ background: glow }}
      />
      <Suspense fallback={null}>
        <Scene3D color={color} stage={stage} spin={spin} rtl={rtl} />
      </Suspense>
    </div>
  );
}

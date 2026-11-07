import { useEffect, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import { colors, features } from "./data/product";
import { useLanguage } from "./useLanguage";
import Header from "./components/Header";
import Stage from "./components/Stage";
import { Hero, Feature, Stats, Colors, SpecList, Buy } from "./components/Sections";
import Footer from "./components/Footer";

// true for very dark colors, so the spotlight turns silver instead of black
function isDark(hex) {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 60;
}

export default function App() {
  const { lang, toggle } = useLanguage();
  const [color, setColor] = useState(colors[0].hex);
  const stage = useRef(0); // which section is on screen (2.5 = halfway between sections 2 and 3)

  // Follow the scroll and work out the section number for the 3D model
  useEffect(() => {
    const update = () => {
      const tops = [...document.querySelectorAll("[data-stage]")].map((s) => s.offsetTop);
      const y = window.scrollY;
      let i = 0;
      while (i < tops.length - 1 && y >= tops[i + 1]) i++;
      const next = tops[i + 1] ?? tops[i] + window.innerHeight;
      stage.current = i + Math.min(1, Math.max(0, (y - tops[i]) / (next - tops[i])));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const ids = ["sound", "silence", "battery"];

  return (
    // reducedMotion="user": no animations for visitors who turned motion off
    <MotionConfig reducedMotion="user">
      <Header lang={lang} onToggle={toggle} />
      <Stage color={color} stage={stage} glow={isDark(color) ? "#9aa0ad" : color} rtl={lang === "ar"} />

      {/* The page text sits above the 3D. The mouse passes through it (to drag the headphones),
          only links and buttons catch it */}
      <main className="relative z-20 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <Hero lang={lang} />
        {features.map((f, i) => (
          <Feature key={f.number} f={f} lang={lang} id={ids[i]} side={i % 2 === 0 ? "start" : "end"} />
        ))}
        <Stats lang={lang} />
        <Colors lang={lang} color={color} setColor={setColor} />
        <SpecList lang={lang} />
        <Buy lang={lang} color={color} />
      </main>
      <Footer lang={lang} />

      {/* Fine film grain over everything */}
      <div className="grain fixed inset-0 z-50 pointer-events-none" />
    </MotionConfig>
  );
}

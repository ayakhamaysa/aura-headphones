import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { colors, features, product, specs, stats } from "../data/product";
import { ui } from "../data/ui";

// Text that rises softly into view
function Rise({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.4 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// A number that counts up when it comes into view
function Counter({ to, suffix }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const run = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => run.stop();
  }, [seen, to]);
  return (
    <span ref={ref} dir="ltr">
      {n}
      <span className="text-haze">{suffix}</span>
    </span>
  );
}

// One full-screen section. data-stage tells the 3D model which pose to take
function Section({ id, children, className = "" }) {
  return (
    <section id={id} data-stage className={`relative min-h-svh flex ${className}`}>
      {children}
    </section>
  );
}

export function Hero({ lang }) {
  const t = ui[lang];
  return (
    <Section id="top" className="items-end justify-center pb-16 md:pb-20">
      {/* The giant name behind the headphones */}
      <h1
        className="outline-text font-display font-bold absolute inset-x-0 top-[18%] md:top-1/2 md:-translate-y-1/2 text-center leading-none tracking-tighter text-[26vw] select-none"
        dir="ltr"
      >
        AURA
      </h1>
      <Rise className="relative text-center px-5">
        <p className="label">{t.introducing}</p>
        <p className="shine font-display font-bold text-5xl md:text-7xl tracking-tight mt-3" dir="ltr">
          AURA ONE
        </p>
        <p className="text-haze mt-4 max-w-md mx-auto leading-relaxed">{t.heroText}</p>
        <div className="flex justify-center items-center gap-5 mt-7">
          <a href="#buy" className="bg-pearl text-void font-semibold rounded-full px-7 py-3 hover:bg-white transition-colors">
            {t.buy} · {product.price[lang]}
          </a>
          <a href="#sound" className="text-sm text-haze hover:text-pearl">
            {t.explore} ↓
          </a>
        </div>
      </Rise>
    </Section>
  );
}

// side: "start" or "end" — the text sits on the side opposite the headphones
export function Feature({ f, lang, side, id }) {
  return (
    <Section id={id} className={`items-end md:items-center px-5 md:px-[8vw] pb-20 md:pb-0 ${side === "end" ? "md:justify-end" : ""}`}>
      <Rise className="max-w-md bg-void/60 md:bg-transparent backdrop-blur md:backdrop-blur-none rounded-3xl p-6 md:p-0">
        <p className="label" dir="ltr">
          {f.number} — AURA ONE
        </p>
        <h2 className="font-display font-bold text-5xl md:text-7xl tracking-tight leading-[0.95] mt-5">{f[lang].title}</h2>
        <div className="w-12 h-px bg-pearl/30 my-6" />
        <p className="text-haze text-lg leading-relaxed">{f[lang].text}</p>
      </Rise>
    </Section>
  );
}

export function Stats({ lang }) {
  const t = ui[lang];
  return (
    <Section id="stats" className="items-end px-5 md:px-[8vw] pb-20">
      <div className="w-full">
        <Rise>
          <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight text-center">{t.statsTitle}</h2>
        </Rise>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-edge mt-12 rounded-3xl overflow-hidden border border-edge">
          {stats.map((s, i) => (
            <Rise key={s.en} delay={i * 0.08} className="bg-void/80 backdrop-blur p-6 md:p-8">
              <p className="font-display font-bold text-5xl md:text-6xl">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="text-haze text-sm mt-2">{s[lang]}</p>
            </Rise>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Colors({ lang, color, setColor }) {
  const t = ui[lang];
  const picked = colors.find((c) => c.hex === color) ?? colors[0];
  return (
    // Showroom layout: title at the top, headphones in the middle (3D), name + swatches at the bottom
    <Section id="colors" className="flex-col items-center justify-between text-center px-5 pt-24 [@media(max-height:700px)]:pt-20 pb-12 md:pb-14 [@media(max-height:700px)]:pb-8">
      <Rise>
        <p className="label">{t.colorsTitle}</p>
        <h2 className="font-display font-semibold text-3xl md:text-5xl [@media(max-height:700px)]:md:text-3xl tracking-tight leading-snug mt-3 shine">{t.colorsText}</h2>
      </Rise>

      <Rise className="flex flex-col items-center">
        {/* The name changes softly with every color */}
        <motion.p
          key={picked.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-xl md:text-2xl tracking-wide"
        >
          {picked[lang]}
        </motion.p>
        <p className="label mt-3">AURA ONE · {product.price[lang]}</p>

        {/* Round swatches; the chosen one gets a thin ring around it */}
        <div className="flex items-center gap-5 mt-6 [@media(max-height:700px)]:mt-4">
          {colors.map((c) => {
            const on = c.hex === color;
            return (
              <button
                key={c.id}
                onClick={() => setColor(c.hex)}
                aria-label={c[lang]}
                aria-pressed={on}
                className={`relative w-9 h-9 rounded-full transition-transform duration-300 hover:scale-110 ${on ? "scale-110" : ""}`}
              >
                <span
                  className="absolute inset-0 rounded-full border border-white/25 shadow-[inset_0_2px_6px_rgba(255,255,255,0.25),inset_0_-4px_8px_rgba(0,0,0,0.45)]"
                  style={{ background: c.hex }}
                />
                {on && <motion.span layoutId="swatch-ring" className="absolute -inset-[7px] rounded-full border border-pearl/80" />}
              </button>
            );
          })}
        </div>
      </Rise>
    </Section>
  );
}

export function SpecList({ lang }) {
  const t = ui[lang];
  return (
    <Section id="specs" className="items-center px-5 md:px-[8vw] md:justify-end pb-16 md:pb-0">
      <Rise className="w-full max-w-lg bg-void/70 md:bg-void/40 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-edge">
        <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">{t.specsTitle}</h2>
        <dl className="mt-8 divide-y divide-edge">
          {specs.map((s) => (
            <div key={s.en[0]} className="flex justify-between gap-6 py-4">
              <dt className="text-haze">{s[lang][0]}</dt>
              <dd className="font-semibold text-end">{s[lang][1]}</dd>
            </div>
          ))}
        </dl>
        <p className="text-haze text-sm mt-6">{t.inBox}</p>
      </Rise>
    </Section>
  );
}

export function Buy({ lang, color }) {
  const t = ui[lang];
  const colorName = colors.find((c) => c.hex === color)?.[lang];
  const whatsapp = `https://wa.me/${product.whatsapp}?text=${encodeURIComponent(t.whatsapp(colorName))}`;
  return (
    <Section id="buy" className="items-end justify-center px-5 pb-20 text-center">
      <Rise>
        <h2 className="shine font-display font-bold text-6xl md:text-8xl tracking-tight">{t.ctaTitle}</h2>
        <p className="text-haze mt-4">{t.ctaText}</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <a href={whatsapp} target="_blank" className="bg-pearl text-void font-semibold rounded-full px-9 py-4 hover:bg-white transition-colors">
            {t.buy} · {product.price[lang]}
          </a>
          <span className="text-haze text-sm">
            {colorName} · {t.ctaText.split(".")[0]}
          </span>
        </div>
      </Rise>
    </Section>
  );
}

import { product } from "../data/product";
import { ui } from "../data/ui";

const ids = ["sound", "silence", "battery", "colors", "specs"];

export default function Header({ lang, onToggle }) {
  const t = ui[lang];
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-void/40 backdrop-blur-xl border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-5 h-14 flex items-center gap-8 text-sm">
        <a href="#top" className="font-display font-bold tracking-[0.3em]" dir="ltr">
          {product.name}
        </a>
        <div className="hidden md:flex gap-7 mx-auto text-haze">
          {t.nav.map((label, i) => (
            <a key={ids[i]} href={`#${ids[i]}`} className="hover:text-pearl transition-colors">
              {label}
            </a>
          ))}
        </div>
        <button onClick={onToggle} className="ms-auto md:ms-0 text-haze hover:text-pearl">
          {t.switchTo}
        </button>
        <a href="#buy" className="bg-pearl text-void font-semibold rounded-full px-5 py-2 hover:bg-white transition-colors">
          {t.buy}
        </a>
      </nav>
    </header>
  );
}

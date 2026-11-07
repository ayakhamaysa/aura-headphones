import { product } from "../data/product";
import { ui } from "../data/ui";

export default function Footer({ lang }) {
  const t = ui[lang];
  return (
    <footer className="relative z-20 border-t border-edge bg-void">
      <div className="max-w-7xl mx-auto px-5 py-8 flex flex-col sm:flex-row gap-3 justify-between text-sm text-haze">
        <p className="font-display font-bold tracking-[0.25em] text-pearl" dir="ltr">
          {product.name}
        </p>
        <p className="flex flex-wrap gap-x-4">
          <span>
            {t.madeBy}{" "}
            <a href="https://www.instagram.com/oneclick.ps" target="_blank" className="font-semibold text-pearl">
              One Click
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}

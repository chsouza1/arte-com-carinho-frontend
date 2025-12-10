export function SiteFooter() {
  return (
    <footer className="border-t border-rose-100 bg-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Arte com Carinho. Feito ponto a ponto com amor.</p>
        <p className="text-[11px]">
          Enxoval bordado sob medida • Toalhas, babadores e roupinhas de recém-nascido.
        </p>
          <p className="text-[11px]">
          <a href="https://github.com/chsouza1">Dev por Chsouza1</a>
        </p>
      </div>
    </footer>
  );
}

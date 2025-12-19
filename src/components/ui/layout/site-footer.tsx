import { Instagram, Facebook, Heart, Sparkles, Code } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative border-t-2 border-rose-200 bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 backdrop-blur-xl overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-200/15 to-transparent rounded-full blur-2xl"></div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3 md:gap-12">
          {/* Coluna 1: Info principal */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 p-2.5 shadow-md">
                <Heart className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                  Arte com Carinho
                </p>
                <p className="text-xs font-semibold text-rose-500">
                  By Simone
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Enxoval bordado sob medida • Toalhas, babadores e roupinhas de recém-nascido feitos com muito carinho.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Sparkles className="h-4 w-4 text-rose-400" />
              <p className="text-xs font-semibold text-slate-700">
                Cada peça é única e especial
              </p>
            </div>
          </div>

          {/* Coluna 2: Redes sociais */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500"></span>
              Redes Sociais
            </h3>
            
            <div className="flex flex-col gap-3">
              <a
                href="https://www.instagram.com/artecomcarinho75/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 px-4 py-3 transition-all hover:shadow-lg hover:scale-105 hover:border-pink-300 active:scale-95"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 shadow-sm">
                  <Instagram className="h-5 w-5 text-pink-600" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-xs font-bold text-slate-800">Instagram</div>
                  <div className="text-[11px] text-slate-600">@artecomcarinho75</div>
                </div>
              </a>

              <a
                href="https://www.facebook.com/artecomcarinho75"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 px-4 py-3 transition-all hover:shadow-lg hover:scale-105 hover:border-blue-300 active:scale-95"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 shadow-sm">
                  <Facebook className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-xs font-bold text-slate-800">Facebook</div>
                  <div className="text-[11px] text-slate-600">artecomcarinho75</div>
                </div>
              </a>
            </div>
          </div>

          {/* Coluna 3: Info adicional e créditos */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500"></span>
              Informações
            </h3>

            <div className="space-y-3">
              <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 px-4 py-3">
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  Localização
                </p>
                <p className="text-xs text-slate-600">
                  Mandirituba, Paraná, Brasil
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 px-4 py-3">
                <p className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Atendimento
                </p>
                <p className="text-xs text-slate-600">
                  Personalizado via WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent"></div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-rose-100 to-pink-100 p-1.5">
              <Heart className="h-3 w-3 text-rose-600" />
            </div>
            <p className="text-xs font-semibold text-slate-600">
              © {new Date().getFullYear()} Arte com Carinho By Simone
            </p>
          </div>

          <a
            href="https://github.com/chsouza1"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-100 to-gray-100 border-2 border-slate-200 px-4 py-2 transition-all hover:shadow-md hover:scale-105 hover:border-slate-300 active:scale-95"
          >
            <Code className="h-4 w-4 text-slate-600 group-hover:text-rose-600 transition-colors" />
            <span className="text-xs font-bold text-slate-700 group-hover:text-rose-600 transition-colors">
              Desenvolvido por chsouza1
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
import { Instagram, Facebook, Heart, MapPin, MessageCircle, Code, Scissors } from "lucide-react";

export function SiteFooter() {
  return (
    // FUNDO: Creme (#FAF7F5) com borda superior pontilhada
    <footer className="relative bg-[#FAF7F5] border-t-4 border-dashed border-[#D7CCC8] pt-16 pb-8 overflow-hidden text-[#5D4037]">
      
      {/* Elementos decorativos de fundo (opcionais, sutis) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-[#EFEBE9]"></div>
      
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-3 md:gap-16">
          
          {/* Coluna 1: Sobre a Marca */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 border-2 border-[#D7CCC8] rounded-full bg-white">
                <Scissors className="h-6 w-6 text-[#E53935]" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#5D4037]">Arte com Carinho</h3>
                <p className="text-xs font-medium text-[#8D6E63] italic tracking-wide">By Simone</p>
              </div>
            </div>
            
            <p className="text-sm text-[#8D6E63] leading-relaxed font-medium">
              Transformando tecidos em memórias. Enxoval bordado sob medida, toalhas e mimos para recém-nascidos feitos à mão com amor em cada ponto.
            </p>

            <div className="flex items-center gap-2 pt-2 text-[#E53935] font-serif italic">
              <Heart className="h-4 w-4 fill-current" />
              <span className="text-sm">Feito à mão no Brasil</span>
            </div>
          </div>

          {/* Coluna 2: Redes Sociais (Estilo Botão de Tecido) */}
          <div className="space-y-6">
            <h4 className="font-serif text-lg font-bold text-[#5D4037] flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#E53935]"></span> Redes Sociais
            </h4>
            
            <div className="flex flex-col gap-4">
              <a
                href="https://www.instagram.com/artecomcarinho75/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-3 rounded-xl bg-white border border-[#D7CCC8] hover:border-[#E53935] hover:shadow-md transition-all duration-300"
              >
                <div className="bg-[#FAF7F5] p-2 rounded-full group-hover:bg-[#FFEBEE] transition-colors">
                  <Instagram className="h-5 w-5 text-[#C13584]" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold text-[#5D4037] tracking-wider">Instagram</div>
                  <div className="text-sm text-[#8D6E63] group-hover:text-[#E53935]">@artecomcarinho75</div>
                </div>
              </a>

              <a
                href="https://www.facebook.com/artecomcarinho75"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-3 rounded-xl bg-white border border-[#D7CCC8] hover:border-[#1877F2] hover:shadow-md transition-all duration-300"
              >
                <div className="bg-[#FAF7F5] p-2 rounded-full group-hover:bg-[#E3F2FD] transition-colors">
                  <Facebook className="h-5 w-5 text-[#1877F2]" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold text-[#5D4037] tracking-wider">Facebook</div>
                  <div className="text-sm text-[#8D6E63] group-hover:text-[#1877F2]">artecomcarinho75</div>
                </div>
              </a>
            </div>
          </div>

          {/* Coluna 3: Contato e Localização */}
          <div className="space-y-6">
            <h4 className="font-serif text-lg font-bold text-[#5D4037] flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#E53935]"></span> Contato
            </h4>

            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-[#8D6E63] mt-1" />
                <div>
                  <p className="text-xs uppercase font-bold text-[#A1887F] tracking-widest">Localização</p>
                  <p className="text-sm font-medium text-[#5D4037]">Mandirituba, Paraná</p>
                </div>
              </div>

              <div className="flex gap-3">
                <MessageCircle className="h-5 w-5 text-[#8D6E63] mt-1" />
                <div>
                  <p className="text-xs uppercase font-bold text-[#A1887F] tracking-widest">Atendimento</p>
                  <p className="text-sm font-medium text-[#5D4037]">Segunda a Sexta, 09h às 18h</p>
                  <p className="text-xs text-[#E53935] mt-1 font-bold">Via WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divisor Decorativo (Costura) */}
        <div className="my-10 border-t-2 border-dashed border-[#D7CCC8]"></div>

        {/* Rodapé Inferior */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="font-serif italic text-[#5D4037]">© {new Date().getFullYear()} Arte com Carinho</span>
            <span className="hidden sm:inline text-[#D7CCC8]">•</span>
            <span className="text-xs text-[#8D6E63]">Todos os direitos reservados.</span>
          </div>

          <a
            href="https://github.com/chsouza1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-[#D7CCC8] text-[#8D6E63] hover:text-[#E53935] hover:border-[#E53935] bg-white transition-all text-xs font-bold uppercase tracking-widest"
          >
            <Code className="h-3 w-3" />
            Dev by chsouza1
          </a>
        </div>
      </div>
    </footer>
  );
}
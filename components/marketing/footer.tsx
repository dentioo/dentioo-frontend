import Link from "next/link"
import { Linkedin, Github, Instagram, Send } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contact" className="bg-gray-50 border-t border-gray-200">
      <div className="w-full px-3 sm:px-3 md:px-3 lg:px-4 py-20">
        <div className="max-w-[100rem] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-900 mb-6">@dentioo</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <a 
                href="https://www.linkedin.com/in/initpedro/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900 transition-all duration-300" 
                title="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://github.com/initpedro" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900 transition-all duration-300" 
                title="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com/initpedro" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900 transition-all duration-300" 
                title="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://wa.me/5534998731732?text=Olá, Dentioo! Vim pelo seu Website e gostaria de saber mais!" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900 transition-all duration-300" 
                title="WhatsApp"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-gray-600">© 2025 @dentioo</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-4">Links Úteis</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition">
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition">
                  Preços
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-gray-600 hover:text-gray-900 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-600 hover:text-gray-900 transition">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacidade" className="text-gray-600 hover:text-gray-900 transition">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-gray-600 hover:text-gray-900 transition">
                  Termos
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-gray-900 transition">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-4">Acesso</h4>
            <ul className="space-y-2 text-sm mb-6">
              <li>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 transition">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="text-gray-600 hover:text-gray-900 transition">
                  Cadastro
                </Link>
              </li>
            </ul>
            <h4 className="font-semibold text-gray-900 text-sm mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:pedro16hf@gmail.com" className="text-gray-600 hover:text-gray-900 transition">
                  Email
                </a>
              </li>
              <li>
                <a href="https://wa.me/5534998731732" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <p>
              Desenvolvido{' '}
              <span className="inline-flex items-center gap-0.5 text-color-primary">
                &lt;/&gt;
              </span>
              {' '}por{' '}
              <a
                href="https://instagram.com/initpedro"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-color-primary hover:text-color-primary-light transition"
              >
                @initpedro
              </a>
            </p>
            <span className="hidden sm:inline">•</span>
            <p>61.***.***/0001-37</p>
          </div>
          <p>&copy; {currentYear} Dentioo. Todos os direitos reservados.</p>
        </div>
        </div>
      </div>
    </footer>
  )
}

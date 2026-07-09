import { Sparkles, Globe, Code2, Mail } from 'lucide-react'

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000'

const links = {
  Product: ['Features', 'Demo', 'Pricing', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service'],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          {/* Logo + tagline */}
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">pptAI</span>
            </a>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              AI-powered presentation generator. From idea to a beautiful slide deck in seconds.
            </p>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Start for free →
            </a>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">© 2025 pptAI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {[Globe, Code2, Mail].map((Icon, i) => (
              <a key={i} href="#" className="text-white/30 hover:text-white transition-colors">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

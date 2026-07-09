import { Globe, Code2, Mail } from 'lucide-react'
import Logo from './Logo'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-white/40 backdrop-blur-md border-t border-white/40 py-16 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16"
        >
          <div className="md:col-span-1">
            <a href="/" className="text-gray-900 flex items-center gap-2 mb-4 group">
              <Logo className="w-6 h-6 transition-transform group-hover:scale-110" />
              <span className="font-semibold text-xl tracking-tight">pptAI</span>
            </a>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Ship beautiful presentations effortlessly. Powered by Gemini and DALL-E 3.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">How it works</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Templates</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">About</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400 text-sm">© 2026 pptAI. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {[Globe, Code2, Mail].map((Icon, i) => (
              <motion.a 
                key={i} 
                href="#" 
                whileHover={{ scale: 1.1, y: -2 }}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <Icon size={18} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

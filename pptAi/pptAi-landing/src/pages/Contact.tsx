import { motion } from 'framer-motion'
import { Mail, Send, MapPin, Phone } from 'lucide-react'

export default function Contact() {
  return (
    <main className="relative z-10 min-h-[90vh] pt-32 pb-24 px-6 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center mb-12"
      >
        <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-3">Get in Touch</p>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Let's talk about the future of presentations
        </h1>
        <p className="text-slate-600 text-lg">
          Have questions, feedback, or want to collaborate? We'd love to hear from you.
        </p>
      </motion.div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1 flex flex-col gap-6"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
              <a href="mailto:work.himu2006@gmail.com" className="text-indigo-600 hover:underline text-sm font-medium">work.himu2006@gmail.com</a>
              <p className="text-slate-500 text-xs mt-1">We aim to reply within 24 hours.</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Call Us</h3>
              <p className="text-slate-600 text-sm font-medium">+91 (123) 456-7890</p>
              <p className="text-slate-500 text-xs mt-1">Mon-Fri, 9am - 6pm IST</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Visit Us</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Silicon Valley Tech Park<br />
                Innovation Block 4, Suite 101<br />
                Bangalore, India
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Form Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Send a Message</h2>
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                <input type="text" placeholder="John" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                <input type="text" placeholder="Doe" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <input type="email" placeholder="john@company.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
              <textarea placeholder="How can we help you?" rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"></textarea>
            </div>

            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20 mt-2">
              Send Message <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>

      </div>
    </main>
  )
}

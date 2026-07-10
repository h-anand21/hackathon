import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, BookOpen, Clock, ArrowRight, Loader2 } from 'lucide-react'

// Define types for RSS JSON API response
interface RSSPost {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  description: string;
  enclosure?: {
    link: string;
  };
}

export default function Blog() {
  const [posts, setPosts] = useState<RSSPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://hanand.hashnode.dev/rss.xml');
        const data = await response.json();
        
        if (data && data.items) {
          // Get the latest 3 posts
          setPosts(data.items.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching Hashnode RSS posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <main className="relative z-10 min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center mb-16"
      >
        <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">Our Thoughts</p>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">
          Read the pptAI Blog
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
          Insights on artificial intelligence, design engineering, and the future of productivity software.
        </p>
        <a 
          href="https://hanand.hashnode.dev/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-full transition-colors shadow-lg"
        >
          <BookOpen className="w-5 h-5" />
          Read all posts on Hashnode
          <ExternalLink className="w-4 h-4" />
        </a>
      </motion.div>

      {/* Featured Posts */}
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 w-full col-span-1 md:col-span-2 lg:col-span-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium tracking-wide">Fetching latest posts from Hashnode...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post, index) => {
            const date = new Date(post.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            // Clean up the description to remove HTML tags and truncate for the brief
            let cleanBrief = post.description.replace(/<[^>]+>/g, '').trim();
            if (cleanBrief.length > 120) {
              cleanBrief = cleanBrief.substring(0, 120) + '...';
            }

            return (
              <motion.a
                key={index}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + (index * 0.1) }}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
              >
                {/* Image */}
                <div className="w-full h-48 overflow-hidden relative bg-slate-100 flex items-center justify-center">
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10" />
                  {post.thumbnail || post.enclosure?.link ? (
                    <img 
                      src={post.thumbnail || post.enclosure?.link} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <BookOpen className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                
                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    <span>{date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> 5 min read</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                    {cleanBrief}
                  </p>
                  
                  <div className="flex items-center text-blue-600 font-bold text-sm">
                    Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.a>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 w-full col-span-1 md:col-span-2 lg:col-span-3">
            <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium tracking-wide">No posts found on this blog.</p>
          </div>
        )}
      </div>
      
    </main>
  )
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Sparkles, RefreshCw, Copy, Check, Hash, Globe, 
  ArrowRight, Flame, Layers, ExternalLink, Image, Play, Smile
} from 'lucide-react';

interface ScrapeResult {
  scrapedQuery: string;
  scrapedAt: string;
  developmentsList: Array<{
    title: string;
    summary: string;
    sourceTopic: string;
    viralLevel?: string;
  }>;
  coolFonts: Array<{
    name: string;
    transformedText: string;
    vibe: string;
  }>;
  trendingStickers: Array<{
    title: string;
    recommendedPrompt: string;
    category: string;
  }>;
  gifsAndEmotes: Array<{
    combo: string;
    emotionTag: string;
    hypeCaption: string;
  }>;
  communicationAnimations: Array<{
    title: string;
    triggerWord: string;
    motionStyle: string;
  }>;
}

interface ScraperPanelProps {
  onSuggestStickerPrompt: (prompt: string) => void;
  onCopyToPlayground: (text: string) => void;
}

export default function ScraperPanel({
  onSuggestStickerPrompt,
  onCopyToPlayground
}: ScraperPanelProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScrapeResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load standard initial scrape data on mount
  useEffect(() => {
    handleScrape(true);
  }, []);

  const handleScrape = async (isInitialLog = false) => {
    setLoading(true);
    try {
      const response = await fetch('/api/agent/scrape-internet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryQuery: isInitialLog ? "" : query })
      });
      if (response.ok) {
        const payload = await response.json();
        setData(payload);
      }
    } catch (err) {
      console.warn("Using offline fallback trends.", err);
    } finally {
      setLoading(false);
    }
  };

  const executeCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="flex flex-col gap-8 text-[#FFFFFF]">
      
      {/* 1. Header & Live Search Bar */}
      <section className="bg-brand-bg p-6 rounded-none border border-brand-line text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-brand-line text-brand-accent font-mono text-[9px] font-bold p-1 px-3 uppercase mb-2 border border-brand-line">
              <Globe size={11} className="animate-spin text-brand-accent" />
              <span>Real-time Search Grounding active</span>
            </div>
            <h2 className="text-2xl font-display font-black tracking-tighter uppercase text-brand-accent">
              Internet Scraper & Discovery Engine
            </h2>
            <p className="text-xs text-brand-muted mt-2 font-mono uppercase tracking-[0.05em] leading-relaxed">
              Dynamically searches and harvests new communication layouts, designer custom keyboards presets, pixel stickers, copy emojis, and keyboard-activated text animation triggers.
            </p>
          </div>

          <div className="w-full md:w-auto flex-shrink-0">
            <div className="flex bg-brand-bg p-1.5 rounded-none border border-brand-line focus-within:border-brand-accent transition-all w-full md:w-96">
              <input
                id="scraper_keyword_input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type target keywords (e.g. Cyberpunk, Kawaii, Lofi)..."
                className="bg-transparent text-xs text-white focus:outline-none placeholder-brand-muted/70 w-full px-3 font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleScrape(false)}
              />
              <button
                id="trigger_scraper_search"
                disabled={loading}
                onClick={() => handleScrape(false)}
                className="bg-brand-accent hover:bg-white text-brand-bg px-4 py-2 text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <>
                    <span>SCRAPE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {data && (
          <div className="mt-4 pt-3 border-t border-brand-line flex flex-wrap gap-x-6 gap-y-1.5 text-[10px] font-mono text-brand-muted">
            <div>Target Search: <span className="text-brand-accent">"{data.scrapedQuery}"</span></div>
            <div>Scraped At: <span className="text-white">{new Date(data.scrapedAt).toLocaleTimeString()}</span></div>
          </div>
        )}
      </section>

      {loading && (
        <div className="flex flex-col justify-center items-center py-20 gap-3">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-brand-line border-t-brand-accent rounded-full animate-spin" />
          </div>
          <p className="text-xs font-bold text-brand-accent font-mono animate-pulse tracking-widest uppercase">CRAWLING WEB DATABASES & SOCIAL SPACES...</p>
        </div>
      )}

      {/* 2. Interactive Discovery Desktop Grid */}
      <AnimatePresence mode="wait">
        {!loading && data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* COLUMN LEFT: Live Developments & Scraped Custom Fonts */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              
              {/* Box A: Cool Scraped Fonts Premade */}
              <div className="bg-brand-bg border border-brand-line p-6 rounded-none">
                <div className="font-serif italic text-sm text-brand-muted lowercase mb-3">01. captured fonts & bio layouts</div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-display font-black uppercase tracking-tight">
                    Custom Styles Repository
                  </h3>
                  <span className="text-[9px] border border-brand-line text-brand-accent p-1 px-2.5 font-mono uppercase font-bold">1-Click Apply</span>
                </div>
                <p className="text-xs text-brand-muted mb-6 font-mono uppercase">
                  Beautiful stylistic unicode formats harvested from creative micro-blogs. Copy instantly or apply layout directly to your active keyboard playground.
                </p>

                <div className="grid gap-4">
                  {data.coolFonts.map((font, idx) => (
                    <div 
                      key={font.name + idx}
                      className="bg-brand-bg p-4 rounded-none border border-brand-line flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-brand-accent transition-all"
                    >
                      <div>
                        <div className="font-bold text-xs text-white flex items-center flex-wrap gap-1.5">
                          <span>{font.name}</span>
                          <span className="text-[9px] border border-brand-line bg-brand-bg text-brand-accent p-0.5 px-2 font-mono font-medium">{font.vibe}</span>
                        </div>
                        <p className="text-lg font-bold text-brand-accent mt-3 tracking-wide font-mono select-all">
                          {font.transformedText}
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => executeCopy(font.transformedText, `scraped_font_${idx}`)}
                          className="py-1 px-3 bg-brand-bg text-[10px] font-mono font-bold rounded-none border border-brand-line hover:border-white text-white flex items-center gap-1 cursor-pointer"
                          title="Copy text"
                        >
                          {copiedKey === `scraped_font_${idx}` ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                          <span>COPY</span>
                        </button>
                        <button
                          onClick={() => onCopyToPlayground(font.transformedText)}
                          className="py-1 px-3 bg-brand-accent hover:bg-white text-brand-bg text-[10px] uppercase font-mono font-bold rounded-none transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowRight size={11} />
                          <span>PASTE TO BOARD</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box B: Latest content space occurrences */}
              <div className="bg-brand-bg border border-brand-line p-6 rounded-none">
                <div className="font-serif italic text-sm text-brand-muted lowercase mb-3">02. content space developments</div>
                <h3 className="text-base font-display font-black uppercase tracking-tight mb-3">
                  Live Cultural Happenings
                </h3>
                <p className="text-xs text-brand-muted mb-6 font-mono uppercase">
                  Fresh movements collected by monitoring online user design galleries, Slack/Discord presets, and TikTok communities.
                </p>

                <div className="flex flex-col gap-4">
                  {data.developmentsList.map((dev, idx) => (
                    <div 
                      key={dev.title + idx}
                      className="border-l-2 border-brand-accent bg-brand-bg p-4 rounded-none border-y border-r border-brand-line"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-xs font-bold uppercase text-white tracking-widest">{dev.title}</h4>
                        <span className={`text-[9px] font-mono p-0.5 px-2 rounded-none uppercase font-bold shrink-0 ${
                          dev.viralLevel === 'High' ? 'bg-red-950 text-red-400 border border-red-900' :
                          'bg-brand-line text-brand-accent border border-brand-accent/30'
                        }`}>
                          {dev.viralLevel || "Viral"}
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted mt-2 leading-relaxed">{dev.summary}</p>
                      <div className="text-[9px] font-mono text-brand-muted mt-3">Origin: <span className="text-brand-accent font-semibold">{dev.sourceTopic}</span></div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* COLUMN RIGHT: Stickers, Animations, Emojis */}
            <div className="lg:col-span-5 flex flex-col gap-8">

              {/* Box C: Cute Stickers Inspiration */}
              <div className="bg-brand-bg border border-brand-line p-6 rounded-none">
                <div className="font-serif italic text-sm text-brand-muted lowercase mb-3">03. visual indicators</div>
                <h3 className="text-base font-display font-black uppercase tracking-tight mb-1.5">
                  Curated AI Sticker Prompts
                </h3>
                <p className="text-xs text-brand-muted mb-6 font-mono uppercase">
                  Scraped visual micro-trends. Deploy these prompts directly inside our generator to print actual 2D glossy vector sticker assets!
                </p>

                <div className="grid gap-4">
                  {data.trendingStickers.map((sticker, idx) => (
                    <div 
                      key={sticker.title + idx}
                      className="p-4 bg-brand-bg rounded-none border border-brand-line flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-brand-accent transition-all"
                    >
                      <div className="min-w-0">
                        <span className="text-[8px] bg-brand-line text-brand-accent border border-brand-accent/20 p-0.5 px-2 rounded-none font-mono font-bold uppercase">{sticker.category}</span>
                        <h4 className="text-xs font-bold text-white mt-2.5 uppercase tracking-wide">{sticker.title}</h4>
                        <p className="text-[10px] text-brand-muted truncate mt-1 italic" title={sticker.recommendedPrompt}>
                          "{sticker.recommendedPrompt}"
                        </p>
                      </div>

                      <button
                        onClick={() => onSuggestStickerPrompt(sticker.recommendedPrompt)}
                        className="bg-brand-accent hover:bg-white text-brand-bg py-1.5 px-3 rounded-none text-[10px] font-mono font-extrabold uppercase shrink-0 transition-all cursor-pointer"
                        title="Load prompt into creator"
                      >
                        <span>GENERATE</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box D: Beautiful Scraped Kaomojis & Combos */}
              <div className="bg-brand-bg border border-brand-line p-6 rounded-none">
                <div className="font-serif italic text-sm text-brand-muted lowercase mb-3">04. bracket kaomojis</div>
                <h3 className="text-base font-display font-black uppercase tracking-tight mb-1.5">
                  Trending Emotes
                </h3>
                <p className="text-xs text-brand-muted mb-6 font-mono uppercase">
                  Click to copy these internet communication symbols directly.
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {data.gifsAndEmotes.map((item, idx) => (
                    <div 
                      key={item.emotionTag + idx}
                      onClick={() => executeCopy(item.combo, `scraped_combo_${idx}`)}
                      className="p-3 bg-brand-bg hover:border-brand-accent rounded-none border border-brand-line cursor-pointer transition-all flex flex-col justify-between"
                      title="Click to copy combo"
                    >
                      <p className="text-[10px] font-bold text-brand-muted font-mono uppercase">{item.emotionTag}</p>
                      <p className="text-sm font-bold text-brand-accent my-3 select-all break-words font-mono">{item.combo}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-brand-line/50">
                        <span className="text-[9px] text-brand-muted italic shrink-0 truncate max-w-[150px]">{item.hypeCaption}</span>
                        {copiedKey === `scraped_combo_${idx}` ? (
                          <span className="text-[9px] text-brand-accent font-bold">COPIED</span>
                        ) : (
                          <Copy size={10} className="text-brand-muted" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box E: Keyboard-Activated Animation Triggers */}
              <div className="bg-brand-bg border border-brand-line p-6 rounded-none">
                <div className="font-serif italic text-sm text-brand-muted lowercase mb-3">05. keyboard interactive loops</div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="h-1.5 w-1.5 bg-brand-accent animate-ping" />
                  <h3 className="text-base font-display font-black uppercase tracking-tight">System Comm Animations</h3>
                </div>
                <p className="text-xs text-brand-muted mb-6 font-mono uppercase">
                  Typing playground includes reactive animations! Try writing these trigger words on the virtual keyboard to trigger screen ripples & falling sparkles.
                </p>

                <div className="flex flex-col gap-3">
                  {data.communicationAnimations.map((anim, idx) => (
                    <div 
                      key={anim.title + idx}
                      className="p-3 bg-brand-bg rounded-none border border-brand-line text-xs flex justify-between items-center hover:border-brand-accent transition-all"
                    >
                      <div>
                        <span className="font-bold text-white uppercase tracking-wider">{anim.title}</span>
                        <p className="text-[10px] text-brand-muted mt-0.5">{anim.motionStyle}</p>
                      </div>
                      <div className="bg-[#1a1a1a] px-3 py-1.5 border border-brand-line text-[10px] font-mono font-bold text-brand-accent">
                        "{anim.triggerWord}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}

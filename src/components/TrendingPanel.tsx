import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Search, Copy, Check, Info, TrendingUp, HelpCircle, ArrowRight, RefreshCw 
} from 'lucide-react';
import { SlangPhrase, EmojiCombo, KeyboardTheme } from '../types';

interface TrendingPanelProps {
  slangPhrases: SlangPhrase[];
  emojiCombos: EmojiCombo[];
  designThemes: KeyboardTheme[];
  onApplyTheme: (theme: KeyboardTheme) => void;
  activeThemeName: string;
}

export default function TrendingPanel({
  slangPhrases,
  emojiCombos,
  designThemes,
  onApplyTheme,
  activeThemeName
}: TrendingPanelProps) {
  // AI Translator states
  const [inputText, setInputText] = useState("");
  const [vibePrompt, setVibePrompt] = useState("TikTok bio / cool comment");
  const [searchingAI, setSearchingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    slangOption: string;
    aestheticOption: string;
    kaomojiOption: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setSearchingAI(true);
    try {
      const response = await fetch('/api/agent/style-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, promptContext: vibePrompt })
      });
      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data);
      } else {
        throw new Error("Rewrite failed.");
      }
    } catch (err) {
      setAiSuggestions({
        slangOption: `${inputText} but make it lowkey absolute wizardry, legendary fr fr 💅`,
        aestheticOption: `✨ ˚｡⋆ ${inputText} ⋆｡° ✨`,
        kaomojiOption: `(づ｡◕‿‿◕｡)づ [ ${inputText} ]`
      });
    } finally {
      setSearchingAI(false);
    }
  };

  const executeCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="flex flex-col gap-8 w-full text-white">
      
      {/* 1. AI Interactive Slang & Style Rewriter */}
      <section className="bg-brand-bg p-6 rounded-none border border-brand-line">
        <div className="font-serif italic text-sm text-brand-muted lowercase mb-3">01. layout translator & machine styling</div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-display font-black uppercase tracking-tight text-neutral-100">
            AI Slang & Aesthetic Translator
          </h2>
        </div>
        <p className="text-xs text-brand-muted mb-6 font-mono uppercase tracking-wide leading-relaxed">
          Type standard boring text below and let the AI keyboard agent rewrite it into Gen-Z slang, symbol arts, or funny kaomoji emotes!
        </p>

        <form onSubmit={handleTranslate} className="flex flex-col gap-4">
          <textarea
            value={inputText}
            id="trend_style_text_input"
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type standard copy (e.g., 'I am going to study a lot today', 'look at my keyboard preset')..."
            rows={2}
            className="w-full text-xs p-3 rounded-none bg-brand-bg border border-brand-line text-white focus:outline-none focus:border-brand-accent placeholder-brand-muted font-mono"
          />

          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-4">
            <div className="flex items-center gap-2 bg-brand-bg p-2 rounded-none border border-brand-line w-full sm:w-auto">
              <label className="text-[10px] font-mono text-brand-muted font-bold whitespace-nowrap uppercase tracking-wider">VIBE:</label>
              <select
                id="trend_style_vibe_select"
                value={vibePrompt}
                onChange={(e) => setVibePrompt(e.target.value)}
                className="bg-brand-bg text-xs text-white focus:outline-none font-mono uppercase cursor-pointer"
              >
                <option value="tiktok bio">🎵 TikTok Bio Hype</option>
                <option value="cool comment">💬 Sarcastic Comment</option>
                <option value="excited friend">🎉 Super Excited</option>
                <option value="mindful demure">✨ Demure & Modest</option>
              </select>
            </div>

            <button
              type="submit"
              id="trend_style_translate_btn"
              disabled={searchingAI || !inputText}
              className="bg-brand-accent hover:bg-white text-brand-bg font-mono font-black text-xs py-2.5 px-6 rounded-none transition-all flex items-center gap-1.5 justify-center cursor-pointer uppercase tracking-widest shrink-0 disabled:opacity-45"
            >
              {searchingAI ? (
                <>
                  <RefreshCw className="animate-spin" size={13} />
                  <span>TRANSLATING...</span>
                </>
              ) : (
                <>
                  <span>TRANSFORM STYLE</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {aiSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-brand-line grid gap-4 overflow-hidden"
            >
              {/* Option 1: Slang */}
              <div className="bg-brand-bg p-4 rounded-none border border-brand-line flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-brand-accent uppercase tracking-wider">🔥 Gen-Z Slang</span>
                  <p id="slang_option_preview" className="text-xs text-white mt-2 font-medium select-all leading-relaxed">{aiSuggestions.slangOption}</p>
                </div>
                <button
                  id="copy_slang_option_btn"
                  onClick={() => executeCopy(aiSuggestions.slangOption, "slang")}
                  className="p-1.5 border border-brand-line hover:border-white text-brand-muted hover:text-white transition-all flex-shrink-0 cursor-pointer"
                  title="Copy this slang rewrite"
                >
                  {copiedKey === "slang" ? <Check className="text-green-500" size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Option 2: Aesthetic */}
              <div className="bg-brand-bg p-4 rounded-none border border-brand-line flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">✨ Aesthetic Borders</span>
                  <p id="aesthetic_option_preview" className="text-xs text-white mt-2 font-medium select-all leading-relaxed">{aiSuggestions.aestheticOption}</p>
                </div>
                <button
                  id="copy_aesthetic_option_btn"
                  onClick={() => executeCopy(aiSuggestions.aestheticOption, "aesthetic")}
                  className="p-1.5 border border-brand-line hover:border-white text-brand-muted hover:text-white transition-all flex-shrink-0 cursor-pointer"
                  title="Copy this aesthetic rewrite"
                >
                  {copiedKey === "aesthetic" ? <Check className="text-green-500" size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Option 3: Kaomoji */}
              <div className="bg-brand-bg p-4 rounded-none border border-brand-line flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-brand-accent uppercase tracking-wider">(o_O) Kaomoji Emote</span>
                  <p id="kaomoji_option_preview" className="text-xs text-brand-accent mt-2 font-mono select-all break-all leading-relaxed">{aiSuggestions.kaomojiOption}</p>
                </div>
                <button
                  id="copy_kaomoji_option_btn"
                  onClick={() => executeCopy(aiSuggestions.kaomojiOption, "kaomoji")}
                  className="p-1.5 border border-brand-line hover:border-white text-brand-muted hover:text-white transition-all flex-shrink-0 cursor-pointer"
                  title="Copy this emote version"
                >
                  {copiedKey === "kaomoji" ? <Check className="text-green-500" size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 2. Hot Slang Dictionary Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="font-serif italic text-sm text-brand-muted lowercase mb-3">02. community slang archive</div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-display font-black uppercase tracking-tight">Hot Slang Dictionary</h3>
          </div>
          <div id="slang_dictionary_container" className="flex flex-col gap-3 max-h-80 overflow-y-auto scrollbar-thin">
            {slangPhrases.map((sp, idx) => (
              <div key={sp.phrase + idx} className="bg-brand-bg p-3.5 rounded-none border border-brand-line text-xs hover:border-brand-accent transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-brand-accent font-mono">"{sp.phrase}"</span>
                  <span className="text-[9px] border border-brand-line bg-brand-bg p-0.5 px-2 rounded-none opacity-80 text-brand-muted tracking-wider uppercase font-mono">{sp.category}</span>
                </div>
                <p className="text-xs text-brand-muted mt-2 font-sans italic">{sp.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Community theme styling */}
        <div>
          <div className="font-serif italic text-sm text-brand-muted lowercase mb-3">03. active board interfaces</div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-display font-black uppercase tracking-tight">Keyboard Themes</h3>
          </div>
          <div id="trending_themes_container" className="flex flex-col gap-3 max-h-80 overflow-y-auto scrollbar-thin">
            {designThemes.map((theme, idx) => (
              <div 
                key={theme.name + idx} 
                className={`bg-brand-bg p-4 rounded-none border transition-all text-xs flex justify-between items-center ${
                  activeThemeName === theme.name ? 'border-brand-accent' : 'border-brand-line'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                    {theme.name}
                    {activeThemeName === theme.name && <span className="border border-brand-accent text-brand-accent text-[8px] font-mono tracking-widest px-1.5 uppercase font-bold">Active</span>}
                  </div>
                  <p className="text-[10px] text-brand-muted mt-1 uppercase font-mono tracking-wide">{theme.vibeDescription || "Keyboard interface"}</p>
                  
                  {/* Swatch color row */}
                  <div className="flex gap-2 mt-3">
                    <span className="w-4 h-4 rounded-full border border-brand-line" style={{ backgroundColor: theme.primaryColor }} title="Keycaps" />
                    <span className="w-4 h-4 rounded-full border border-brand-line" style={{ backgroundColor: theme.secondaryColor }} title="Board background" />
                    <span className="w-4 h-4 rounded-full border border-brand-line" style={{ backgroundColor: theme.accentColor }} title="Accent action" />
                  </div>
                </div>

                <button
                  id={`apply_theme_${idx}`}
                  onClick={() => onApplyTheme(theme)}
                  className="bg-brand-accent hover:bg-white text-brand-bg text-[9px] font-mono font-black uppercase py-1.5 px-3 rounded-none transition-all cursor-pointer"
                >
                  Apply 
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

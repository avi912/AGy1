import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Copy, Trash2, Volume2, VolumeX, Clipboard, 
  Check, Search, Image, Smile, ArrowLeft, RefreshCw, Pin
} from 'lucide-react';
import { transformText, fontPresets } from '../utils/fonts';
import { KeyboardTheme, FontStyle, SlangPhrase, EmojiCombo, KeyboardHistoryItem } from '../types';

interface InteractiveKeyboardProps {
  activeTheme: KeyboardTheme;
  setActiveTheme: (theme: KeyboardTheme) => void;
  activeFontId: string;
  setActiveFontId: (id: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onCopyText: (text: string, fontName: string) => void;
  onAddHistory: (type: 'text' | 'sticker' | 'gif' | 'font', content: string, label?: string) => void;
  slangPhrases: SlangPhrase[];
  emojiCombos: EmojiCombo[];
  customStickerList: string[];
  addCustomSticker: (url: string) => void;
  inputText: string;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
  initialStickerPrompt: string;
  setInitialStickerPrompt: (prompt: string) => void;
}

const defaultStickersAndMementos = [
  "https://images.unsplash.com/photo-1596495578065-6e0763fa1141?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
];

const giftTags = [
  { slug: "cats", label: "🐈 Kawaii Cats" },
  { slug: "aesthetic", label: "✨ Aesthetic" },
  { slug: "reaction", label: "🎭 Expressions" },
  { slug: "memes", label: "🐸 Cute Memes" }
];

export default function InteractiveKeyboard({
  activeTheme,
  setActiveTheme,
  activeFontId,
  setActiveFontId,
  soundEnabled,
  setSoundEnabled,
  onCopyText,
  onAddHistory,
  slangPhrases,
  emojiCombos,
  customStickerList,
  addCustomSticker,
  inputText,
  setInputText,
  initialStickerPrompt,
  setInitialStickerPrompt
}: InteractiveKeyboardProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'fonts' | 'stickers' | 'gifs' | 'slangs'>('fonts');
  
  // Custom sticker generator states
  const [stickerPrompt, setStickerPrompt] = useState<string>("");
  const [generatingSticker, setGeneratingSticker] = useState<boolean>(false);
  const [stickerError, setStickerError] = useState<string>("");

  // Communication Animations state
  const [isVibrating, setIsVibrating] = useState(false);
  const [sparkleRain, setSparkleRain] = useState<Array<{ id: number, left: number, top: number, size: number, delay: number }>>([]);
  const [heartFloaters, setHeartFloaters] = useState<Array<{ id: number, left: number, size: number }>>([]);

  // Check initialStickerPrompt transfers
  useEffect(() => {
    if (initialStickerPrompt) {
      setStickerPrompt(initialStickerPrompt);
      setActiveTab('stickers');
      setInitialStickerPrompt("");
    }
  }, [initialStickerPrompt, setInitialStickerPrompt]);

  // Handle Typing communication animations triggers
  useEffect(() => {
    if (!inputText) return;
    const normalized = inputText.toLowerCase();

    if (normalized.includes("hype")) {
      setIsVibrating(true);
      const t = setTimeout(() => setIsVibrating(false), 1200);
      return () => clearTimeout(t);
    }
  }, [inputText]);

  useEffect(() => {
    if (!inputText) return;
    const normalized = inputText.toLowerCase();

    if (normalized.includes("magic")) {
      const sparkles = Array.from({ length: 12 }).map(() => ({
        id: Math.random(),
        left: 5 + Math.random() * 90,
        top: -10 - Math.random() * 15,
        size: 10 + Math.random() * 10,
        delay: Math.random() * 0.4
      }));
      setSparkleRain(sparkles);
      const t = setTimeout(() => setSparkleRain([]), 3000);
      return () => clearTimeout(t);
    }
  }, [inputText]);

  useEffect(() => {
    if (!inputText) return;
    const normalized = inputText.toLowerCase();

    if (normalized.includes("love")) {
      const hearts = Array.from({ length: 10 }).map(() => ({
        id: Math.random(),
        left: 10 + Math.random() * 80,
        size: 14 + Math.random() * 14
      }));
      setHeartFloaters(hearts);
      const t = setTimeout(() => setHeartFloaters([]), 3000);
      return () => clearTimeout(t);
    }
  }, [inputText]);
  
  // Audio context for physical click sound effects
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playClickSound = (hz: number) => {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(hz, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("Touch sound couldn't execute safely.", e);
    }
  };

  // Process keyboard typing actions
  const handleKeyPress = (char: string) => {
    playClickSound(480 + char.charCodeAt(0));
    setInputText(prev => prev + char);
  };

  const handleBackspace = () => {
    playClickSound(310);
    setInputText(prev => prev.slice(0, -1));
  };

  const handleSpace = () => {
    playClickSound(350);
    setInputText(prev => prev + " ");
  };

  const handleClear = () => {
    playClickSound(210);
    setInputText("");
  };

  // Convert plaintext using chosen unicode preset
  const currentFormattedText = transformText(inputText, activeFontId);

  // Copy customized formatted string to remote & system clipboard
  const handleCopy = () => {
    if (!inputText) return;
    playClickSound(600);
    
    // Copy real styled text output
    navigator.clipboard.writeText(currentFormattedText);
    onCopyText(currentFormattedText, fontPresets.find(p => p.id === activeFontId)?.name || "Modified plain");
    onAddHistory('text', currentFormattedText, `Font: ${activeFontId}`);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Sticker prompt form generator
  const handleGenerateSticker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stickerPrompt.trim()) return;
    
    setGeneratingSticker(true);
    setStickerError("");
    
    try {
      const response = await fetch('/api/agent/generate-sticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: stickerPrompt })
      });
      
      if (!response.ok) {
        throw new Error("Generation error. Fallback representation loaded.");
      }
      
      const data = await response.json();
      if (data.imageUrl) {
        addCustomSticker(data.imageUrl);
        onAddHistory('sticker', data.imageUrl, `AI: ${stickerPrompt}`);
        setStickerPrompt("");
      } else {
        throw new Error("No image generated.");
      }
    } catch (err: any) {
      const query = encodeURIComponent(stickerPrompt);
      const fallbackUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80&q=sticker+cartoon+vector+${query}`;
      addCustomSticker(fallbackUrl);
      onAddHistory('sticker', fallbackUrl, `Sticker: ${stickerPrompt}`);
      setStickerPrompt("");
      setStickerError("Offline Fallback sticker unlocked! Connect your Gemini key via settings for real live AI generation.");
    } finally {
      setGeneratingSticker(false);
    }
  };

  // Keyboard character map structure
  const row1 = ["q","w","e","r","t","y","u","i","o","p"];
  const row2 = ["a","s","d","f","g","h","j","k","l"];
  const row3 = ["z","x","c","v","b","n","m"];

  return (
    <div id="interactive_keyboard_wrapper" className="flex flex-col gap-6 w-full">
      {/* 1. Sandboxed Board Screen View */}
      <div 
        id="sandbox_screen" 
        className="relative border rounded-none p-6 shadow-2xl transition-all flex flex-col justify-between overflow-hidden"
        style={{ 
          backgroundColor: '#050505',
          borderColor: 'var(--color-brand-line)',
          minHeight: '210px'
        }}
      >
        {/* Floating Sparkles Overlay */}
        <AnimatePresence>
          {sparkleRain.map((sp) => (
            <motion.span
              key={sp.id}
              initial={{ y: -30, opacity: 0, scale: 0.4, rotate: 0 }}
              animate={{ 
                y: 180, 
                opacity: [0, 1, 1, 0], 
                scale: [0.4, 1.3, 1, 0.7],
                rotate: 360 
              }}
              transition={{ duration: 2.2, delay: sp.delay, ease: "easeOut" }}
              className="absolute text-yellow-500 font-mono select-none pointer-events-none text-xs z-10"
              style={{ left: `${sp.left}%` }}
            >
              ✨
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Floating Heart Floaters Overlay */}
        <AnimatePresence>
          {heartFloaters.map((ht) => (
            <motion.span
              key={ht.id}
              initial={{ y: 140, opacity: 0, scale: 0.3 }}
              animate={{ 
                y: -30, 
                opacity: [0, 1, 0.8, 0], 
                scale: [0.3, 1.4, 1, 0.5],
                x: [0, Math.sin(ht.id) * 35, Math.cos(ht.id) * 45]
              }}
              transition={{ duration: 2.4, ease: "easeInOut" }}
              className="absolute text-[#E0FF22] font-mono select-none pointer-events-none text-base z-10"
              style={{ left: `${ht.left}%` }}
            >
              💖
            </motion.span>
          ))}
        </AnimatePresence>

        <div className="flex justify-between items-center mb-3 relative z-20">
          <span 
            className="text-[10px] font-mono tracking-widest uppercase font-bold text-brand-muted"
          >
            📋 Virtual Board Output Monitor
          </span>
          <div className="flex gap-3 items-center">
            {/* Audio Feedback Controller */}
            <button
              id="sound_toggle_action"
              onClick={() => {
                initAudio();
                setSoundEnabled(!soundEnabled);
              }}
              title={soundEnabled ? "Disable key clicks" : "Enable tactile sound"}
              className="p-1 px-3 border border-brand-line text-xs hover:border-white transition-all flex items-center gap-1.5 cursor-pointer bg-brand-bg text-[#FFFFFF]"
            >
              {soundEnabled ? <Volume2 size={13} className="text-brand-accent" /> : <VolumeX size={13} />}
              <span className="text-[10px] font-mono uppercase font-black">{soundEnabled ? "ON" : "MUTE"}</span>
            </button>
            
            {/* Clear board trigger */}
            <button
              id="clear_board_action"
              onClick={handleClear}
              title="Clear text board"
              className="p-1 text-red-500 hover:text-red-400 border border-brand-line p-1 px-2.5 transition-all text-[10px] font-mono font-bold uppercase cursor-pointer"
            >
              [CLEAR]
            </button>
          </div>
        </div>

        {/* Board main typed screen result */}
        <div className="h-32 overflow-y-auto flex flex-col justify-center items-center px-4 relative z-20">
          <motion.p 
            id="formatted_screen_payload" 
            animate={isVibrating ? {
              x: [0, -7, 7, -7, 7, -3, 3, 0],
              y: [0, 4, -4, 4, -4, 2, -2, 0]
            } : {}}
            transition={{ duration: 0.6 }}
            className="text-center text-xl md:text-3xl font-bold tracking-wide transition-all break-all select-all outline-none"
            style={{ 
              color: '#FFFFFF',
              fontFamily: activeTheme.fontFamily === 'Sans' ? 'inherit' : 'VarMono, monospace'
            }}
          >
            {currentFormattedText || <span className="opacity-40 italic font-normal text-sm lowercase text-brand-muted">Type "magic", "hype", or "love" on keyboard below to trigger animations...</span>}
          </motion.p>
        </div>

        {/* Copy text clipboard prompt */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 pt-3 border-t border-brand-line gap-3">
          <span 
            className="text-[10px] font-mono uppercase tracking-wider text-brand-muted"
          >
            ACTIVE LAYOUT: <strong className="underline text-brand-accent">{fontPresets.find(p=>p.id===activeFontId)?.name}</strong>
          </span>

          <button
            id="copy_text_action"
            onClick={handleCopy}
            disabled={!inputText}
            className={`p-2 px-6 rounded-none text-xs font-mono font-black uppercase flex items-center gap-2 transition-all active:scale-95 ${
              !inputText 
                ? 'opacity-30 cursor-not-allowed border border-brand-line text-brand-muted bg-brand-bg' 
                : 'cursor-pointer bg-brand-accent hover:bg-white text-brand-bg'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>COPIED TO CLIPBOARD!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>COPY SYNCED TEXT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Keyboard Control Bar & Sub Panels (Fonts, Gifs, Slang shortcuts) */}
      <div className="flex flex-col gap-4">
        {/* Dock Selector Control tabs */}
        <div className="flex border-b border-brand-line pb-1 gap-2 overflow-x-auto">
          {(['fonts', 'stickers', 'gifs', 'slangs'] as const).map((tab) => (
            <button
              key={tab}
              id={`tab_select_${tab}`}
              onClick={() => { playClickSound(300); setActiveTab(tab); }}
              className={`pb-2 px-4 text-xs font-bold uppercase font-mono tracking-widest border-b-2 transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'border-brand-accent text-brand-accent font-black' 
                  : 'border-transparent text-brand-muted hover:text-white'
              }`}
            >
              {tab === 'slangs' ? '🔥 Slangs & Combo' : tab}
            </button>
          ))}
        </div>

        {/* Dynamic Panel Content space */}
        <div className="bg-brand-bg border border-brand-line p-4 rounded-none min-h-[110px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeTab === 'fonts' && (
              <motion.div 
                key="fonts"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full"
              >
                {fontPresets.map((f) => (
                  <button
                    key={f.id}
                    id={`font_btn_${f.id}`}
                    onClick={() => { playClickSound(400); setActiveFontId(f.id); }}
                    className={`p-3 rounded-none text-left transition-all border font-mono lowercase ${
                      activeFontId === f.id 
                        ? 'bg-brand-accent text-brand-bg border-brand-accent font-black' 
                        : 'bg-brand-bg text-white border-brand-line hover:border-[#888888] cursor-pointer'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate">
                      {f.id === 'standard' ? "plaintext" : transformText("abc style", f.id)}
                    </div>
                    <div className="text-[9px] opacity-70 truncate mt-1 tracking-wider uppercase">{f.vibe}</div>
                  </button>
                ))}
              </motion.div>
            )}

            {activeTab === 'stickers' && (
              <motion.div 
                key="stickers"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="flex flex-col gap-3.5 w-full"
              >
                {/* Custom sticker AI generation form */}
                <form id="ai_sticker_creator_form" onSubmit={handleGenerateSticker} className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      id="ai_sticker_input_prompt"
                      value={stickerPrompt}
                      onChange={(e) => setStickerPrompt(e.target.value)}
                      placeholder="Describe sticker to generate (e.g. lofi kitten, pixel bubble tea)..."
                      className="w-full text-xs p-2.5 pl-3 pr-8 rounded-none bg-brand-bg border border-brand-line text-white focus:outline-none focus:border-brand-accent font-mono"
                    />
                    <Sparkles className="absolute right-3 top-3 text-brand-accent animate-pulse pointer-events-none" size={13} />
                  </div>
                  <button
                    type="submit"
                    id="trigger_sticker_gen"
                    disabled={generatingSticker || !stickerPrompt}
                    className="bg-brand-accent hover:bg-white text-brand-bg text-xs font-mono font-black px-4 rounded-none transition-all uppercase shrink-0 disabled:opacity-45"
                  >
                    {generatingSticker ? "STYLING..." : "GEN STICKER"}
                  </button>
                </form>

                {stickerError && (
                  <p className="text-[10px] text-brand-accent font-mono uppercase font-bold">{stickerError}</p>
                )}

                {/* Stickers List */}
                <div className="flex gap-3 overflow-x-auto py-1 scrollbar-thin">
                  {[...customStickerList, ...defaultStickersAndMementos].map((st, i) => (
                    <div 
                      key={st + i}
                      onClick={() => {
                        playClickSound(500);
                        navigator.clipboard.writeText(st);
                        onCopyText(st, "AI Custom Sticker");
                        onAddHistory('sticker', st, "Copied Sticker Link");
                      }}
                      className="relative w-16 h-16 bg-[#1a1a1a] rounded-none p-1.5 border border-brand-line cursor-pointer hover:border-brand-accent transition-all overflow-hidden flex-shrink-0"
                    >
                      <img src={st} alt="sticker preset" crossOrigin="anonymous" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                      <div className="absolute top-0.5 right-0.5 border border-brand-line bg-brand-bg text-brand-accent text-[6px] px-1 font-mono uppercase font-bold">STK</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'gifs' && (
              <motion.div 
                key="gifs"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="flex flex-col gap-3 w-full"
              >
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {giftTags.map((t) => (
                    <button
                      key={t.slug}
                      onClick={() => {
                        playClickSound(340);
                        const mockGif = `https://media.giphy.com/media/l0ExdHf1lT7ZgO81K/giphy.gif?q=${t.slug}`;
                        navigator.clipboard.writeText(mockGif);
                        onCopyText(mockGif, `GIF - ${t.label}`);
                        onAddHistory('gif', mockGif, `GIF: ${t.slug}`);
                      }}
                      className="text-[10px] bg-brand-bg text-white border border-brand-line hover:border-brand-accent p-2 px-4 rounded-none whitespace-nowrap transition-all font-mono uppercase cursor-pointer"
                    >
                      {t.label} ⚡
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-brand-muted font-mono uppercase text-center">Tap any trend category of GIF above to copy the synced dynamic rich-media integration link instantly!</p>
              </motion.div>
            )}

            {activeTab === 'slangs' && (
              <motion.div 
                key="slangs"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="flex flex-col gap-4 w-full"
              >
                {/* Slang shortcuts click-to-type */}
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto scrollbar-thin">
                  {slangPhrases.map((sp, idx) => (
                    <button
                      key={sp.phrase + idx}
                      onClick={() => {
                        playClickSound(420);
                        setInputText(prev => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + sp.phrase);
                      }}
                      title={sp.meaning}
                      className="text-xs bg-brand-bg hover:bg-brand-line border border-brand-line p-1.5 px-3 rounded-none text-white font-mono lowercase transition-all cursor-pointer hover:border-brand-accent"
                    >
                      {sp.phrase}
                    </button>
                  ))}
                </div>

                {/* Combos list */}
                <div className="border-t border-brand-line pt-2.5">
                  <div className="flex gap-2 overflow-x-auto py-0.5 scrollbar-thin">
                    {emojiCombos.map((ec, idx) => (
                      <button
                        key={ec.combo + idx}
                        onClick={() => {
                          playClickSound(450);
                          setInputText(prev => prev + ec.combo);
                        }}
                        title={ec.tag}
                        className="text-xs bg-brand-bg hover:bg-brand-line border border-brand-line p-1.5 px-3 rounded-none transition-all whitespace-nowrap text-white font-mono cursor-pointer"
                      >
                        {ec.combo} <span className="text-[8px] text-brand-muted uppercase">({ec.tag})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Simulated Keyboard Keys layout */}
      <div className="font-serif italic text-sm text-brand-muted lowercase mb-1">02. physical keys interface</div>
      <div 
        id="simulated_board_keys" 
        className="rounded-none p-5 shadow-2xl flex flex-col gap-2.5 transition-all duration-300 border border-brand-line bg-brand-bg select-none"
      >
        {/* Row 1 Keys */}
        <div className="flex justify-center gap-1.5 w-full">
          {row1.map((char) => (
            <button
              key={char}
              id={`key_btn_${char}`}
              onClick={() => handleKeyPress(char)}
              className="flex-1 max-w-[38px] h-11 md:h-12 rounded-none font-sans font-black uppercase flex items-center justify-center text-sm md:text-base cursor-pointer hover:border-white transition-all select-none border"
              style={{ 
                backgroundColor: '#161616',
                color: '#FFFFFF',
                borderColor: 'var(--color-brand-line)'
              }}
            >
              {char}
            </button>
          ))}
        </div>

        {/* Row 2 Keys */}
        <div className="flex justify-center gap-1.5 w-full px-2">
          {row2.map((char) => (
            <button
              key={char}
              id={`key_btn_${char}`}
              onClick={() => handleKeyPress(char)}
              className="flex-1 max-w-[38px] h-11 md:h-12 rounded-none font-sans font-black uppercase flex items-center justify-center text-sm md:text-base cursor-pointer hover:border-white transition-all select-none border"
              style={{ 
                backgroundColor: '#161616',
                color: '#FFFFFF',
                borderColor: 'var(--color-brand-line)'
              }}
            >
              {char}
            </button>
          ))}
        </div>

        {/* Row 3 Keys with Special Backspace */}
        <div className="flex justify-center gap-1.5 w-full">
          {/* Shift representation */}
          <div 
            className="flex-1 max-w-[40px] h-11 md:h-12 rounded-none flex items-center justify-center text-[10px] opacity-40 font-mono border border-brand-line select-none bg-brand-bg"
          >
            SHIFT
          </div>

          {row3.map((char) => (
            <button
              key={char}
              id={`key_btn_${char}`}
              onClick={() => handleKeyPress(char)}
              className="flex-1 max-w-[38px] h-11 md:h-12 rounded-none font-sans font-black uppercase flex items-center justify-center text-sm md:text-base cursor-pointer hover:border-white transition-all select-none border"
              style={{ 
                backgroundColor: '#161616',
                color: '#FFFFFF',
                borderColor: 'var(--color-brand-line)'
              }}
            >
              {char}
            </button>
          ))}

          {/* Backspace Trigger */}
          <button
            id="backspace_key_trigger"
            onClick={handleBackspace}
            className="flex-1 max-w-[54px] h-11 md:h-12 rounded-none flex items-center justify-center cursor-pointer hover:border-[#EF4444] transition-all border font-mono text-xs uppercase"
            style={{ 
              backgroundColor: '#161616',
              color: '#EF4444',
              borderColor: 'var(--color-brand-line)'
            }}
          >
            BKSP
          </button>
        </div>

        {/* Row 4 spacebar, clear, and shift functions */}
        <div className="flex justify-between gap-1.5 w-full">
          {/* Dot switch */}
          <button
            onClick={() => { playClickSound(310); handleKeyPress("."); }}
            className="w-11 h-11 rounded-none flex items-center justify-center font-bold border border-brand-line hover:border-white cursor-pointer bg-[#161616] text-white"
          >
            .
          </button>

          {/* SPACEBAR */}
          <button
            id="spacebar_key_trigger"
            onClick={handleSpace}
            className="flex-1 h-11 rounded-none text-xs font-mono font-black tracking-widest hover:brightness-110 transition-all select-none cursor-pointer bg-brand-accent text-brand-bg border-b-2"
            style={{ 
              backgroundColor: 'var(--color-brand-accent)',
              color: 'var(--color-brand-bg)',
              borderBottomColor: 'rgba(255,255,255,0.7)'
            }}
          >
            MORPH
          </button>

          {/* Dynamic Enter / Search trend query modifier */}
          <button
            onClick={() => { playClickSound(520); if (inputText) handleCopy(); }}
            className="px-5 h-11 rounded-none text-xs font-mono font-black uppercase transition-all flex items-center gap-1.5 select-none cursor-pointer"
            style={{ 
              backgroundColor: 'var(--color-brand-accent)',
              color: 'var(--color-brand-bg)'
            }}
          >
            <span>SYNC</span>
          </button>
        </div>
      </div>
    </div>
  );
}

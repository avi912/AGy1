import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, RefreshCw, Check, Copy, ClipboardCheck, Trash2, Smartphone, 
  Globe, MessageSquare, Instagram, ExternalLink, Settings, AlertTriangle
} from 'lucide-react';
import { KeyboardHistoryItem } from '../types';

interface MyCollectionsPanelProps {
  history: KeyboardHistoryItem[];
  onClearHistory: () => void;
  onRemoveHistoryItem: (id: string) => void;
  isFirebaseActive: boolean;
  onTriggerSyncNow: () => void;
  syncMsg: string;
}

export default function MyCollectionsPanel({
  history,
  onClearHistory,
  onRemoveHistoryItem,
  isFirebaseActive,
  onTriggerSyncNow,
  syncMsg
}: MyCollectionsPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyHistory = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col gap-8 w-full text-white">
      
      {/* 1. Sync controls & status banner */}
      <div>
        <div className="font-serif italic text-sm text-brand-muted lowercase mb-3">01. cloud integrations & telemetry</div>
        <div className="bg-brand-bg p-4 rounded-none border border-brand-line flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isFirebaseActive ? 'bg-brand-accent animate-pulse' : 'bg-amber-500'}`} />
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Cross-Platform Cloud Sync</h3>
            </div>
            <p className="text-[11px] text-brand-muted mt-2 font-mono uppercase tracking-[0.02em] leading-relaxed">
              {isFirebaseActive 
                ? "Connected to Firestore! All customized preferences, history list and fonts are synced dynamically." 
                : "Running in Offline-first sandbox mode. Synchronizes locally in your browser. Complete Firebase activation in Settings for Cloud DB sync."}
            </p>
            {syncMsg && (
              <p className="text-[10px] text-brand-accent font-mono mt-2 font-bold uppercase">{syncMsg}</p>
            )}
          </div>

          <button
            id="trigger_sync_now_action"
            onClick={onTriggerSyncNow}
            className="bg-brand-accent hover:bg-white text-brand-bg font-mono font-black text-xs py-2 px-5 rounded-none transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-widest self-start sm:self-center"
          >
            <RefreshCw size={13} className="animate-spin" />
            <span>SYNC NOW</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. Synced Keyboard History Logs */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="font-serif italic text-sm text-brand-muted lowercase mb-3">02. history index & session records</div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-display font-black uppercase tracking-tight">
              Keyboard Sync History
            </h3>
            {history.length > 0 && (
              <button
                id="clear_all_history_trigger"
                onClick={onClearHistory}
                className="text-[10px] text-red-500 hover:text-red-400 font-mono font-bold uppercase transition-all cursor-pointer"
              >
                <span>[CLEAR HISTORICAL COPIES]</span>
              </button>
            )}
          </div>

          <div id="history_list_container" className="bg-brand-bg border border-brand-line rounded-none p-4 min-h-[220px] max-h-[360px] overflow-y-auto flex flex-col gap-3 scrollbar-thin">
            {history.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center opacity-40 py-12">
                <ClipboardCheck size={32} className="text-brand-muted mb-3" />
                <p className="text-xs font-mono uppercase tracking-widest text-[#FFFFFF]">No keyboard actions logged.</p>
                <p className="text-[10px] text-brand-muted mt-1 font-mono uppercase">Type on the virtual keycap grid to save presets!</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-brand-bg rounded-none flex justify-between items-center gap-3 overflow-hidden text-xs border border-brand-line hover:border-brand-accent transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono border border-brand-line bg-brand-bg text-brand-accent px-1.5 py-0.5 rounded-none uppercase font-bold tracking-wider">
                          {item.type}
                        </span>
                        <span className="text-[9px] text-[#888888] font-mono">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {item.type === 'sticker' || item.type === 'gif' ? (
                        <div className="mt-2 flex gap-3 items-center">
                          <img src={item.content} alt="sync asset" crossOrigin="anonymous" referrerPolicy="no-referrer" className="w-10 h-10 object-contain bg-neutral-900 border border-brand-line p-1" />
                          <span className="text-[10px] text-brand-muted font-mono truncate max-w-[150px]">{item.label || "AI Created Sticker"}</span>
                        </div>
                      ) : (
                        <p className="font-bold text-white mt-2 break-all text-xs font-mono">
                          {item.content}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 items-center shrink-0">
                      <button
                        id={`copy_history_${item.id}`}
                        onClick={() => handleCopyHistory(item.content, item.id)}
                        className="p-1 px-2.5 text-[10px] bg-brand-bg border border-brand-line text-white hover:border-brand-accent font-mono font-bold uppercase transition-all cursor-pointer"
                        title="Copy item content"
                      >
                        {copiedId === item.id ? <Check className="text-green-500" size={12} /> : <span>COPY</span>}
                      </button>
                      <button
                        onClick={() => onRemoveHistoryItem(item.id)}
                        className="p-1 px-2 text-red-500 hover:text-red-400 border border-brand-line hover:border-[#FF4444] transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* 3. Guide to Adding Keyboard to Social Platforms */}
        <div id="cross_platform_integration_guides" className="lg:col-span-5 flex flex-col">
          <div className="font-serif italic text-sm text-brand-muted lowercase mb-3">03. installation & social deploy guides</div>
          <h3 className="text-base font-display font-black uppercase tracking-tight mb-4">
            How to use custom output
          </h3>

          <div className="bg-brand-bg border border-brand-line rounded-none p-4 flex flex-col gap-5">
            
            {/* Guide: Instagram & TikTok Stories */}
            <div className="flex gap-4 text-xs">
              <div className="p-2 rounded-none bg-brand-line text-brand-accent shrink-0 h-9 w-9 flex items-center justify-center border border-brand-line">
                <Instagram size={16} />
              </div>
              <div>
                <h4 className="font-bold text-white uppercase font-mono tracking-wider">Meme Channels & Social Media stories</h4>
                <p className="text-[11px] text-brand-muted mt-1 leading-relaxed lowercase">
                  Type custom font symbols or copy an AI sticker in this app. Open Instagram story text editor, then tap **"Paste"**. Your custom styling works natively! For stickers, paste clipboard directly to add custom 2D stickers.
                </p>
              </div>
            </div>

            {/* Guide: Keyboard Shortcuts Mac/iOS/Android */}
            <div className="flex gap-4 text-xs">
              <div className="p-2 rounded-none bg-brand-line text-brand-accent shrink-0 h-9 w-9 flex items-center justify-center border border-brand-line">
                <Smartphone size={16} />
              </div>
              <div>
                <h4 className="font-bold text-white uppercase font-mono tracking-wider">iOS/Android Text Substitution Setting</h4>
                <p className="text-[11px] text-brand-muted mt-1 leading-relaxed lowercase">
                  Go to **Settings &gt; General &gt; Keyboard &gt; Text Replacement**. Add your favorite synced slang/symbol phrase to shortcuts (e.g., set `demure` shortcut to expand into typed formatted 𝔡𝔢𝔪𝔲𝔯𝔢 🌸 text).
                </p>
              </div>
            </div>

            {/* Guide: Chrome Extension and Shared clipboard sync */}
            <div className="flex gap-4 text-xs">
              <div className="p-2 rounded-none bg-brand-line text-brand-accent shrink-0 h-9 w-9 flex items-center justify-center border border-brand-line">
                <Globe size={16} />
              </div>
              <div>
                <h4 className="font-bold text-white uppercase font-mono tracking-wider">Clipboard Syncing for Slack & Discord</h4>
                <p className="text-[11px] text-brand-muted mt-1 leading-relaxed lowercase">
                  Because this app leverages cloud synchronization, you can open this dashboard from your phone or PC. Anything copied on one device compiles into your remote clipboard instantly, letting you paste customized fonts, memes, and stickers straight into desktop chat tools!
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

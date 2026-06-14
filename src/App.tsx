import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Keyboard, TrendingUp, History, Info, Cloud, 
  CloudOff, LogIn, LogOut, RefreshCw, Settings, Check, HelpCircle
} from 'lucide-react';
import { 
  auth, db, googleProvider, isPlaceholder, handleFirestoreError, OperationType 
} from './lib/firebase';
import { 
  signInWithPopup, signOut, onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, query, where, orderBy, limit 
} from 'firebase/firestore';

import { KeyboardTheme, KeyboardHistoryItem, SlangPhrase, EmojiCombo, UserProfile, UserPreferences } from './types';
import InteractiveKeyboard from './components/InteractiveKeyboard';
import TrendingPanel from './components/TrendingPanel';
import MyCollectionsPanel from './components/MyCollectionsPanel';
import ScraperPanel from './components/ScraperPanel';
import { Globe } from 'lucide-react';

// Default static themes list in case loading is pending
const defaultThemes: KeyboardTheme[] = [
  {
    name: "Minimalist Slate",
    primaryColor: "#ffffff",
    secondaryColor: "#f4f4f5",
    accentColor: "#18181b",
    textColor: "#27272a",
    fontFamily: "Sans",
    vibeDescription: "Timeless modern editorial style with stark black-and-white accents."
  },
  {
    name: "Cotton Candy",
    primaryColor: "#fff1f2",
    secondaryColor: "#ffe4e6",
    accentColor: "#db2777",
    textColor: "#831843",
    fontFamily: "Sans",
    vibeDescription: "Whimsical pastel hues for bubblegum social media captions."
  },
  {
    name: "Cyberpunk Terminal",
    primaryColor: "#090d16",
    secondaryColor: "#020617",
    accentColor: "#059669",
    textColor: "#34d399",
    fontFamily: "Mono",
    vibeDescription: "High-contrast glowing codes with radiant hacking green indicators."
  },
  {
    name: "Retro Game Boy 1989",
    primaryColor: "#dae0cc",
    secondaryColor: "#cadc9f",
    accentColor: "#0f380f",
    textColor: "#306230",
    fontFamily: "Mono",
    vibeDescription: "Charming nostalgia from early pixel consoles."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'keyboard' | 'trends' | 'collections' | 'discover' | 'config'>('keyboard');
  
  // Customization & styling states
  const [activeTheme, setActiveTheme] = useState<KeyboardTheme>(defaultThemes[0]);
  const [activeFontId, setActiveFontId] = useState<string>("standard");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [customStickers, setCustomStickers] = useState<string[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [initialStickerPrompt, setInitialStickerPrompt] = useState<string>("");

  // Slang & Emojis trends fetched from backend
  const [slangPhrases, setSlangPhrases] = useState<SlangPhrase[]>([
    { phrase: "no cap", meaning: "seriously / for real", category: "Emphasis" },
    { phrase: "rizz", meaning: "charisma / charm", category: "Slang" },
    { phrase: "demure", meaning: "mindful, modest, neat", category: "Vibe" },
    { phrase: "let him cook", meaning: "let him do his thing", category: "Phrase" },
    { phrase: "vibe check", meaning: "evaluating energy", category: "Context" }
  ]);
  const [emojiCombos, setEmojiCombos] = useState<EmojiCombo[]>([
    { combo: "🔥💅✨", tag: "Fabulous" },
    { combo: "💀💀💀", tag: "Hilarious" },
    { combo: "🍵👀🤫", tag: "Hot gossip" },
    { combo: "🥺👉👈", tag: "Nervous request" }
  ]);
  const [apiThemes, setApiThemes] = useState<KeyboardTheme[]>(defaultThemes);

  // Authenticated user state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [fetchingUser, setFetchingUser] = useState<boolean>(true);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>("");
  const [fetchingTrends, setFetchingTrends] = useState<boolean>(false);

  // Synced preferences and copies history
  const [history, setHistory] = useState<KeyboardHistoryItem[]>([]);

  // 1. Listen to Authenticated state using Firebase Auth
  useEffect(() => {
    if (isPlaceholder || !auth) {
      setFetchingUser(false);
      // Load history and preferences locally
      loadLocalData();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFetchingUser(true);
      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL
        };
        setUser(profile);
        setSyncStatusMsg("Cloud synchronization initialized!");
        await syncDataFromFirestore(fbUser.uid);
      } else {
        setUser(null);
        setSyncStatusMsg("Logged out. Running on local clipboard.");
        loadLocalData();
      }
      setFetchingUser(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch trends from Express server-side Gemini API on mount
  useEffect(() => {
    const loadTrends = async () => {
      setFetchingTrends(true);
      try {
        const response = await fetch('/api/agent/keyboard-trends');
        if (response.ok) {
          const data = await response.json();
          if (data.slangPhrases) setSlangPhrases(data.slangPhrases);
          if (data.emojiCombos) setEmojiCombos(data.emojiCombos);
          if (data.designThemes) {
            setApiThemes(data.designThemes);
            // Default to first theme of the response list
            setActiveTheme(data.designThemes[0]);
          }
        }
      } catch (err) {
        console.warn("Could not fetch latest trends from API, using robust static client trendsets.", err);
      } finally {
        setFetchingTrends(false);
      }
    };
    loadTrends();
  }, []);

  // Local Storage loaders (Offline Fallback)
  const loadLocalData = () => {
    try {
      const storedPref = localStorage.getItem('kb_pref');
      if (storedPref) {
        const parsed = JSON.parse(storedPref);
        if (parsed.themeName) {
          const found = defaultThemes.find(t=>t.name === parsed.themeName);
          if (found) setActiveTheme(found);
        }
        if (parsed.activeFontId) setActiveFontId(parsed.activeFontId);
        setSoundEnabled(parsed.soundEnabled ?? true);
        if (parsed.customStickers) setCustomStickers(parsed.customStickers);
      }

      const storedHistory = localStorage.getItem('kb_hist');
      if (storedHistory) {
         setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.warn("Could not read local keyboard records.", e);
    }
  };

  const saveLocalData = (newHistory: KeyboardHistoryItem[]) => {
    try {
      localStorage.setItem('kb_hist', JSON.stringify(newHistory));
      localStorage.setItem('kb_pref', JSON.stringify({
        themeName: activeTheme.name,
        activeFontId,
        soundEnabled,
        customStickers
      }));
    } catch (e) {}
  };

  // Sync state from Firestore when user signs in
  const syncDataFromFirestore = async (userId: string) => {
    if (!db) return;
    try {
      setSyncStatusMsg("Refreshing synced keyboard presets...");
      
      // Load user preferences doc
      const prefDocRef = doc(db, 'preferences', userId);
      const prefDocSnap = await getDoc(prefDocRef);
      if (prefDocSnap.exists()) {
        const remotePref = prefDocSnap.data() as UserPreferences;
        const matchingTheme = apiThemes.find(t=>t.name === remotePref.theme) || defaultThemes.find(t=>t.name === remotePref.theme);
        if (matchingTheme) setActiveTheme(matchingTheme);
        if (remotePref.activeFont) setActiveFontId(remotePref.activeFont);
        setSoundEnabled(remotePref.soundEnabled ?? true);
        if (remotePref.savedStickers) setCustomStickers(remotePref.savedStickers);
      }

      // Load user history items from query
      const historyCollection = collection(db, 'history');
      const q = query(historyCollection, where('userId', '==', userId), limit(30));
      const querySnap = await getDocs(q);
      const remoteHistory: KeyboardHistoryItem[] = [];
      querySnap.forEach((docSnap) => {
        const item = docSnap.data();
        remoteHistory.push({
          id: docSnap.id,
          userId: item.userId,
          type: item.type,
          content: item.content,
          label: item.label,
          createdAt: item.createdAt
        });
      });
      
      // Sort desc by date
      remoteHistory.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      setHistory(remoteHistory);
      
      setSyncStatusMsg("Cloud records synced successfully!");
    } catch (error) {
      console.warn("Failed to complete Firestore recovery. Falling back to client state.", error);
    }
  };

  // Add history copy action dynamically and synchronize to backend
  const handleAddHistory = async (type: 'text' | 'sticker' | 'gif' | 'font', content: string, label?: string) => {
    const id = "hist_" + Math.random().toString(36).substring(2, 11);
    const newItem: KeyboardHistoryItem = {
      id,
      userId: user?.uid || "guest_device",
      type,
      content,
      label: label || "",
      createdAt: new Date().toISOString()
    };

    const updatedHistory = [newItem, ...history].slice(0, 40);
    setHistory(updatedHistory);
    saveLocalData(updatedHistory);

    // If user is authenticated and Firebase is fully live, log event to firestore
    if (user && db) {
      try {
        await setDoc(doc(db, 'history', id), {
          id,
          userId: user.uid,
          type,
          content,
          label: label || "",
          createdAt: newItem.createdAt
        });
      } catch (err) {
        // handle and log permission errors securely
        try {
          handleFirestoreError(err, OperationType.WRITE, `history/${id}`);
        } catch (wrappedErr) {
          console.warn("Stored event locally due to missing permissions.");
        }
      }
    }
  };

  // Sync theme changes to Cloud database
  const handleApplyTheme = async (theme: KeyboardTheme) => {
    setActiveTheme(theme);
    if (user && db) {
      try {
        setSyncStatusMsg("Saving keyboard theme preference...");
        await setDoc(doc(db, 'preferences', user.uid), {
          userId: user.uid,
          theme: theme.name,
          soundEnabled,
          activeFont: activeFontId,
          savedStickers: customStickers,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        setSyncStatusMsg("Cloud preference locked!");
      } catch (err) {
        console.warn("Saved preference locally.");
      }
    } else {
      localStorage.setItem('kb_pref', JSON.stringify({
        themeName: theme.name,
        activeFontId,
        soundEnabled,
        customStickers
      }));
    }
  };

  // Custom generated sticker adding list handler
  const handleAddCustomSticker = (url: string) => {
    const updated = [url, ...customStickers].slice(0, 15);
    setCustomStickers(updated);
    if (user && db) {
      setDoc(doc(db, 'preferences', user.uid), {
        savedStickers: updated,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(()=>{});
    } else {
      localStorage.setItem('kb_pref', JSON.stringify({
        themeName: activeTheme.name,
        activeFontId,
        soundEnabled,
        customStickers: updated
      }));
    }
  };

  // Delete a history record from current pool
  const handleRemoveHistoryItem = async (itemId: string) => {
    const filtered = history.filter(h => h.id !== itemId);
    setHistory(filtered);
    saveLocalData(filtered);

    if (user && db) {
      try {
        await deleteDoc(doc(db, 'history', itemId));
        setSyncStatusMsg("Cloud record deleted.");
      } catch (err) {}
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('kb_hist');
    if (user && db) {
      setSyncStatusMsg("Please note: historical copies wiped from local view. Database records persist under ownership rules.");
    }
  };

  const handleTriggerSyncNow = () => {
    if (user) {
      syncDataFromFirestore(user.uid);
    } else {
      setSyncStatusMsg("Sign in utilizing the Google Auth button to initiate full sync!");
    }
  };

  // Google popup-based authentication mechanism
  const handleLogin = async () => {
    if (isPlaceholder || !auth || !googleProvider) {
      alert("Firebase workspace is still integrating. Running locally with browser database sync!");
      return;
    }
    try {
      setSyncStatusMsg("Launching secure login...");
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setSyncStatusMsg(`Welcome, ${result.user.displayName || "user"}!`);
      }
    } catch (err) {
      console.error("Google popup authentication error.", err);
      alert("Auth popup block or missing permission bounds. Check console for details.");
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      setHistory([]);
      setCustomStickers([]);
      setSyncStatusMsg("Logged out securely.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink flex flex-col justify-between font-sans">
      
      {/* HEADER SECTION */}
      <header className="border-b border-brand-line bg-brand-bg/95 backdrop-blur-md sticky top-0 z-30 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex flex-col">
            <div className="logo font-display font-black text-6xl md:text-8xl tracking-tighter text-brand-accent leading-[0.8] mb-2 uppercase select-none">
              MORPH
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-brand-muted font-mono">GLOBAL KEYBOARD PLATFORM</span>
              {fetchingTrends && <span className="text-[9px] bg-brand-accent/20 text-brand-accent px-2 py-0.5 rounded font-mono animate-pulse">Syncing Trends...</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono uppercase tracking-widest">
            <div className="text-brand-muted">
              <span>Global Version 2.0.4</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-accent animate-pulse"></span>
              <span className="text-brand-accent">Sync: Active</span>
            </div>
            
            {/* Sync Account status indicator / actions */}
            <div className="flex items-center gap-3">
              {isPlaceholder ? (
                <span className="flex text-[10px] font-mono items-center gap-1.5 text-brand-accent bg-brand-line border border-brand-line p-1 px-3">
                  <CloudOff size={11} />
                  <span>Simulated Offline</span>
                </span>
              ) : user ? (
                <div className="flex items-center gap-2 bg-brand-bg border border-brand-line p-1 px-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="user profile" className="w-5 h-5 rounded-full border border-brand-line" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-brand-accent text-brand-bg flex items-center justify-center text-[9px] font-black">U</div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-[8px] font-mono text-brand-accent uppercase">Synced</p>
                    <p className="text-[9px] text-brand-ink font-mono truncate max-w-[90px]">{user.displayName || "Online User"}</p>
                  </div>
                  <button
                    id="google_logout_trigger"
                    onClick={handleLogout}
                    title="Logout"
                    className="ml-1 text-red-500 hover:text-red-400 transition-all font-bold font-mono text-[9px]"
                  >
                    [EXIT]
                  </button>
                </div>
              ) : (
                <button
                  id="google_login_trigger"
                  onClick={handleLogin}
                  className="bg-brand-accent hover:bg-white text-brand-bg text-[10px] uppercase font-mono font-bold p-1.5 px-4 rounded-none transition-all flex items-center gap-1 cursor-pointer"
                >
                  <LogIn size={11} />
                  <span>Cloud Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CORE WRAPPER SECTION */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8">
        
        {/* Sync Messaging Center */}
        {syncStatusMsg && (
          <div className="bg-brand-bg border border-brand-line p-3 px-5 rounded-none flex items-center justify-between text-[11px] text-brand-accent font-mono">
            <div className="flex items-center gap-2">
              <Cloud className="text-brand-accent shrink-0 animate-pulse" size={13} />
              <span>{syncStatusMsg}</span>
            </div>
            <span className="text-[9px] text-brand-muted font-bold">UTC: {new Date().toISOString().substring(11, 16)}</span>
          </div>
        )}

        {/* Dynamic navigation Tabs */}
        <div id="keyboard_nav_tabs" className="flex border-b border-brand-line gap-2 overflow-x-auto pb-0.5">
          <button
            id="tab_trigger_keyboard"
            onClick={() => setActiveTab('keyboard')}
            className={`flex items-center gap-2 py-3 px-6 text-xs uppercase tracking-widest font-mono font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'keyboard' 
                ? 'border-brand-accent text-brand-accent bg-brand-line/45' 
                : 'border-transparent text-brand-muted hover:text-brand-ink'
            }`}
          >
            <Keyboard size={14} />
            <span>01. Typing Playground</span>
          </button>

          <button
            id="tab_trigger_trends"
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 py-3 px-6 text-xs uppercase tracking-widest font-mono font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'trends' 
                ? 'border-brand-accent text-brand-accent bg-brand-line/45' 
                : 'border-transparent text-brand-muted hover:text-brand-ink'
            }`}
          >
            <TrendingUp size={14} />
            <span>02. AI Trends Dashboard</span>
          </button>

          <button
            id="tab_trigger_collections"
            onClick={() => setActiveTab('collections')}
            className={`flex items-center gap-2 py-3 px-6 text-xs uppercase tracking-widest font-mono font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'collections' 
                ? 'border-brand-accent text-brand-accent bg-brand-line/45' 
                : 'border-transparent text-brand-muted hover:text-brand-ink'
            }`}
          >
            <History size={14} />
            <span>03. Saved History</span>
          </button>

          <button
            id="tab_trigger_discover"
            onClick={() => setActiveTab('discover')}
            className={`flex items-center gap-2 py-3 px-6 text-xs uppercase tracking-widest font-mono font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'discover' 
                ? 'border-brand-accent text-brand-accent bg-brand-line/45' 
                : 'border-transparent text-brand-muted hover:text-brand-ink'
            }`}
          >
            <Globe size={14} />
            <span>04. Discovery & Scraper</span>
          </button>
        </div>

        {/* Dynamic Page Views renderer */}
        <div className="bg-brand-bg border border-brand-line rounded-none p-5 md:p-8 shadow-2xl transition-all">
          <AnimatePresence mode="wait">
            {activeTab === 'keyboard' && (
              <motion.div
                key="keyboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                <InteractiveKeyboard
                  activeTheme={activeTheme}
                  setActiveTheme={handleApplyTheme}
                  activeFontId={activeFontId}
                  setActiveFontId={setActiveFontId}
                  soundEnabled={soundEnabled}
                  setSoundEnabled={setSoundEnabled}
                  onCopyText={handleAddHistory}
                  onAddHistory={handleAddHistory}
                  slangPhrases={slangPhrases}
                  emojiCombos={emojiCombos}
                  customStickerList={customStickers}
                  addCustomSticker={handleAddCustomSticker}
                  inputText={inputText}
                  setInputText={setInputText}
                  initialStickerPrompt={initialStickerPrompt}
                  setInitialStickerPrompt={setInitialStickerPrompt}
                />
              </motion.div>
            )}

            {activeTab === 'trends' && (
              <motion.div
                key="trends"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                <TrendingPanel
                  slangPhrases={slangPhrases}
                  emojiCombos={emojiCombos}
                  designThemes={apiThemes}
                  onApplyTheme={handleApplyTheme}
                  activeThemeName={activeTheme.name}
                />
              </motion.div>
            )}

            {activeTab === 'collections' && (
              <motion.div
                key="collections"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                <MyCollectionsPanel
                  history={history}
                  onClearHistory={handleClearHistory}
                  onRemoveHistoryItem={handleRemoveHistoryItem}
                  isFirebaseActive={!isPlaceholder}
                  onTriggerSyncNow={handleTriggerSyncNow}
                  syncMsg={syncStatusMsg}
                />
              </motion.div>
            )}

            {activeTab === 'discover' && (
              <motion.div
                key="discover"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                <ScraperPanel
                  onSuggestStickerPrompt={(prompt) => {
                    setInitialStickerPrompt(prompt);
                    setActiveTab('keyboard');
                  }}
                  onCopyToPlayground={(text) => {
                    setInputText(text);
                    setActiveTab('keyboard');
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-brand-line bg-brand-bg py-8 px-6 text-center select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs font-mono text-brand-muted">
            <div className="h-2 w-2 rounded-full bg-brand-accent"></div>
            <span>Cloud Preferences Synchronized across live developer workspace</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="border border-brand-muted text-brand-muted text-[10px] tracking-wider uppercase font-mono py-1 px-3 rounded-full">WhatsApp</div>
            <div className="border border-brand-muted text-brand-muted text-[10px] tracking-wider uppercase font-mono py-1 px-3 rounded-full">Telegram</div>
            <div className="border border-brand-muted text-brand-muted text-[10px] tracking-wider uppercase font-mono py-1 px-3 rounded-full">Instagram</div>
            <div className="border border-brand-muted text-brand-muted text-[10px] tracking-wider uppercase font-mono py-1 px-3 rounded-full">Discord</div>
          </div>
        </div>
      </footer>

    </div>
  );
}

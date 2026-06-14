export interface SlangPhrase {
  phrase: string;
  meaning: string;
  category: string;
}

export interface EmojiCombo {
  combo: string;
  tag: string;
}

export interface KeyboardTheme {
  name: string;
  primaryColor: string; // key backgrounds
  secondaryColor: string; // board background
  accentColor: string; // highlights & focus
  textColor: string; // key label color
  fontFamily: string; // font style for keyboard keys
  vibeDescription?: string;
}

export interface FontStyle {
  id: string;
  name: string;
  vibe: string;
  transform: (text: string) => string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface UserPreferences {
  userId: string;
  theme: string;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  customLayout: string;
  activeFont: string;
  savedStickers: string[];
  savedGifs: string[];
  savedFonts: string[];
  updatedAt: string;
}

export interface KeyboardHistoryItem {
  id: string;
  userId: string;
  type: 'text' | 'sticker' | 'gif' | 'font';
  content: string; // The generated output/URL/phrase
  label?: string; // Optional subtitle or design tags
  createdAt: string;
}

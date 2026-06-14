// Unicode converters for custom font styles

const fancyMaps: Record<string, Record<string, string>> = {
  gothic: {
    ...Object.fromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1D51E + i)])),
    ...Object.fromEntries("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1D504 + i)])),
  },
  cursive: {
    ...Object.fromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1D4EA + i)])),
    ...Object.fromEntries("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1D4D0 + i)])),
  },
  serifBold: {
    ...Object.fromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1D41E + i)])),
    ...Object.fromEntries("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1D400 + i)])),
  },
  outline: {
    ...Object.fromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1D552 + i)])),
    ...Object.fromEntries("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1D538 + i)])),
  },
  circles: {
    ...Object.fromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x24D0 + i)])),
    ...Object.fromEntries("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x24B6 + i)])),
    ...Object.fromEntries("0123456789".split("").map((c, i) => [c, i === 0 ? "⓪" : String.fromCodePoint(0x24F5 + i)]))
  },
  squares: {
    ...Object.fromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1F170 + i)])), // approximate block
    ...Object.fromEntries("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1F170 + i)]))
  },
  smallcaps: {
    a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ",
    n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "ꜱ", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ",
    A: "ᴀ", B: "ʙ", C: "ᴄ", D: "ᴅ", E: "ᴇ", F: "ꜰ", G: "ɢ", H: "ʜ", I: "ɪ", J: "ᴊ", K: "ᴋ", L: "ʟ", M: "ᴍ",
    N: "ɴ", O: "ᴏ", P: "ᴘ", Q: "ǫ", R: "ʀ", S: "ꜱ", T: "ᴛ", U: "ᴜ", V: "ᴠ", W: "ᴡ", X: "x", Y: "ʏ", Z: "ᴢ"
  },
  flipped: {
    a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ı", j: "ɾ", k: "ʞ", l: "l", m: "ɯ",
    n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
    A: "∀", B: "𐐃", C: "Ɔ", D: "◖", E: "Ǝ", F: "Ⅎ", G: "⅁", H: "H", I: "I", J: "ſ", K: "ʞ", L: "˥", M: "W",
    N: "N", O: "O", P: "Ԁ", Q: "Ὁ", R: "ᴚ", S: "S", T: "┴", U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
    " ": " "
  },
  fullwidth: {
    ...Object.fromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0xFF41 + i)])),
    ...Object.fromEntries("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0xFF21 + i)])),
    ...Object.fromEntries("0123456789".split("").map((c, i) => [c, String.fromCodePoint(0xFF10 + i)]))
  }
};

export const fontPresets = [
  { id: 'standard', name: 'Plain Normal Text', vibe: 'Standard Clean font' },
  { id: 'gothic', name: '𝔊𝔬𝔱𝔥𝔦𝔠𝔉𝔞𝔫𝔱𝔞𝔰𝔶', vibe: 'Medieval Dark/Retro Vibe' },
  { id: 'cursive', name: '𝓒𝓾𝓻𝓼𝓿𝓮𝓔𝓵𝓮𝓰𝓪𝓷𝓽', vibe: 'Handwritten Script Appeal' },
  { id: 'serifBold', name: '𝐒𝐞𝐫𝐢𝐟𝐁𝐨𝐥𝐝𝐏𝐨𝐬𝐭', vibe: 'Instagram/X emphasis highlights' },
  { id: 'outline', name: '𝕆𝕦𝕥𝕝𝕚𝕟𝕖𝕊𝕥𝕪𝕝𝕖', vibe: 'Minimalistic bold contour letters' },
  { id: 'circles', name: 'ⒸⓘⓡⓒⓛⓔⓉⓔⓧⓣ', vibe: 'Fun tech-circled bubbles style' },
  { id: 'smallcaps', name: 'ꜱᴍᴀʟʟᴄᴀᴘꜱᴠɪʙᴇ', vibe: 'Earthy minimalist capital look' },
  { id: 'flipped', name: 'ɟlıddǝpʇǝxʇ', vibe: 'Upside down flipped novelty text' },
  { id: 'fullwidth', name: 'Ｆｕｌｌｗｉｄｔｈ', vibe: 'Vaporwave aesthetic full spacing' }
];

export function transformText(text: string, fontId: string): string {
  if (!text) return "";
  if (fontId === 'standard') return text;
  
  const map = fancyMaps[fontId];
  if (!map) return text;

  if (fontId === 'flipped') {
    // Flipped text should be ordered backwards for correct upside down reading
    return text.split("").reverse().map(char => map[char] || char).join("");
  }

  return text.split("").map(char => map[char] || char).join("");
}

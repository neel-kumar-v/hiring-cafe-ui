  import { type ClassValue, clsx } from "clsx";
  import { twMerge } from "tailwind-merge";
  
  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }

function decodeUnicodeEscapes(input: string): string {
  // Decode JSON-style unicode escape sequences: \uXXXX and \u{X...}
  // (We intentionally keep this small/safe and avoid throwing.)
  return input.replace(/\\u\{([0-9a-fA-F]{1,6})\}|\\u([0-9a-fA-F]{4})/g, (_m, bracedHex: string | undefined, fixedHex: string | undefined) => {
    const hex = (bracedHex ?? fixedHex ?? "").toLowerCase();
    const codePoint = Number.parseInt(hex, 16);
    if (!Number.isFinite(codePoint)) return _m;
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return _m;
    }
  });
}

function stripControlChars(input: string): string {
  // Control chars can sneak into scraped location strings (e.g. \u0011).
  return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

export function decodeLocationForDisplay(location: string): string {
  if (!location) return "";
  const decoded = decodeUnicodeEscapes(location);
  return stripControlChars(decoded).trim();
}

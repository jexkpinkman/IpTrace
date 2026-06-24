const CHARS = "abcdefghijkmnpqrstuvwxyz23456789";

export function generateShortId(length = 7): string {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return id;
}

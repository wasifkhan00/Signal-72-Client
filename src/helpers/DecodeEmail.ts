export function decodeEmail(encoded: string): string {
  try {
    return atob(encoded);
  } catch (err) {
    return encoded;
  }
}

export function decodeKey(key: string) {
  return key.replace(/\(dot\)/g, ".").replace(/\(at\)/g, "@");
}

export function encodeKey(email) {
  return email.replace(/\./g, "(dot)").replace(/@/g, "(at)");
}

export function decodeKey(key) {
  return key.replace(/\(dot\)/g, ".").replace(/\(at\)/g, "@");
}

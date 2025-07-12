export const getInitials = (name: string): string => {
  if (!name) return "";

  const words = name.trim().split(" ");

  if (words.length === 1) {
    // One word? Use first two letters
    return words[0].substring(0, 2).toUpperCase();
  }

  // More than one word? First letter of first and last
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

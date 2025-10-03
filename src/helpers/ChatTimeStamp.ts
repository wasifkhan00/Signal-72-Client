export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Format time (12-hour clock with AM/PM)
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return time;
}

export function formatRelativeDate(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks < 5)
    return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
  if (diffMonths < 12)
    return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
  return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
}

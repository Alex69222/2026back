export function isValidDateTimeString(dateStr: string): boolean {
  if (typeof dateStr !== "string" || dateStr.trim() === "") {
    return false;
  }

  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return false;
  }

  return d.toISOString() === dateStr;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function uniqueValues<T>(items: T[]) {
  return Array.from(new Set(items));
}

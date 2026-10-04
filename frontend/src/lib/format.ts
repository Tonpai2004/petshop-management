import { formatDistanceToNowStrict } from "date-fns";

const currency = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const currencyWithSatang = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrency = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const number = new Intl.NumberFormat("en-US");

// Whole baht stays short (฿1,500), anything with satang always shows both digits (฿38,900.50).
export function formatCurrency(value: number) {
  return Number.isInteger(value) ? currency.format(value) : currencyWithSatang.format(value);
}

export function formatCompactCurrency(value: number) {
  return `฿${compactCurrency.format(value)}`;
}

export function formatNumber(value: number) {
  return number.format(value);
}

export function formatAge(months: number) {
  if (months < 1) return "< 1 mo";
  if (months < 12) return `${months} mo`;

  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
}

export function formatRelative(date: string) {
  const value = new Date(date);
  if (Date.now() - value.getTime() < 60_000) return "just now";
  return `${formatDistanceToNowStrict(value)} ago`;
}

export function formatWeight(kg: number) {
  return kg < 1 ? `${Math.round(kg * 1000)} g` : `${kg} kg`;
}

export function toDateInputValue(date: string) {
  return date.slice(0, 10);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

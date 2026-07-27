import { get, set, del } from "idb-keyval";

// Token storage (IndexedDB via idb-keyval)
export const getToken = async (key: string): Promise<string | null> =>
  (await get(key)) ?? null;

export const saveToken = async (key: string, value: string): Promise<void> =>
  set(key, value);

export const deleteToken = async (key: string): Promise<void> => del(key);

// Copies text to clipboard and toggles a boolean state for 2 s
export const handleCopy = async (
  value: string,
  setCopied: (v: boolean) => void,
) => {
  try {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch {}
};

const localeMap: Record<string, string> = {
  NGN: "en-NG",
  KES: "en-KE",
  UGX: "en-UG",
  USD: "en-US",
  GHS: "en-GH",
};

export const formatCurrency = (
  amount: number | string,
  currency = "USD",
): string => {
  const locale = localeMap[currency] ?? "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    Number(amount),
  );
};

export const formatDate = (dateString: string, withTime = false): string => {
  const date = dateString ? new Date(dateString) : new Date();
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
};

export const formatString = (value: string): string => {
  if (!value) return "";
  return value
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

export const formatEnumString = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractErrorMsg = (error: any): string | undefined => {
  const data = error?.response?.data;
  if (!data) return undefined;
  if (typeof data === "string")
    return data.trim().startsWith("<!DOCTYPE")
      ? "A server error occurred. Please try again later."
      : data;
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  const first = Object.values(data)[0];
  return Array.isArray(first)
    ? (first[0] as string)
    : typeof first === "string"
      ? first
      : undefined;
};

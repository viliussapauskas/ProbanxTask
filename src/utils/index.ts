export type Language = "EN" | "LT";
export const allLanguages: Language[] = ["EN", "LT"];

export const formatNumberByLocale = (
  value: string | number | undefined,
  language: Language
) => {
  if (!value) return "";

  const locale = language === "EN" ? "en-US" : "lt-LT";
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(Number(value));
};

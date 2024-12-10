import { describe, it, expect } from "vitest";
import { formatNumberByLocale } from ".";

describe("formatNumberByLocale", () => {
  it("should return an empty string if the value is undefined", () => {
    const result = formatNumberByLocale(undefined, "EN");
    expect(result).toBe("");
  });

  it("should return an empty string if the value is null", () => {
    const result = formatNumberByLocale(null as unknown as string, "EN");
    expect(result).toBe("");
  });

  it("should format numbers correctly for English locale", () => {
    const result = formatNumberByLocale(12345.6789, "EN");
    expect(result).toBe("12,345.68");
  });

  it("should format numbers correctly for Lithuanian locale", () => {
    const result = formatNumberByLocale(12345.6789, "LT");
    expect(result).toBe("12 345,68");
  });
});

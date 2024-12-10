import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchIsPayeeAccountValid } from ".";

describe("fetchIsPayeeAccountValid", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true when the API response indicates the account is valid", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    const result = await fetchIsPayeeAccountValid("valid-account-number");
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://matavi.eu/validate/?iban=valid-account-number"
    );
  });

  it("should return false when the API response indicates the account is invalid", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: false }),
    });

    const result = await fetchIsPayeeAccountValid("invalid-account-number");
    expect(result).toBe(false);
  });

  it("should return false when the API responds with an error status", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await fetchIsPayeeAccountValid("error-account-number");
    expect(result).toBe(false);
  });

  it("should return false when the fetch call throws an error", async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

    const result = await fetchIsPayeeAccountValid("network-error-account");
    expect(result).toBe(false);
  });

  it("should log an error message when fetch throws an error", async () => {
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

    await fetchIsPayeeAccountValid("network-error-account");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Fetch error:",
      "Network error"
    );
    consoleErrorMock.mockRestore();
  });
});

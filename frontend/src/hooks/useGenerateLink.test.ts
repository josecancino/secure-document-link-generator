import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useGenerateLink } from "./useGenerateLink";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    loading: vi.fn(() => "toast-id"),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useGenerateLink (Simple Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("Happy Path: Generates secure link successfully", async () => {
    const mockToken = "secure-123";
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ token: mockToken }),
    });

    const { result } = renderHook(() => useGenerateLink());

    await act(async () => {
      await result.current.generate("doc-1", "Test.pdf");
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Secure link generated successfully",
      expect.any(Object),
    );

    expect(result.current.links["doc-1"]).toContain(mockToken);
    expect(result.current.loading["doc-1"]).toBe(false);
  });

  it("Error Scenario: Shows backend error message (JSON)", async () => {
    const errorMsg = "Document name too short";
    (fetch as Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: errorMsg }),
    });

    const { result } = renderHook(() => useGenerateLink());

    await act(async () => {
      await result.current.generate("doc-2", "ab");
    });

    expect(toast.error).toHaveBeenCalledWith(errorMsg, expect.any(Object));
    expect(result.current.loading["doc-2"]).toBe(false);
  });

  it("Error Scenario: Handles non-JSON error gracefully", async () => {
    (fetch as Mock).mockResolvedValue({
      ok: false,
      json: async () => {
        throw new SyntaxError("Unexpected token < in JSON at position 0");
      },
    });

    const { result } = renderHook(() => useGenerateLink());

    await act(async () => {
      await result.current.generate("doc-3", "CrashMe");
    });

    // Expect the raw syntax error message (or similar) from JSON.parse failure
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Unexpected token"),
      expect.any(Object),
    );
  });
});

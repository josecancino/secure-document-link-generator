import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useVerifyToken } from "./useVerifyToken";

describe("useVerifyToken (Simple Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("Happy Path: Successful Verification", async () => {
    const mockData = { documentName: "MySecretDoc.pdf" };
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useVerifyToken("valid-token-123"));

    expect(result.current.status).toBe("loading");

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(result.current.docName).toBe(mockData.documentName);
  });

  it("Error Scenario: Invalid or Expired Token", async () => {
    (fetch as Mock).mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useVerifyToken("bad-token"));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });
  });

  it("Error Scenario: Fetch Network Failure", async () => {
    (fetch as Mock).mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useVerifyToken("network-fail"));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });
  });
});

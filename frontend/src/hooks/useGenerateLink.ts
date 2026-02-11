import { useState } from "react";
import { toast } from "sonner";
import type { GenerateLinkResponse, ErrorResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL + "/generate-link";

export function useGenerateLink() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [links, setLinks] = useState<Record<string, string>>({});

  const generate = async (docId: string, docName: string) => {
    setLoading((prev) => ({ ...prev, [docId]: true }));
    const toastId = toast.loading("Generating secure link...");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName: docName }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          (data as ErrorResponse)?.error ?? "Failed to generate link";
        throw new Error(errorMessage);
      }

      const { token, link } = data as GenerateLinkResponse;

      const secureUrl =
        link ?? `${window.location.origin}/docs/view/${token}`;

      setLinks((prev) => ({ ...prev, [docId]: secureUrl }));
      toast.success("Secure link generated successfully", { id: toastId });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate link";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading((prev) => ({ ...prev, [docId]: false }));
    }
  };

  return { generate, loading, links };
}

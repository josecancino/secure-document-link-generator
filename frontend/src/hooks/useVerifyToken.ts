import { useEffect, useState, useRef } from "react";
import type { ViewDocumentResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL + "/docs/view";

export function useVerifyToken(token: string | undefined) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [docName, setDocName] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token || hasFetched.current) return;
    hasFetched.current = true;

    const verify = async () => {
      try {
        const response = await fetch(`${API_URL}/${token}`);
        if (response.ok) {
          const data = (await response.json()) as ViewDocumentResponse;
          setDocName(data.documentName);
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err: unknown) {
        console.error("Verification error:", err);
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return { status, docName };
}

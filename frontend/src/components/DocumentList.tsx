import { useState } from "react";
import { toast } from "sonner";

interface DocumentItem {
  id: string;
  name: string;
}

const DOCUMENTS: DocumentItem[] = [
  { id: "1", name: "2024-Q3-Statement.pdf" },
  { id: "2", name: "2023-Tax-Form-1099.pdf" },
  { id: "3", name: "Employment-Contract-V2.docx" },
];

const API_URL = import.meta.env.VITE_API_URL + "/generate-link";

export function DocumentList() {
  const [links, setLinks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const generateLink = async (docId: string, docName: string) => {
    setLoading((prev) => ({ ...prev, [docId]: true }));
    const toastId = toast.loading("Generating secure link...");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName: docName }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate link");
      }

      const data = await response.json();
      const token = data.token;
      const secureUrl = `${window.location.origin}/docs/view/${token}`;

      setLinks((prev) => ({ ...prev, [docId]: secureUrl }));
      toast.success("Secure link generated successfully", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate link", { id: toastId });
    } finally {
      setLoading((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="card">
      <h2 style={{ color: "var(--color-text-primary)" }}>
        My Secure Documents
      </h2>
      <div className="document-list">
        {DOCUMENTS.map((doc) => (
          <div
            key={doc.id}
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div className="document-row">
              <span className="document-name">📄 {doc.name}</span>
              <button
                onClick={() => generateLink(doc.id, doc.name)}
                disabled={loading[doc.id]}
              >
                {loading[doc.id] ? "Generating..." : "Generate Secure Link"}
              </button>
            </div>

            {links[doc.id] && (
              <div className="secure-link-container">
                <span className="secure-link">{links[doc.id]}</span>
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(links[doc.id])}
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

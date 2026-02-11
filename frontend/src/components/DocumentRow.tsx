import { copyToClipboard } from "../utils/clipboard";

export interface DocumentItem {
  id: string;
  name: string;
}

interface DocumentRowProps {
  doc: DocumentItem;
  isLoading: boolean;
  secureUrl?: string;
  onGenerate: () => void;
}

export function DocumentRow({
  doc,
  isLoading,
  secureUrl,
  onGenerate,
}: DocumentRowProps) {
  return (
    <div className="document-item-container">
      <div className="document-row">
        <span className="document-name">📄 {doc.name}</span>
        <button onClick={onGenerate} disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Secure Link"}
        </button>
      </div>

      {secureUrl && (
        <div className="secure-link-container">
          <div className="flex-row gap-1 w-full">
            <span className="secure-link">{secureUrl}</span>
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(secureUrl)}
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

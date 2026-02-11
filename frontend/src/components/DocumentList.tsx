import { useGenerateLink } from "../hooks/useGenerateLink";
import { DocumentRow, type DocumentItem } from "./DocumentRow";

const DOCUMENTS: DocumentItem[] = [
  { id: "1", name: "2024-Q3-Statement.pdf" },
  { id: "2", name: "2023-Tax-Form-1099.pdf" },
  { id: "3", name: "Employment-Contract-V2.docx" },
];

export function DocumentList() {
  const { generate, loading, links } = useGenerateLink();

  return (
    <div className="card">
      <h2 className="text-primary">My Secure Documents</h2>
      <div className="document-list">
        {DOCUMENTS.map((doc) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            isLoading={loading[doc.id]}
            secureUrl={links[doc.id]}
            onGenerate={() => generate(doc.id, doc.name)}
          />
        ))}
      </div>
    </div>
  );
}

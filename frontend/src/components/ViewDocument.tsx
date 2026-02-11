import { useParams, Link } from "react-router-dom";
import { useVerifyToken } from "../hooks/useVerifyToken";

export function ViewDocument() {
  const { token } = useParams<{ token: string }>();
  const { status, docName } = useVerifyToken(token);

  if (status === "loading") {
    return <div className="card">Loading...</div>;
  }

  if (status === "error") {
    return (
      <div className="card error-card">
        <h2 className="error-text">Access Denied</h2>
        <p>Invalid or expired link.</p>
        <div className="mt-1">
          <Link to="/">Go Back Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card success-card">
      <div className="status-badge status-success">Secure Access Granted</div>
      <h2>Document Viewer</h2>
      <p>You are now securely viewing:</p>
      <div className="doc-viewer-name">{docName}</div>
      <div className="mt-2">
        <Link to="/">Go Back Home</Link>
      </div>
    </div>
  );
}

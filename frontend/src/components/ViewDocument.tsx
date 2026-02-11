import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL + '/docs/view';

export function ViewDocument() {
    const { token } = useParams<{ token: string }>();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [docName, setDocName] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const verifyToken = async () => {
            setStatus('loading');
            try {
                const response = await fetch(`${API_URL}/${token}`, {
                    signal: controller.signal
                });

                if (response.ok) {
                    const data = await response.json();
                    setDocName(data.documentName);
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (err) {
                if (controller.signal.aborted) return;
                console.error(err);
                setStatus('error');
            }
        };

        if (token) {
            verifyToken();
        } else {
            setStatus('error');
        }

        return () => {
            controller.abort();
        };
    }, [token]);

    if (status === 'loading') {
        return <div className="card">Loading...</div>;
    }

    if (status === 'error') {
        return (
            <div className="card" style={{ borderColor: 'var(--color-error)' }}>
                <h2 style={{ color: 'var(--color-error)' }}>Access Denied</h2>
                <p>Invalid or expired link.</p>
                <div style={{ marginTop: '1.5rem' }}>
                    <Link to="/">Go Back Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ borderColor: 'var(--color-success)' }}>
            <div className="status-badge status-success">Secure Access Granted</div>
            <h2>Document Viewer</h2>
            <p>You are now securely viewing:</p>
            <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '1.5rem 0',
                padding: '1rem',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-md)'
            }}>
                {docName}
            </div>
            <div style={{ marginTop: '2rem' }}>
                <Link to="/">Go Back Home</Link>
            </div>
        </div>
    );
}
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import { DocumentList } from './components/DocumentList';
import { ViewDocument } from './components/ViewDocument';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Toaster richColors position="bottom-right" />
        <h1>Secure Docs Manager</h1>
        <Routes>
          <Route path="/" element={<DocumentList />} />
          <Route path="/docs/view/:token" element={<ViewDocument />} />
        </Routes>

        <footer style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          <p>Locked & Loaded with Bun + Nest + React 🔒</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
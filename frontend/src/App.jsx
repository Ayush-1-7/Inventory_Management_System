import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

function App() {
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /** Show a toast that auto-dismisses after 4 seconds. */
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <button className="nav-toggle" onClick={() => setSidebarOpen(true)} aria-label="Menu">
          ☰
        </button>
        <div
          className={`nav-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard toast={toast} />} />
            <Route path="/products" element={<Products toast={toast} />} />
            <Route path="/customers" element={<Customers toast={toast} />} />
            <Route path="/orders" element={<Orders toast={toast} />} />
          </Routes>
        </main>
      </div>

      {/* Toast layer */}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' ? '✓' : '✕'} {t.message}
          </div>
        ))}
      </div>
    </BrowserRouter>
  );
}

export default App;

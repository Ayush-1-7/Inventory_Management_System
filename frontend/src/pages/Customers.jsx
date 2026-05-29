import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import CustomerForm from '../components/CustomerForm';

export default function Customers({ toast }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchCustomers = useCallback(() => {
    api
      .get('/api/customers')
      .then((r) => setCustomers(r.data))
      .catch((err) => toast(err.response?.data?.detail || 'Failed to load customers', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleSave = async (data) => {
    await api.post('/api/customers', data);
    toast('Customer added');
    setShowForm(false);
    fetchCustomers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer? Their orders will also be removed.')) return;
    try {
      await api.delete(`/api/customers/${id}`);
      toast('Customer deleted');
      fetchCustomers();
    } catch (err) {
      toast(err.response?.data?.detail || 'Delete failed', 'error');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h1>Customers</h1>
        <p>Manage your customer database</p>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <h2>All Customers ({customers.length})</h2>
          <button id="add-customer-btn" className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Customer
          </button>
        </div>

        {customers.length === 0 ? (
          <div className="empty">
            <h3>No customers yet</h3>
            <p>Add your first customer to start tracking orders.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Customer</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.full_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <CustomerForm
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

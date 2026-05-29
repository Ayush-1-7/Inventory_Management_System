import React, { useState } from 'react';

/**
 * CustomerForm — Modal for adding a customer.
 * Props:
 *   onClose — close modal
 *   onSave  — (formData) => Promise
 */
export default function CustomerForm({ onClose, onSave }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError('');

    try {
      await onSave({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
      });
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Add Customer</h2>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {apiError && <div className="api-error">{apiError}</div>}

            <div className="form-group">
              <label htmlFor="cf-name">Full Name</label>
              <input id="cf-name" placeholder="John Doe" value={form.full_name} onChange={set('full_name')} />
              {errors.full_name && <div className="field-error">{errors.full_name}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="cf-email">Email</label>
              <input id="cf-email" type="email" placeholder="john@example.com" value={form.email} onChange={set('email')} />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="cf-phone">Phone (optional)</label>
              <input id="cf-phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

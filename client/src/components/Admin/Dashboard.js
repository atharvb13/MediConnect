import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PageLayout from '../Common/PageLayout';
import LoadingState from '../Common/LoadingState';
import Alert from '../Common/Alert';
import { useToast } from '../Common/ToastContext';
import './admin.css';

const AdminDashboard = () => {
  const { addToast } = useToast();
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pending, all] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/pending-doctors'),
        axios.get('http://localhost:5001/api/admin/all-doctors'),
      ]);
      setPendingDoctors(pending.data);
      setAllDoctors(all.data);
    } catch {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const approveDoctor = async (doctorId, email) => {
    try {
      await axios.post('http://localhost:5001/api/admin/approve-doctor', { doctorId, email });
      addToast('Doctor approved successfully', 'success');
      loadData();
    } catch {
      addToast('Failed to approve doctor', 'error');
    }
  };

  if (loading) {
    return (
      <PageLayout role="admin">
        <div className="page-content">
          <LoadingState message="Loading dashboard..." />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout role="admin">
      <div className="page-content">
        <header className="page-content-header">
          <h1>Admin Dashboard</h1>
          <p>Review and approve doctor registrations</p>
        </header>

        {error && <div style={{ marginBottom: 16 }}><Alert type="error">{error}</Alert></div>}

        <section className="admin-card">
          <h2>Pending Doctor Requests ({pendingDoctors.length})</h2>
          {pendingDoctors.length === 0 ? (
            <p className="admin-empty">No pending requests.</p>
          ) : (
            <ul className="admin-list">
              {pendingDoctors.map((doc) => (
                <li key={doc._id} className="admin-list-item">
                  <div>
                    <strong>{doc.name}</strong>
                    <p>{doc.email} · {doc.qualification} · {doc.medicalLicenseId}</p>
                  </div>
                  <button
                    type="button"
                    className="app-btn app-btn-primary"
                    onClick={() => approveDoctor(doc._id, doc.email)}
                  >
                    Approve
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-card">
          <h2>All Doctors ({allDoctors.length})</h2>
          {allDoctors.length === 0 ? (
            <p className="admin-empty">No doctors registered yet.</p>
          ) : (
            <ul className="admin-list admin-list-readonly">
              {allDoctors.map((doc) => (
                <li key={doc._id} className="admin-list-item">
                  <div>
                    <strong>{doc.name}</strong>
                    <p>{doc.email} · {doc.qualification} · {doc.medicalLicenseId}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;

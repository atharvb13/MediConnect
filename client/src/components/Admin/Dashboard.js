import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);

  useEffect(() => {
    fetchPendingDoctors();
    fetchAllDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    const res = await axios.get(`http://localhost:5000/api/admin/pending-doctors`);
    setPendingDoctors(res.data);
  };

  const fetchAllDoctors = async () => {
    const res = await axios.get(`http://localhost:5000/api/admin/all-doctors`);
    setAllDoctors(res.data);
  };

  const approveDoctor = async (doctorId,email) => {
    await axios.post('http://localhost:5000/api/admin/approve-doctor', { doctorId, email });
    fetchPendingDoctors();
    fetchAllDoctors();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <h3>Pending Doctor Requests</h3>
      <ul>
        {pendingDoctors.map((doc) => (
          <li key={doc._id}>
            {doc.name} - {doc.email} - {doc.qualification} - {doc.medicalLicenseId}
            <button onClick={() => approveDoctor(doc._id, doc.email)}>Approve</button>
          </li>
        ))}
      </ul>

      <h3>All Doctors</h3>
      <ul>
        {allDoctors.map((doc) => (
          <li key={doc._id}>{doc.name} - {doc.email} - {doc.qualification} - {doc.medicalLicenseId}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
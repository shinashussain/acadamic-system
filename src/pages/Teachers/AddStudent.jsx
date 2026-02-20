import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import TeacherNavbar from '../../components/TeacherNavbar';

const AddStudent = () => {
    const navigate = useNavigate();
    const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}');

    const [formData, setFormData] = useState({
        name: '',
        admissionNumber: '',
        email: '',
        department: teacherInfo.department?._id || '',
        batch: '',
        phoneNumber: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.department) {
            setError('Teacher department not found. Please contact admin.');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/students', formData);
            if (response.data.success) {
                setSuccess('Student added successfully!');
                setFormData({
                    name: '',
                    admissionNumber: '',
                    email: '',
                    department: teacherInfo.department?._id || '',
                    batch: '',
                    phoneNumber: '',
                    address: ''
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-student-page">
            <TeacherNavbar />
            <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2>Add New Student</h2>
                        <button
                            onClick={() => navigate('/teacher/students')}
                            className="btn"
                            style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                        >
                            Back to Students
                        </button>
                    </div>

                    {success && <div className="success-banner">{success}</div>}
                    {error && <div className="error-banner">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label>Department</label>
                                <input
                                    type="text"
                                    value={teacherInfo.department?.name || 'N/A'}
                                    disabled
                                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Admission Number</label>
                                <input
                                    type="text"
                                    name="admissionNumber"
                                    value={formData.admissionNumber}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., ADM-2023-001"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Batch / Year</label>
                                <input
                                    type="text"
                                    name="batch"
                                    value={formData.batch}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., 2023-2027"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label>Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1.5rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Adding Student...' : 'Add Student'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddStudent;

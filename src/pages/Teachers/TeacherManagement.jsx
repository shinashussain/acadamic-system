import { useState, useEffect } from 'react';
import api from '../../services/api';
import './TeacherManagement.css';

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        designation: '',
        phoneNumber: '',
        address: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchTeachers();
        fetchDepartments();
    }, []);

    const fetchTeachers = async () => {
        try {
            const response = await api.get('/teachers');
            if (response.data.success) {
                setTeachers(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch teachers:', err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/departments');
            if (response.data.success) {
                setDepartments(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/teachers', formData);
            if (response.data.success) {
                setSuccess('Teacher created successfully!');
                setFormData({
                    name: '',
                    email: '',
                    department: '',
                    designation: '',
                    phoneNumber: '',
                    address: '',
                    password: ''
                });
                fetchTeachers();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create teacher');
        } finally {
            setLoading(false);
        }
    };

    const handleClearList = async () => {
        if (window.confirm('Are you sure you want to delete all teachers? This action cannot be undone.')) {
            try {
                setLoading(true);
                await api.delete('/teachers');
                setSuccess('All teachers deleted successfully!');
                fetchTeachers();
            } catch (err) {
                setError('Failed to delete teachers');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="teachers-container">
            <div className="management-header">
                <h2>Teacher Management</h2>
            </div>

            <div className="teacher-grid">
                <div className="teacher-form-card">
                    <h3>Add New Teacher</h3>

                    {success && <div className="success-banner">{success}</div>}
                    {error && <div className="error-banner">{error}</div>}

                    <form onSubmit={handleSubmit}>
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
                            <label>Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept._id} value={dept._id}>
                                        {dept.name} ({dept.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Designation</label>
                            <input
                                type="text"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                required
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
                        <div className="form-group">
                            <label>Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password (Default: teacher123)</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Teacher'}
                        </button>
                    </form>
                </div>

                <div className="teacher-list-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Teacher List</h3>
                        {teachers.length > 0 && (
                            <button
                                className="btn btn-small btn-danger"
                                onClick={handleClearList}
                                disabled={loading}
                            >
                                Delete All
                            </button>
                        )}
                    </div>
                    <div className="teacher-table-container">
                        <table className="teacher-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Designation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No teachers found</td>
                                    </tr>
                                ) : (
                                    teachers.map((teacher) => (
                                        <tr key={teacher._id}>
                                            <td>{teacher.name}</td>
                                            <td>{teacher.email}</td>
                                            <td>{teacher.department?.name || 'Unassigned'}</td>
                                            <td>{teacher.designation}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherManagement;

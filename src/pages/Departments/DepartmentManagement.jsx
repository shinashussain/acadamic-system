import { useState, useEffect } from 'react';
import api from '../../services/api';
import './DepartmentManagement.css';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

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
            if (editingId) {
                await api.put(`/departments/${editingId}`, formData);
                setSuccess('Department updated successfully!');
            } else {
                await api.post('/departments', formData);
                setSuccess('Department created successfully!');
            }
            setFormData({ name: '', code: '', description: '' });
            setEditingId(null);
            fetchDepartments();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (dept) => {
        setFormData({
            name: dept.name,
            code: dept.code,
            description: dept.description || ''
        });
        setEditingId(dept._id);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await api.delete(`/departments/${id}`);
                setSuccess('Department deleted successfully!');
                fetchDepartments();
            } catch (err) {
                setError('Failed to delete department');
            }
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', code: '', description: '' });
        setEditingId(null);
        setError('');
        setSuccess('');
    };

    return (
        <div className="departments-container">
            <div className="management-header">
                <h2>Department Management</h2>
            </div>

            <div className="department-grid">
                <div className="department-form-card">
                    <h3>{editingId ? 'Edit Department' : 'Add New Department'}</h3>

                    {success && <div className="success-banner">{success}</div>}
                    {error && <div className="error-banner">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Code</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                                placeholder="e.g. CS, PHYS"
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : (editingId ? 'Update' : 'Create')}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="department-list-card">
                    <h3>Department List</h3>
                    <div className="teacher-table-container">
                        <table className="teacher-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No departments found</td>
                                    </tr>
                                ) : (
                                    departments.map((dept) => (
                                        <tr key={dept._id}>
                                            <td style={{ fontWeight: 600 }}>{dept.code}</td>
                                            <td>{dept.name}</td>
                                            <td style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>{dept.description}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn btn-small btn-primary"
                                                    onClick={() => window.location.href = `/departments/${dept._id}`}
                                                    style={{ marginRight: '0.5rem' }}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="btn btn-small"
                                                    onClick={() => handleEdit(dept)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-small btn-danger"
                                                    onClick={() => handleDelete(dept._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
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

export default DepartmentManagement;

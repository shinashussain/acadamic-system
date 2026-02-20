import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import TeacherNavbar from '../../components/TeacherNavbar';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/students');
            if (response.data.success) {
                setStudents(response.data.data);
            }
        } catch (err) {
            setError('Failed to fetch students.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-management-page">
            <TeacherNavbar />
            <div className="container" style={{ margin: '2rem auto' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2>Student Management</h2>
                            <p>View and manage your students</p>
                        </div>
                        <div>
                            <button
                                onClick={() => navigate('/teacher/add-student')}
                                className="btn btn-primary"
                            >
                                Add New Student
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    {loading ? (
                        <p>Loading students...</p>
                    ) : students.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
                            <p>No students found. Click "Add New Student" to get started.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Admission No.</th>
                                        <th style={{ padding: '1rem' }}>Name</th>
                                        <th style={{ padding: '1rem' }}>Department</th>
                                        <th style={{ padding: '1rem' }}>Batch</th>
                                        <th style={{ padding: '1rem' }}>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr
                                            key={student._id}
                                            onClick={() => navigate(`/teacher/students/${student._id}`)}
                                            style={{
                                                borderBottom: '1px solid var(--border)',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '1rem' }}>{student.admissionNumber}</td>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{student.name}</td>
                                            <td style={{ padding: '1rem' }}>{student.department?.name || 'N/A'}</td>
                                            <td style={{ padding: '1rem' }}>{student.batch}</td>
                                            <td style={{ padding: '1rem' }}>{student.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentManagement;

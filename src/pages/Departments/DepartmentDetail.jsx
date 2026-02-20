import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DepartmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [department, setDepartment] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptRes, studentsRes] = await Promise.all([
                api.get(`/departments/${id}`),
                api.get(`/students?department=${id}`)
            ]);

            if (deptRes.data.success) {
                setDepartment(deptRes.data.data);
            }
            if (studentsRes.data.success) {
                setStudents(studentsRes.data.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load department details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
    }

    if (error || !department) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p style={{ color: 'red' }}>{error || 'Department not found'}</p>
                <button className="btn" onClick={() => navigate('/departments')}>Back to Departments</button>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.5rem' }}>{department.name} ({department.code})</h2>
                    <p style={{ color: '#666' }}>{department.description}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/departments')}>
                    Back to Departments
                </button>
            </div>

            {/* Students List */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Students ({students.length})</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '0.75rem' }}>Name</th>
                                <th style={{ padding: '0.75rem' }}>Admission No</th>
                                <th style={{ padding: '0.75rem' }}>Batch</th>
                                <th style={{ padding: '0.75rem' }}>Contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <tr
                                        key={student._id}
                                        style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                                        onClick={() => navigate(`/admin/students/${student._id}`)}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '0.75rem', fontWeight: '500', color: '#1976d2' }}>
                                            {student.name}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>{student.admissionNumber}</td>
                                        <td style={{ padding: '0.75rem' }}>{student.batch}</td>
                                        <td style={{ padding: '0.75rem' }}>{student.email}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                        No students found in this department
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DepartmentDetail;

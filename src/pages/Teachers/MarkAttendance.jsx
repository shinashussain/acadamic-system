import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TeacherNavbar from '../../components/TeacherNavbar';
import { useNavigate } from 'react-router-dom';

const MarkAttendance = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Default Date: Today
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);

    // Default Session: Based on time
    const currentHour = new Date().getHours();
    const defaultSession = currentHour < 12 ? 'Morning' : 'Afternoon';
    const [session, setSession] = useState(defaultSession);

    // Attendance Data: Map of studentId -> status
    const [attendanceData, setAttendanceData] = useState({});

    useEffect(() => {
        fetchStudentsAndAttendance();
    }, [date, session]);

    const fetchStudentsAndAttendance = async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Fetch Students
            const studentsRes = await api.get('/students');
            const studentList = studentsRes.data.data;
            setStudents(studentList);

            // 2. Fetch Existing Attendance
            const attendanceRes = await api.get(`/attendance?date=${date}&session=${session}`);
            const existingRecords = attendanceRes.data.data;

            // 3. Merge Data
            const initialData = {};
            studentList.forEach(student => {
                // Check if record exists
                const record = existingRecords.find(r => r.student._id === student._id);
                initialData[student._id] = record ? record.status : 'Present'; // Default to Present if no record
            });
            setAttendanceData(initialData);

        } catch (err) {
            console.error(err);
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                date,
                session,
                students: Object.keys(attendanceData).map(studentId => ({
                    studentId,
                    status: attendanceData[studentId]
                }))
            };

            await api.post('/attendance', payload);
            setSuccess('Attendance saved successfully!');
            setTimeout(() => {
                navigate('/teacher/attendance'); // Go back to dashboard after saving
            }, 1000);
        } catch (err) {
            console.error(err);
            setError('Failed to save attendance.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="attendance-page">
            <TeacherNavbar />
            <div className="container" style={{ margin: '2rem auto' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2>Mark Attendance</h2>
                            <p>Select date and session.</p>
                        </div>
                        <button
                            onClick={() => navigate('/teacher/attendance')}
                            className="btn"
                            style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="filters" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Date:</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Session:</label>
                            <select
                                value={session}
                                onChange={(e) => setSession(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', minWidth: '150px' }}
                            >
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                            </select>
                        </div>
                    </div>

                    {error && <div className="error-banner">{error}</div>}
                    {success && <div className="success-banner">{success}</div>}

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Admission No.</th>
                                        <th style={{ padding: '1rem' }}>Name</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem' }}>{student.admissionNumber}</td>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{student.name}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    {['Present', 'Absent', 'Late', 'Excused'].map(status => (
                                                        <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                            <input
                                                                type="radio"
                                                                name={`status-${student._id}`}
                                                                value={status}
                                                                checked={attendanceData[student._id] === status}
                                                                onChange={() => handleStatusChange(student._id, status)}
                                                            />
                                                            <span style={{
                                                                color: status === 'Absent' ? 'red' :
                                                                    status === 'Present' ? 'green' :
                                                                        status === 'Late' ? 'orange' : 'black'
                                                            }}>
                                                                {status}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
                                >
                                    {loading ? 'Saving...' : 'Save and Close'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarkAttendance;

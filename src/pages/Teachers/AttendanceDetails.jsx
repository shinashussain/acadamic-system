import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TeacherNavbar from '../../components/TeacherNavbar';
import { useParams, useNavigate } from 'react-router-dom';

const AttendanceDetails = () => {
    const { date } = useParams();
    const navigate = useNavigate();
    const [mergedRecords, setMergedRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, [date]);

    const fetchAttendance = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch all records for the date (both sessions)
            const response = await api.get(`/attendance?date=${date}`);
            const allRecords = response.data.data;

            // Process data to merge by student
            const studentMap = {};

            allRecords.forEach(record => {
                const studentId = record.student._id;
                if (!studentMap[studentId]) {
                    studentMap[studentId] = {
                        student: record.student,
                        morning: '-',
                        afternoon: '-'
                    };
                }
                if (record.session === 'Morning') {
                    studentMap[studentId].morning = record.status;
                } else if (record.session === 'Afternoon') {
                    studentMap[studentId].afternoon = record.status;
                }
            });

            setMergedRecords(Object.values(studentMap));
        } catch (err) {
            console.error(err);
            setError('Failed to fetch attendance details.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusStyle = (status) => {
        if (status === 'Absent') return { color: 'red', fontWeight: 'bold' };
        if (status === 'Present') return { color: 'green', fontWeight: 'bold' };
        if (status === 'Late') return { color: 'orange', fontWeight: 'bold' };
        return { color: '#888' };
    };

    return (
        <div className="view-attendance-page">
            <TeacherNavbar />
            <div className="container" style={{ margin: '2rem auto' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ marginTop: '0.5rem' }}>{formatDate(date)}</h2>
                            <p>Combined Daily Report</p>
                        </div>
                        <button
                            className="btn"
                            onClick={() => navigate('/teacher/attendance')}
                            style={{ padding: '0.5rem 1rem', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    {loading ? (
                        <p>Loading details...</p>
                    ) : mergedRecords.length === 0 ? (
                        <p>No records found for this date.</p>
                    ) : (
                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Admission No.</th>
                                        <th style={{ padding: '1rem' }}>Student</th>
                                        <th style={{ padding: '1rem' }}>Morning</th>
                                        <th style={{ padding: '1rem' }}>Afternoon</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mergedRecords.map((record, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem' }}>{record.student?.admissionNumber || 'N/A'}</td>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{record.student?.name || 'Unknown'}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={getStatusStyle(record.morning)}>
                                                    {record.morning}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={getStatusStyle(record.afternoon)}>
                                                    {record.afternoon}
                                                </span>
                                            </td>
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

export default AttendanceDetails;

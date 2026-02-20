import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentProgressReport = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const getAttendanceForDate = (day) => {
        if (!data || !data.attendance || !data.attendance.records) return { morning: 'Na', afternoon: 'Na' };

        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        const records = data.attendance.records.filter(r => new Date(r.date).toDateString() === dateStr);

        let status = { morning: 'Na', afternoon: 'Na' };

        records.forEach(r => {
            if (r.session === 'Morning') status.morning = r.status;
            if (r.session === 'Afternoon') status.afternoon = r.status;
        });

        return status;
    };

    const getStatusColorCode = (status) => {
        switch (status) {
            case 'Present': return 'rgba(76, 175, 80, 0.2)'; // Green low opacity
            case 'Absent': return 'rgba(239, 83, 80, 0.2)';  // Red low opacity
            case 'Late': return 'rgba(255, 152, 0, 0.2)';    // Yellow low opacity
            default: return 'transparent';                   // Transparent
        }
    };

    useEffect(() => {
        fetchReport();
    }, [id]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get(`/parent/student/${id}`);
            if (response.data.success) {
                setData(response.data.data);
            } else {
                throw new Error('Failed to load report data');
            }
        } catch (err) {
            console.error('Error fetching report:', err);
            setError(err.response?.data?.message || 'Unable to load student report. The link may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return '#4caf50';
            case 'Absent': return '#ef5350';
            case 'Late': return '#ff9800';
            default: return '#999';
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ margin: '2rem auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <div className="spinner"></div>
                <p>Loading student report...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="container" style={{ margin: '2rem auto', maxWidth: '600px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <div style={{ padding: '2rem', borderRadius: '8px', backgroundColor: '#ffebee', color: '#c62828' }}>
                    <h3>Unable to load report</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const { student, attendance, performance } = data;

    // Prepare chart data
    const chartData = performance.results.slice(0, 5).reverse().map(result => ({
        name: result.exam?.name?.substring(0, 15) || 'Exam',
        obtained: result.marksObtained,
        total: result.exam?.totalMarks || 0,
    }));

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f5f7fa', minHeight: '100vh', padding: '2rem 1rem' }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Student Progress Report</h1>
                    <p style={{ color: '#7f8c8d' }}>Academic Performance & Attendance Overview</p>
                </div>

                {/* Student Profile Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    marginBottom: '2rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2rem',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#3498db',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                    }}>
                        {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{student.name}</h2>
                        <div style={{ display: 'flex', gap: '1.5rem', color: '#7f8c8d', fontSize: '0.95rem', flexWrap: 'wrap' }}>
                            <span><strong>Adm No:</strong> {student.admissionNumber}</span>
                            <span><strong>Batch:</strong> {student.batch}</span>
                            <span><strong>Dept:</strong> {student.department?.name}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Attendance Card */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem', marginTop: 0, color: '#34495e' }}>Attendance</h3>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1, backgroundColor: '#e8f5e9', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32' }}>{attendance.summary.percentage}%</div>
                                <div style={{ fontSize: '0.8rem', color: '#2e7d32' }}>Present</div>
                            </div>
                            <div style={{ flex: 1, backgroundColor: '#ffebee', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c62828' }}>{attendance.summary.absent}</div>
                                <div style={{ fontSize: '0.8rem', color: '#c62828' }}>Days Absent</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '1rem', color: '#7f8c8d', margin: 0 }}>Attendance Calendar</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button onClick={prevMonth} style={{ background: 'none', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', padding: '0.25rem 0.5rem' }}>&lt;</button>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                </span>
                                <button onClick={nextMonth} style={{ background: 'none', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', padding: '0.25rem 0.5rem' }}>&gt;</button>
                            </div>
                        </div>

                        <div className="calendar-grid">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginBottom: '5px' }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: '#666' }}>
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                                {Array.from({ length: getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}
                                {Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
                                    const day = i + 1;
                                    const status = getAttendanceForDate(day);
                                    return (
                                        <div key={day} style={{
                                            border: '1px solid #eee',
                                            borderRadius: '8px',
                                            height: '50px',
                                            position: 'relative',
                                            display: 'flex',
                                            overflow: 'hidden'
                                        }}>
                                            {/* Date Overlay */}
                                            <span style={{
                                                position: 'absolute',
                                                top: '2px',
                                                left: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                color: '#333',
                                                zIndex: 2,
                                                pointerEvents: 'none'
                                            }}>{day}</span>

                                            {/* Morning Slot (Left) */}
                                            <div title={`Morning: ${status.morning}`} style={{
                                                flex: 1,
                                                background: getStatusColorCode(status.morning),
                                                borderRight: '1px solid rgba(0,0,0,0.05)'
                                            }} />

                                            {/* Afternoon Slot (Right) */}
                                            <div title={`Afternoon: ${status.afternoon}`} style={{
                                                flex: 1,
                                                background: getStatusColorCode(status.afternoon)
                                            }} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: 'rgba(76, 175, 80, 0.2)', border: '1px solid #ddd' }} /> Present</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: 'rgba(239, 83, 80, 0.2)', border: '1px solid #ddd' }} /> Absent</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: 'rgba(255, 152, 0, 0.2)', border: '1px solid #ddd' }} /> Late</div>
                        </div>
                    </div>

                    {/* Performance Card */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem', marginTop: 0, color: '#34495e' }}>Performance</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#7f8c8d' }}>Overall Score</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e67e22' }}>{performance.summary.overallPercentage}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                                <div style={{
                                    width: `${performance.summary.overallPercentage}%`,
                                    height: '100%',
                                    backgroundColor: '#e67e22',
                                    borderRadius: '4px'
                                }}></div>
                            </div>
                        </div>

                        {chartData.length > 0 && (
                            <div style={{ height: '200px', marginBottom: '1.5rem' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="obtained" fill="#3498db" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        <h4 style={{ fontSize: '1rem', color: '#7f8c8d', marginBottom: '1rem' }}>Exam Results</h4>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <tbody>
                                    {performance.results.map((result, index) => {
                                        const pct = result.item?.totalMarks ? (result.marksObtained / result.exam.totalMarks * 100) : 0;
                                        return (
                                            <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                <td style={{ padding: '0.75rem 0' }}>
                                                    <div style={{ fontWeight: '600', color: '#333' }}>{result.exam?.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                                                        {new Date(result.exam?.date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                                                        {result.marksObtained} <span style={{ color: '#999', fontWeight: 'normal' }}>/ {result.exam?.totalMarks}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {performance.results.length === 0 && (
                                        <tr><td colSpan="2" style={{ textAlign: 'center', padding: '1rem', color: '#999' }}>No results found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem', color: '#95a5a6', fontSize: '0.9rem' }}>
                    <p>&copy; {new Date().getFullYear()} Academic System. Confidential Report.</p>
                </div>

            </div>
        </div>
    );
};

export default StudentProgressReport;

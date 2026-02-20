import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TeacherNavbar from '../../components/TeacherNavbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentDetail = ({ isAdmin = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [attendance, setAttendance] = useState({ records: [], summary: {} });
    const [performance, setPerformance] = useState({ results: [], summary: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedExamMonth, setSelectedExamMonth] = useState('');

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
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        const records = attendance.records.filter(r => new Date(r.date).toDateString() === dateStr);

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
        fetchStudentData();
    }, [id]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            setError('');

            let foundStudent = null;
            let attendanceData = { records: [], summary: {} };
            let performanceData = { results: [], summary: {} };

            // Fetch student info
            try {
                const studentRes = await api.get(`/students/${id}`);
                if (studentRes.data.success) {
                    foundStudent = studentRes.data.data;
                }
            } catch (err) {
                throw new Error('Failed to fetch student profile');
            }

            // Fetch attendance
            try {
                const attendanceRes = await api.get(`/attendance/student/${id}`);
                if (attendanceRes.data.success) {
                    attendanceData = attendanceRes.data.data;
                }
            } catch (err) {
                console.error('Error fetching attendance:', err);
            }

            // Fetch performance
            try {
                const performanceRes = await api.get(`/exams/student/${id}/results`);
                if (performanceRes.data.success) {
                    performanceData = performanceRes.data.data;
                }
            } catch (err) {
                console.error('Error fetching performance:', err);
            }

            if (foundStudent) {
                setStudent(foundStudent);
                if (attendanceData) setAttendance(attendanceData);
                if (performanceData) setPerformance(performanceData);
            } else {
                throw new Error('Student not found');
            }

        } catch (err) {
            console.error('Error in fetchStudentData:', err);
            setError(err.message || 'Failed to load student details');
        } finally {
            setLoading(false);
        }
    };

    const copyParentLink = () => {
        const link = `${window.location.origin}/parent/student/${id}`;
        navigator.clipboard.writeText(link).then(() => {
            alert('Parent link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link:', err);
            prompt('Copy this link:', link);
        });
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
            <div className="student-detail-page">
                {!isAdmin && <TeacherNavbar />}
                <div className="container" style={{ margin: '2rem auto', textAlign: 'center' }}>
                    <p>Loading student details...</p>
                </div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="student-detail-page">
                {!isAdmin && <TeacherNavbar />}
                <div className="container" style={{ margin: '2rem auto', maxWidth: '800px', textAlign: 'center' }}>
                    <div className="error-banner" style={{ padding: '2rem', borderRadius: '8px', backgroundColor: '#ffebee', color: '#c62828' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Unable to load student details</h3>
                        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{error || 'Student not found'}</p>
                        <p style={{ fontFamily: 'monospace', background: '#ffcdd2', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                            ID: {id}
                        </p>
                    </div>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={fetchStudentData} className="btn btn-primary" style={{ backgroundColor: '#1976d2', color: 'white' }}>
                            Retry
                        </button>
                        <button onClick={() => navigate(isAdmin ? -1 : '/teacher/students')} className="btn btn-secondary">
                            Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const filteredResults = selectedExamMonth
        ? performance.results.filter(r => {
            const examDate = new Date(r.exam?.date);
            const [year, month] = selectedExamMonth.split('-');
            return examDate.getFullYear() === parseInt(year) && (examDate.getMonth() + 1) === parseInt(month);
        })
        : performance.results.slice(0, 5); // Default to last 5 if no month selected

    // Calculate monthly/filtered stats
    const stats = filteredResults.reduce((acc, curr) => {
        acc.total += curr.exam?.totalMarks || 0;
        acc.obtained += curr.marksObtained || 0;
        return acc;
    }, { total: 0, obtained: 0 });

    const filteredPercentage = stats.total > 0 ? ((stats.obtained / stats.total) * 100).toFixed(1) : 0;

    const chartData = filteredResults.reverse().map(result => ({
        name: result.exam?.name?.substring(0, 15) || 'Exam',
        obtained: result.marksObtained,
        total: result.exam?.totalMarks || 0,
        percentage: result.exam?.totalMarks ? ((result.marksObtained / result.exam.totalMarks) * 100).toFixed(1) : 0
    }));

    return (
        <div className="student-detail-page">
            {!isAdmin && <TeacherNavbar />}
            <div className="container" style={{ margin: '2rem auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2>{student?.name || 'Student Details'}</h2>
                        <p style={{ color: '#666' }}>Admission No: {student?.admissionNumber || id}</p>
                    </div>
                    <div>
                        <button onClick={copyParentLink} className="btn" style={{ backgroundColor: '#27ae60', color: 'white', marginRight: '1rem', border: 'none' }}>
                            Share to Parent
                        </button>
                        <button onClick={() => navigate(isAdmin ? -1 : '/teacher/students')} className="btn btn-secondary">
                            Back
                        </button>
                    </div>
                </div>

                {/* Student Info Card */}
                <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Student Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <strong>Department:</strong>
                            <p>{student?.department?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <strong>Batch:</strong>
                            <p>{student?.batch || 'N/A'}</p>
                        </div>
                        <div>
                            <strong>Email:</strong>
                            <p>{student?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <strong>Phone:</strong>
                            <p>{student?.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Attendance Section */}
                    <div>
                        {/* Attendance Summary */}
                        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Attendance Summary</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ textAlign: 'center', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
                                        {attendance.summary.percentage || 0}%
                                    </div>
                                    <div style={{ color: '#666', fontSize: '0.9rem' }}>Attendance Rate</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Total Days:</span>
                                        <strong>{attendance.summary.total || 0}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50' }}>
                                        <span>Present:</span>
                                        <strong>{attendance.summary.present || 0}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef5350' }}>
                                        <span>Absent:</span>
                                        <strong>{attendance.summary.absent || 0}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff9800' }}>
                                        <span>Late:</span>
                                        <strong>{attendance.summary.late || 0}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance History (Calendar View) */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0 }}>Attendance Calendar</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button onClick={prevMonth} className="btn" style={{ padding: '0.25rem 0.75rem' }}>&lt;</button>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button onClick={nextMonth} className="btn" style={{ padding: '0.25rem 0.75rem' }}>&gt;</button>
                                </div>
                            </div>

                            <div className="calendar-grid">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginBottom: '5px' }}>
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: '#666' }}>
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
                                                height: '60px',
                                                position: 'relative',
                                                display: 'flex',
                                                overflow: 'hidden'
                                            }}>
                                                {/* Date Overlay */}
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    left: '6px',
                                                    fontSize: '0.85rem',
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
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: 'rgba(76, 175, 80, 0.2)', border: '1px solid #ddd' }} /> Present</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: 'rgba(239, 83, 80, 0.2)', border: '1px solid #ddd' }} /> Absent</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: 'rgba(255, 152, 0, 0.2)', border: '1px solid #ddd' }} /> Late</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: 'transparent', border: '1px solid #ddd' }} /> No Record</div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Section */}
                    <div>
                        {/* Performance Summary */}
                        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Performance Summary</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ textAlign: 'center', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ed6c02' }}>
                                        {performance.summary.overallPercentage || 0}%
                                    </div>
                                    <div style={{ color: '#666', fontSize: '0.9rem' }}>Overall Score</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Total Exams:</span>
                                        <strong>{performance.summary.totalExams || 0}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Marks Obtained:</span>
                                        <strong>{performance.summary.totalMarksObtained || 0}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Total Marks:</span>
                                        <strong>{performance.summary.totalPossibleMarks || 0}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Chart */}
                        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0 }}>Recent Exam Performance</h3>
                                <input
                                    type="month"
                                    value={selectedExamMonth}
                                    onChange={(e) => setSelectedExamMonth(e.target.value)}
                                    style={{
                                        padding: '0.4rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>

                            {chartData.length > 0 ? (
                                <>
                                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#666' }}>Total Marks</span>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>{stats.total}</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#666' }}>Obtained</span>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1976d2' }}>{stats.obtained}</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#666' }}>Percentage</span>
                                            <span style={{
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold',
                                                color: filteredPercentage >= 60 ? '#4caf50' : filteredPercentage >= 40 ? '#ff9800' : '#ef5350'
                                            }}>
                                                {filteredPercentage}%
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ height: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="obtained" name="Marks Obtained" fill="#1976d2" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="total" name="Total Marks" fill="#e0e0e0" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                                    No exams found for {selectedExamMonth ? new Date(selectedExamMonth).toLocaleDateString('default', { month: 'long', year: 'numeric' }) : 'this period'}.
                                </p>
                            )}
                        </div>

                        {/* Exam Results Table */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Exam Results</h3>
                            {performance.results.length > 0 ? (
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                                            <tr style={{ borderBottom: '2px solid #eee' }}>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Exam</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Marks</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {performance.results.map((result, index) => {
                                                const percentage = result.exam?.totalMarks
                                                    ? ((result.marksObtained / result.exam.totalMarks) * 100).toFixed(1)
                                                    : 0;
                                                return (
                                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '0.75rem' }}>
                                                            <div style={{ fontWeight: '500' }}>{result.exam?.name || 'N/A'}</div>
                                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                                {result.exam?.date ? new Date(result.exam.date).toLocaleDateString() : ''}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '500' }}>
                                                            {result.marksObtained}/{result.exam?.totalMarks || 0}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <span style={{
                                                                padding: '0.25rem 0.75rem',
                                                                borderRadius: '12px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '500',
                                                                background: percentage >= 60 ? '#4caf5020' : '#ef535020',
                                                                color: percentage >= 60 ? '#4caf50' : '#ef5350'
                                                            }}>
                                                                {percentage}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                                    No exam results found
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;

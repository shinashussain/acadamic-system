import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherNavbar from '../../components/TeacherNavbar';
import api from '../../services/api';
import './TeacherDashboard.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [teacherInfo, setTeacherInfo] = useState({});
    const [stats, setStats] = useState({
        studentCount: 0,
        attendanceToday: { Present: 0, Absent: 0, Late: 0 },
        recentAvg: '-'
    });
    const [attendanceTrend, setAttendanceTrend] = useState([]);
    const [recentExams, setRecentExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const info = JSON.parse(localStorage.getItem('teacherInfo') || '{}');
        setTeacherInfo(info);
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [studentsRes, attendanceRes, examsRes] = await Promise.all([
                api.get('/students'),
                api.get('/attendance/stats'),
                api.get('/exams')
            ]);

            const studentCount = studentsRes.data.count || 0;
            const attendanceData = attendanceRes.data.data || {};
            const examsList = examsRes.data.data || [];

            // Calculate recent exam average - show as "avg/total" not percentage
            let recentAvgDisplay = '-';
            if (examsList.length > 0 && examsList[0].average) {
                const avg = examsList[0].average.toFixed(1);
                const total = examsList[0].totalMarks || 100;
                recentAvgDisplay = `${avg}/${total}`;
            }

            setStats({
                studentCount,
                attendanceToday: attendanceData.summary || { Present: 0, Absent: 0, Late: 0 },
                recentAvg: recentAvgDisplay
            });
            setAttendanceTrend(attendanceData.trend || []);
            setRecentExams(examsList.slice(0, 3)); // Top 3 recent exams

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="teacher-dashboard">
            <TeacherNavbar />

            <main className="container dashboard-main">
                <header className="dashboard-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Welcome back, {teacherInfo.name} 👋</h2>
                        <p style={{ color: '#666', margin: 0 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </header>

                {/* Stats Row */}
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                        <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Students</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>{stats.studentCount}</div>
                    </div>

                    <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                        <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Present Today</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32' }}>{stats.attendanceToday.Present}</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>/ {stats.studentCount}</div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                        <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Latest Exam Avg</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ed6c02' }}>{stats.recentAvg}</div>
                    </div>
                </div>

                <div className="dashboard-content-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Left Column */}
                    <div className="main-content">
                        {/* Attendance Chart */}
                        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Weekly Attendance Overview</h3>
                            {attendanceTrend.length > 0 ? (
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" tickFormatter={date => new Date(date).getDate()} />
                                            <YAxis />
                                            <Tooltip labelFormatter={date => new Date(date).toLocaleDateString()} />
                                            <Legend />
                                            <Bar dataKey="Present" stackId="a" fill="#4caf50" radius={[0, 0, 4, 4]} />
                                            <Bar dataKey="Absent" stackId="a" fill="#ef5350" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                    No attendance data available this week.
                                </div>
                            )}
                        </div>

                        {/* Performance Analysis Chart */}
                        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Exam Performance Trends</h3>
                            {recentExams.length > 0 ? (
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={recentExams.slice().reverse().map(exam => ({
                                                name: exam.name.length > 15 ? exam.name.substring(0, 15) + '...' : exam.name,
                                                average: exam.average ? parseFloat(exam.average.toFixed(1)) : 0,
                                                total: exam.totalMarks
                                            }))}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value, name) => {
                                                    if (name === 'average') return [value, 'Average Score'];
                                                    return [value, 'Total Marks'];
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="average" name="Average Score" fill="#1976d2" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="total" name="Total Marks" fill="#e0e0e0" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                    No exam data available yet. Create an exam to see performance trends.
                                </div>
                            )}
                        </div>

                        {/* Recent Exams List */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0 }}>Recent Exams</h3>
                                <button onClick={() => navigate('/teacher/performance')} className="btn-link" style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer' }}>View All</button>
                            </div>

                            {recentExams.length > 0 ? (
                                <div className="exam-list">
                                    {recentExams.map(exam => (
                                        <div key={exam._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{exam.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{formatDate(exam.date)} • {exam.totalMarks} Marks</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>{exam.average ? exam.average.toFixed(1) : '-'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Avg Score</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#666' }}>No exams created yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Quick Actions */}
                    <div className="side-content">
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/teacher/attendance')}
                                    style={{ justifyContent: 'center', padding: '0.8rem' }}
                                >
                                    📝 Mark Attendance
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => navigate('/teacher/performance/create-exam')}
                                    style={{ justifyContent: 'center', padding: '0.8rem', border: '1px solid #1976d2', color: '#1976d2', background: 'white' }}
                                >
                                    ➕ Create Exam
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => navigate('/teacher/students/add')}
                                    style={{ justifyContent: 'center', padding: '0.8rem', border: '1px solid #1976d2', color: '#1976d2', background: 'white' }}
                                >
                                    👤 Add Student
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => navigate('/teacher/students')}
                                    style={{ justifyContent: 'center', padding: '0.8rem', border: '1px solid #666', color: '#666', background: 'white' }}
                                >
                                    📋 View Student List
                                </button>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', background: '#e3f2fd', border: 'none' }}>
                            <h3 style={{ color: '#1565c0', marginBottom: '0.5rem' }}>Need Help?</h3>
                            <p style={{ color: '#1e88e5', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Contact the administrator for any issues with the dashboard or data discrepancies.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;

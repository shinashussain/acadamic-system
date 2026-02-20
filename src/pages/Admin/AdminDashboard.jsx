import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        counts: {
            teachers: 0,
            students: 0,
            departments: 0
        },
        charts: {
            attendance: [],
            performance: [],
            deptAttendance: []
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard/admin/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching admin stats:', err);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <header style={{ padding: '2rem 0', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Academic System</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Dashboard</Link>
                        <button
                            className="btn"
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('userRole');
                                window.location.href = '/login';
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Admin Dashboard</h2>

                {error && (
                    <div className="error-banner" style={{ padding: '1rem', backgroundColor: '#ffebee', color: '#c62828', marginBottom: '1rem', borderRadius: '4px' }}>
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #3498db' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '1rem' }}>Total Teachers</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                            {loading ? '...' : stats.counts.teachers}
                        </div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #2ecc71' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '1rem' }}>Total Students</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                            {loading ? '...' : stats.counts.students}
                        </div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #e67e22' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '1rem' }}>Departments</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                            {loading ? '...' : stats.counts.departments}
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>

                    {/* Attendance Trend Chart */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#34495e' }}>Attendance Trend (Last 7 Days)</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.charts?.attendance || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="present" name="Present Students" stroke="#3498db" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Department Performance Chart */}
                    <div className="card" style={{ padding: '1.5rem', cursor: 'pointer' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#34495e' }}>Department Performance (Avg Score)</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats.charts?.performance || []}
                                    onClick={(data) => {
                                        if (data && data.activePayload && data.activePayload[0]) {
                                            const deptId = data.activePayload[0].payload._id;
                                            window.location.href = `/departments/${deptId}`;
                                        }
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Legend />
                                    <Bar dataKey="avgScore" name="Average Score" fill="#e67e22" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Click bars to view department</p>
                    </div>

                    {/* Department Attendance Chart (Today) */}
                    <div className="card" style={{ padding: '1.5rem', gridColumn: 'span 2', cursor: 'pointer' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#34495e' }}>Today's Attendance by Department</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats.charts?.deptAttendance || []}
                                    onClick={(data) => {
                                        if (data && data.activePayload && data.activePayload[0]) {
                                            const deptId = data.activePayload[0].payload._id;
                                            window.location.href = `/departments/${deptId}`;
                                        }
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Legend />
                                    <Bar dataKey="presentCount" name="Present Students" fill="#27ae60" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Click bars to view department</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <h3 style={{ marginBottom: '1rem', color: '#34495e' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <Link to="/teachers" style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'transform 0.2s', cursor: 'pointer' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>Manage Teachers</h3>
                                <p style={{ margin: 0, color: '#7f8c8d' }}>Add, edit, or remove teacher accounts.</p>
                            </div>
                            <span style={{ fontSize: '1.5rem', color: '#1976d2' }}>→</span>
                        </div>
                    </Link>
                    <Link to="/departments" style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'transform 0.2s', cursor: 'pointer' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>Manage Departments</h3>
                                <p style={{ margin: 0, color: '#7f8c8d' }}>Organize academic departments.</p>
                            </div>
                            <span style={{ fontSize: '1.5rem', color: '#1976d2' }}>→</span>
                        </div>
                    </Link>
                </div>

            </main>
        </div>
    );
};

export default AdminDashboard;

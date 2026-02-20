import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TeacherNavbar from '../../components/TeacherNavbar';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AttendanceDashboard = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    const filteredHistory = history.filter(record => {
        if (!selectedMonth) return true;
        const recordDate = new Date(record.date);
        const [year, month] = selectedMonth.split('-');
        return recordDate.getFullYear() === parseInt(year) && (recordDate.getMonth() + 1) === parseInt(month);
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [historyRes, statsRes] = await Promise.all([
                api.get('/attendance/dates'),
                api.get('/attendance/stats')
            ]);

            if (historyRes.data.success) {
                setHistory(historyRes.data.data);
            }
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load attendance data.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="attendance-dashboard">
            <TeacherNavbar />
            <div className="container" style={{ margin: '2rem auto' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2>Attendance</h2>
                            <p>Manage and monitor student attendance.</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/teacher/attendance/mark')}
                        >
                            Mark New Attendance
                        </button>
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    {loading ? (
                        <p>Loading data...</p>
                    ) : (
                        <>
                            {/* Today's Stats */}
                            {stats && stats.summary && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ padding: '1.5rem', background: '#e8f5e9', borderRadius: '8px', textAlign: 'center' }}>
                                        <h3 style={{ color: '#2e7d32', fontSize: '2rem', margin: '0' }}>{stats.summary.Present}</h3>
                                        <p style={{ color: '#2e7d32', margin: '0' }}>Present Today</p>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: '#_ffebee', borderRadius: '8px', textAlign: 'center', backgroundColor: '#ffebee' }}>
                                        <h3 style={{ color: '#c62828', fontSize: '2rem', margin: '0' }}>{stats.summary.Absent}</h3>
                                        <p style={{ color: '#c62828', margin: '0' }}>Absent Today</p>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: '#fff3e0', borderRadius: '8px', textAlign: 'center' }}>
                                        <h3 style={{ color: '#ef6c00', fontSize: '2rem', margin: '0' }}>{stats.summary.Late}</h3>
                                        <p style={{ color: '#ef6c00', margin: '0' }}>Late Today</p>
                                    </div>
                                </div>
                            )}

                            {/* Monitoring Chart */}
                            {stats && stats.trend && stats.trend.length > 0 && (
                                <div style={{ marginBottom: '3rem', height: '300px' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Weekly Attendance Trend</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={stats.trend}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="Present" stackId="a" fill="#4caf50" />
                                            <Bar dataKey="Absent" stackId="a" fill="#ef5350" />
                                            <Bar dataKey="Late" stackId="a" fill="#ff9800" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* History List */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h3 style={{ margin: 0 }}>History</h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <label htmlFor="monthFilter" style={{ fontSize: '0.9rem', color: '#666' }}>Filter by Month:</label>
                                        <input
                                            type="month"
                                            id="monthFilter"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            style={{
                                                padding: '0.5rem',
                                                border: '1px solid var(--border)',
                                                borderRadius: '4px',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                    {selectedMonth && (
                                        <button
                                            onClick={() => setSelectedMonth('')}
                                            className="btn"
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: '#f5f5f5',
                                                border: '1px solid #ddd',
                                                color: '#666',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                            {history.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                    <p>No records found.</p>
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '1rem' }}
                                        onClick={() => navigate('/teacher/attendance/mark')}
                                    >
                                        Start Marking
                                    </button>
                                </div>
                            ) : filteredHistory.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: '#f9f9f9', borderRadius: '8px' }}>
                                    <p>No records found for the selected month.</p>
                                    <button
                                        className="btn"
                                        style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                                        onClick={() => setSelectedMonth('')}
                                    >
                                        Clear Filter
                                    </button>
                                </div>
                            ) : (
                                <div className="history-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {filteredHistory.map((record, index) => (
                                        <div
                                            key={index}
                                            className="history-card"
                                            onClick={() => navigate(`/teacher/attendance/view/${record.date}`)}
                                            style={{
                                                padding: '1.5rem',
                                                background: '#f8f9fa',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: '1px solid var(--border)',
                                                transition: 'transform 0.2s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>
                                                {formatDate(record.date)}
                                            </h3>

                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                                {record.sessions.includes('Morning') && (
                                                    <span style={{
                                                        background: '#e3f2fd',
                                                        color: '#1976d2',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        Morning
                                                    </span>
                                                )}
                                                {record.sessions.includes('Afternoon') && (
                                                    <span style={{
                                                        background: '#fff3e0',
                                                        color: '#f57c00',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        Afternoon
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                                                    Records: {record.count}
                                                </span>
                                                <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '500' }}>
                                                    Details →
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceDashboard;

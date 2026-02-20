import React, { useState, useEffect } from 'react';
import TeacherNavbar from '../../../components/TeacherNavbar';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PerformanceDashboard = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await api.get('/exams');
            if (response.data.success) {
                setExams(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch exams', error);
        } finally {
            setLoading(false);
        }
    };

    // Prepare data for the chart (reverse to show chronological order left-to-right)
    const chartData = [...exams].reverse().map(exam => ({
        name: exam.name,
        average: exam.average ? parseFloat(exam.average.toFixed(1)) : 0
    }));

    return (
        <div className="performance-dashboard">
            <TeacherNavbar />
            <div className="container" style={{ margin: '2rem auto', maxWidth: '1200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2>Performance Management</h2>
                        <p>Manage exams and track student progress.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/teacher/performance/create-exam')}
                        >
                            + Create Exam
                        </button>
                    </div>
                </div>

                <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) minmax(300px, 1fr)', gap: '2rem' }}>
                    <div className="card">
                        <h3>Class Performance Trend</h3>
                        {chartData.length > 0 ? (
                            <div style={{ height: '300px', marginTop: '1rem' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="average" name="Average Marks" fill="#1976d2" barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p style={{ color: '#666', padding: '2rem', textAlign: 'center' }}>Not enough data for analytics.</p>
                        )}
                    </div>

                    <div className="card">
                        <h3>Recent Exams</h3>
                        <input
                            type="text"
                            placeholder="Search exams..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.6rem',
                                marginBottom: '1rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                        {loading ? (
                            <p>Loading exams...</p>
                        ) : exams.length === 0 ? (
                            <p style={{ color: '#666' }}>No exams created yet.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                                {exams.filter(exam => exam.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                    exams.filter(exam => exam.name.toLowerCase().includes(searchTerm.toLowerCase())).map(exam => (
                                        <div key={exam._id} style={{
                                            padding: '1rem',
                                            border: '1px solid #eee',
                                            borderRadius: '8px',
                                            background: '#f8f9fa'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <h4 style={{ margin: 0 }}>{exam.name}</h4>
                                                <span style={{
                                                    background: '#e3f2fd',
                                                    color: '#1976d2',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    Avg: {exam.average ? exam.average.toFixed(1) : '-'}
                                                </span>
                                            </div>
                                            <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.85rem' }}>
                                                {new Date(exam.date).toLocaleDateString()} • {exam.totalMarks} Marks
                                            </p>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => navigate(`/teacher/performance/exam/${exam._id}/marks`)}
                                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.9rem', cursor: 'pointer', border: '1px solid #1976d2', color: '#1976d2', background: 'white', borderRadius: '4px' }}
                                            >
                                                Enter Marks
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: '#666', textAlign: 'center' }}>No exams found matching "{searchTerm}"</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import TeacherNavbar from '../../../components/TeacherNavbar';

const EnterMarks = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({}); // { studentId: { marksObtained: 0, feedback: '' } }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, [examId]);

    const fetchData = async () => {
        try {
            const [examRes, studentsRes, resultsRes] = await Promise.all([
                api.get(`/exams/${examId}`),
                api.get('/students'),
                api.get(`/exams/${examId}/results`)
            ]);

            setExam(examRes.data.data);
            setStudents(studentsRes.data.data);

            // Initialize marks from existing results
            const existingMarks = {};
            resultsRes.data.data.forEach(result => {
                existingMarks[result.student._id] = {
                    marksObtained: result.marksObtained,
                    feedback: result.feedback || ''
                };
            });
            setMarks(existingMarks);

        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId, value) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                marksObtained: value
            }
        }));
    };

    const handleFeedbackChange = (studentId, value) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                feedback: value
            }
        }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const marksArray = Object.keys(marks).map(studentId => ({
                studentId,
                marksObtained: marks[studentId]?.marksObtained || 0,
                feedback: marks[studentId]?.feedback
            }));

            // Only send marks for students who have an entry
            const validMarks = marksArray.filter(m => m.marksObtained !== undefined && m.marksObtained !== null);

            await api.post(`/exams/${examId}/marks`, { marks: validMarks });
            navigate('/teacher/performance');
        } catch (err) {
            setError('Failed to save marks');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!exam) return <div>Exam not found</div>;

    return (
        <div className="enter-marks-page">
            <TeacherNavbar />
            <div className="container" style={{ margin: '2rem auto' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h2>Enter Marks for {exam.name}</h2>
                            <p>Total Marks: {exam.totalMarks}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => navigate('/teacher/performance')} className="btn">Cancel</button>
                            <button onClick={handleSubmit} className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Marks'}
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Admission No.</th>
                                    <th style={{ padding: '1rem' }}>Student Name</th>
                                    <th style={{ padding: '1rem' }}>Marks Obtained</th>
                                    <th style={{ padding: '1rem' }}>Feedback</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>{student.admissionNumber}</td>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>{student.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <input
                                                type="number"
                                                max={exam.totalMarks}
                                                min="0"
                                                value={marks[student._id]?.marksObtained || ''}
                                                onChange={(e) => handleMarkChange(student._id, parseInt(e.target.value))}
                                                style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <input
                                                type="text"
                                                value={marks[student._id]?.feedback || ''}
                                                onChange={(e) => handleFeedbackChange(student._id, e.target.value)}
                                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                                placeholder="Optional feedback"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnterMarks;

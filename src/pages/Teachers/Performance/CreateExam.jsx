import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import TeacherNavbar from '../../../components/TeacherNavbar';

const CreateExam = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({

        name: '',
        date: new Date().toISOString().split('T')[0],
        totalMarks: 100,
        description: '',
        hour: '09',
        minute: '00',
        period: 'AM'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const time = `${formData.hour}:${formData.minute} ${formData.period}`;
            await api.post('/exams', { ...formData, time });
            navigate('/teacher/performance');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create exam');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-exam-page">
            <TeacherNavbar />
            <div className="container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
                <div className="card">
                    <h2>Create New Exam</h2>
                    {error && <div className="error-banner">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Exam Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Midterm 1"
                            />
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Total Marks</label>
                            <input
                                type="number"
                                name="totalMarks"
                                value={formData.totalMarks}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Time</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    name="hour"
                                    value={formData.hour}
                                    onChange={handleChange}
                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const h = (i + 1).toString().padStart(2, '0');
                                        return <option key={h} value={h}>{h}</option>;
                                    })}
                                </select>
                                <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>:</span>
                                <select
                                    name="minute"
                                    value={formData.minute}
                                    onChange={handleChange}
                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    name="period"
                                    value={formData.period}
                                    onChange={handleChange}
                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => navigate('/teacher/performance')} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Exam'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateExam;

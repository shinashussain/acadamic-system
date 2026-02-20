import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userRole', 'admin');
                localStorage.setItem('admin', JSON.stringify(response.data.admin));
                navigate('/');
            }
        } catch (err) {
            console.error('Admin Login Error:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Admin Login</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary login-button"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="login-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button
                        className="btn-link"
                        onClick={() => navigate('/teacher-login')}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Login as Teacher instead
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

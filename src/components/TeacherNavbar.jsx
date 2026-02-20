import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './TeacherNavbar.css';

const TeacherNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('teacherInfo');
        navigate('/teacher-login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="teacher-navbar">
            <div className="container navbar-content">
                <Link to="/teacher-dashboard" className="navbar-brand">
                    Teacher Portal
                </Link>

                <div className="navbar-links">
                    <Link
                        to="/teacher-dashboard"
                        className={`nav-link ${isActive('/teacher-dashboard')}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/teacher/students"
                        className={`nav-link ${isActive('/teacher/students') || location.pathname.includes('/teacher/add-student') ? 'active' : ''}`}
                    >
                        Students
                    </Link>
                    <Link
                        to="/teacher/attendance"
                        className={`nav-link ${isActive('/teacher/attendance') || location.pathname.includes('/teacher/attendance') ? 'active' : ''}`}
                    >
                        Attendance
                    </Link>
                    <Link
                        to="/teacher/performance"
                        className={`nav-link ${isActive('/teacher/performance') ? 'active' : ''}`}
                    >
                        Performance
                    </Link>
                </div>

                <div className="user-nav">
                    <span className="user-name">Welcome, {teacherInfo.name}</span>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </div>
        </nav>
    );
};

export default TeacherNavbar;

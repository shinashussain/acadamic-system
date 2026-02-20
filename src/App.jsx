import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import TeacherManagement from './pages/Teachers/TeacherManagement';
import DepartmentManagement from './pages/Departments/DepartmentManagement';
import DepartmentDetail from './pages/Departments/DepartmentDetail';
import TeacherLogin from './pages/Teachers/TeacherLogin';
import TeacherDashboard from './pages/Teachers/TeacherDashboard';
import StudentManagement from './pages/Teachers/StudentManagement';
import AddStudent from './pages/Teachers/AddStudent';
import StudentDetail from './pages/Teachers/StudentDetail';
import AttendanceDashboard from './pages/Teachers/AttendanceDashboard';
import MarkAttendance from './pages/Teachers/MarkAttendance';
import AttendanceDetails from './pages/Teachers/AttendanceDetails';
import PerformanceDashboard from './pages/Teachers/Performance/PerformanceDashboard';
import CreateExam from './pages/Teachers/Performance/CreateExam';
import EnterMarks from './pages/Teachers/Performance/EnterMarks';
import StudentProgressReport from './pages/Parents/StudentProgressReport';
import AdminDashboard from './pages/Admin/AdminDashboard';
import './index.css';

// Simple ProtectedRoute component
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to={role === 'teacher' ? "/teacher-login" : "/login"} replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to={userRole === 'teacher' ? "/teacher-dashboard" : "/"} replace />;
  }

  return children;
};

const Dashboard = () => (
  <header style={{ padding: '2rem 0', borderBottom: '1px solid var(--border)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1>Academic System</h1>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/" className="btn" style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
        <Link to="/teachers" className="btn" style={{ textDecoration: 'none', color: 'inherit' }}>Teachers</Link>
        <Link to="/departments" className="btn" style={{ textDecoration: 'none', color: 'inherit' }}>Departments</Link>
        <button
          className="btn"
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
        >
          Logout
        </button>
      </div>
    </div>
  </header>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute role="teacher">
              <AttendanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance/mark"
          element={
            <ProtectedRoute role="teacher">
              <MarkAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance/view/:date"
          element={
            <ProtectedRoute role="teacher">
              <AttendanceDetails />
            </ProtectedRoute>
          }
        />

        {/* Performance Routes */}
        <Route
          path="/teacher/performance"
          element={
            <ProtectedRoute role="teacher">
              <PerformanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/performance/create-exam"
          element={
            <ProtectedRoute role="teacher">
              <CreateExam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/performance/exam/:examId/marks"
          element={
            <ProtectedRoute role="teacher">
              <EnterMarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute role="admin">
              <div className="container">
                <Dashboard />
                <TeacherManagement />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute role="admin">
              <div className="container">
                <Dashboard />
                <DepartmentManagement />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments/:id"
          element={
            <ProtectedRoute role="admin">
              <div className="container">
                <Dashboard />
                <DepartmentDetail />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/:id"
          element={
            <ProtectedRoute role="admin">
              <div className="container">
                <Dashboard />
                <StudentDetail isAdmin={true} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute role="teacher">
              <StudentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students/add"
          element={
            <ProtectedRoute role="teacher">
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students/:id"
          element={
            <ProtectedRoute role="teacher">
              <StudentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/add-student"
          element={
            <ProtectedRoute role="teacher">
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/student/:id"
          element={<StudentProgressReport />}
        />
      </Routes>
    </Router>
  );
}

export default App;

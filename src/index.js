import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Importer les modules nécessaires
import { CookiesProvider } from 'react-cookie'; // Importer CookiesProvider si nécessaire
import MainLayout from './components/Mainlayout/MainLayout';
import 'leaflet/dist/leaflet.css';
import StudentProfile from './components/Student/StudentDetail';
import VerifyEmail from './components/Verifyemail/VerifyEmail';
import ResetPasswordForm from './components/Resetpassword/ResetPasswordForm';
import NavbarSignup from './components/Navbarsignup/NavbarSignup';
import SignupPage from './components/Signuppage/SignupPage';
import LoginPage from './components/Loginpage/LoginPage';
import ForgotPasswordPage from './components/Forgotpasswordpage/ForgotPasswordPage';
import Dashboard from './components/Dashboard/Dashboard';
import AdminSignupPage from './components/Admin/Adminsignup/AdminSignupPage';
import StudentList from './components/Student/Student';
import TeacherList from './components/Teacher/Teacher';
import EducationLevel from './components/Educationlevel/EducationLevel';
import Classroom from './components/Classroom/Classroom';
import TimetableCalendar from './components/Timetable/Timetable';
import Subject from './components/Subject/Subject';
import MapWithRoute from './components/Transports/Transports';
import Course from './components/Course/Course';
import CourseFile from './components/Course/CourseFile';
import Grades from './components/Grades/Grades';
import TransportDetails from './components/Transports/TransportDetail';
import DriverList from './components/Drivers/DriverList';
import Transactions from './components/Transactions/Transactions';
import TeacherProfile from './components/Teacher/TeacherDetail';
import Earnings from './components/Transactions/Earnings';
import DriverProfile from './components/Drivers/DriverDetail';
import SecretKeyForm from './components/Parent/SecretKey';
import StudentInfo from './components/Student/StudentInfo';
import ParentList from './components/Parent/ParentList';
import TeacherLayout from './components/Mainlayout/TeacherLayout';
import TimetableTeacher from './components/Timetable/TimetableTeacher';
import CourseTeacher from './components/Course/CourseTeacher';
import AdminProfile from './components/Admin/AdminProfile';
import StudentsTable from './components/Grades/StudentTable';
import StudentGrade from './components/Grades/StudentGrade';
import TeacherProfileNavbar from './components/Teacher/TeacherProfileNavbar';
import TimetableStudent from './components/Timetable/TimetableStudent';
import StudentLayout from './components/Mainlayout/StudentLayout';
import StudentSubjects from './components/Course/CourseStudent';
import StudentCourseFiles from './components/Course/StudentCourseFile';
import StudentGradesTable from './components/Grades/StudentGradeTable';
import StudentGrades from './components/Grades/StudentGrades';
import StudentProfileNavbar from './components/Student/StudentProfileNavbar';
import SecretKeyPage from './components/Parent/SecretKeyPage';
import ParentLayout from './components/Mainlayout/ParentLayout';
import ParentTimetable from './components/Timetable/TimetableParent';
import ParentGradesTable from './components/Grades/ParentGradeTable';
import ParentGrades from './components/Grades/ParentGrades';
import ParentProfileNavbar from './components/Parent/ParentProfileNavbar';
import DriverLayout from './components/Mainlayout/DriverLayout';
import EducationLevelStudents from './components/Educationlevel/EducationLevelStudents';
import ChatPage from './components/Chat/Chat';
import RolesCards from './components/Chat/RolesCards';
import UsersPage from './components/Chat/UserPage';
import StudentBulletins from './components/Bulletin/StudentBulletins';
import BulletinHeader from './components/Bulletin/BulletinHeader';
import DriverProfileNavbar from './components/Drivers/DriverProfile';
import DriverTransports from './components/Transports/TransportCards';
import Notices from './components/Notices/Notices';
import NoticesByRole from './components/Notices/NoticesByRole';

function Router() {
    return (
        <CookiesProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route path="students" element={<StudentList />} /> {/* Page des étudiants */}
                        <Route path="dashboard" element={<Dashboard/>} /> 
                        <Route path="education-level" element={<EducationLevel/>}/>
                        <Route path="teachers" element={<TeacherList/>}/>
                        <Route path="classrooms" element = {<Classroom />}/>
                        <Route path="timetable" element = {<TimetableCalendar />}/>
                        <Route path="subjects" element = {<Subject />}/>
                        <Route path="parents" element = {<ParentList />}/>
                        <Route path="transports" element = {<MapWithRoute />}/>
                        <Route path="/transport/:id" element={<TransportDetails />} />
                        <Route path="courses" element = {<Course/>}/>
                        <Route path="courses/:courseId/files" element={<CourseFile />} /> {/* Route vers CourseFile */}
                        <Route path="grades" element = {<Grades/>}/>
                        <Route path="drivers" element = {<DriverList/>}/>
                        <Route path="expenses" element = {<Transactions/>}/>
                        <Route path="earnings" element = {<Earnings/>}/>
                        <Route path="/teacher/:id" element={<TeacherProfile />} />
                        <Route path="/student/:id" element={<StudentProfile />} />
                        <Route path="/admin/:id" element={<AdminProfile />} />
                        <Route path="/driver/:id" element={<DriverProfile />} />
                        <Route path="/education-level-students/:id" element={<EducationLevelStudents />} />
                        <Route path="/chat" element={< RolesCards/>} />
                        <Route path="/chat/:chatRoomId" element={<ChatPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/bulletins" element={<StudentBulletins />} />
                        <Route path="/bulletin/:studentId" element={<BulletinHeader />} />
                        <Route path="/notices" element={<Notices />} />

                    </Route>
                    <Route path="/" element={<TeacherLayout />}>
                        <Route path="timetable-teacher" element={<TimetableTeacher />} /> 
                        <Route path="courses-teacher" element={<CourseTeacher />} /> 
                        <Route path="grades-teacher" element={< StudentsTable/>} /> 
                        <Route path="student-grade/:id" element={< StudentGrade/>} /> 
                        <Route path="teacher-profile/:id" element={< TeacherProfileNavbar/>} /> 
                        <Route path="/chat-teacher" element={< RolesCards/>} />
                        <Route path="/users-teacher" element={<UsersPage />} />
                        <Route path="/chat-teacher/:chatRoomId" element={<ChatPage />} />
                        <Route path="/notices-user" element={<NoticesByRole />} />
                    </Route>

                    <Route path="/" element={<StudentLayout />}>
                        <Route path="student-timetable/" element={< TimetableStudent/>} /> 
                        <Route path="courses-student/" element={< StudentSubjects/>} /> 
                        <Route path="student-courses/:courseId/files" element={< StudentCourseFiles/>} /> {/* Route vers CourseFile */}
                        <Route path="grades-student/" element={< StudentGradesTable/>} /> {/* Route vers CourseFile */}
                        <Route path="/student-grades/:subjectId" element={<StudentGrades />} />
                        <Route path="/student-profile/:id" element={<StudentProfileNavbar />} />
                        <Route path="/chat-student" element={< RolesCards/>} />
                        <Route path="/users-student" element={<UsersPage />} />
                        <Route path="/chat-student/:chatRoomId" element={<ChatPage />} />
                        <Route path="/notices-student" element={<NoticesByRole />} />

                    </Route>

                    <Route path="/" element={<ParentLayout />}>
                        <Route path="/parent-timetable/:secret_key" element={<ParentTimetable />} />
                        <Route path="grades-parent/:secret_key" element={< ParentGradesTable />} /> 
                        <Route path="/parent-grades/:subjectId" element={<ParentGrades />} />
                        <Route path="/parent-profile/:id" element={<ParentProfileNavbar />} />
                        <Route path="/chat-parent" element={< RolesCards/>} />
                        <Route path="/users-parent" element={<UsersPage />} />
                        <Route path="/chat-parent/:chatRoomId" element={<ChatPage />} />
                        <Route path="/notices-parent" element={<NoticesByRole />} />

                    </Route>

                    <Route path="/" element={<DriverLayout />}>
                        <Route path="/transport-driver/:id" element={<TransportDetails />} />
                        <Route path="/driver-profile/:id" element={<DriverProfileNavbar />} />
                        <Route path="/chat-driver" element={< RolesCards/>} />
                        <Route path="/users-driver" element={<UsersPage />} />
                        <Route path="/chat-driver/:chatRoomId" element={<ChatPage />} />
                        <Route path="/notices-driver" element={<NoticesByRole />} />

                    </Route>
                    <Route path="/student-info" element={<StudentInfo />} />
                    <Route path="/enter-secret-key" element={<SecretKeyPage/>} />
                    <Route path="/register" element={<SignupPage/>} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/verify-email" element={<VerifyEmail/>} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
                    <Route path="/reset-password" element={<ResetPasswordForm/>} />
                    <Route path="/navbarsignup" element={<NavbarSignup/>} />
                    <Route path="/admin-signup-19-05-2002-91-58-18-13" element={<AdminSignupPage/>}/>
                    <Route path="/transport-driver" element={<DriverTransports/>} />

                </Routes>
            </BrowserRouter>
        </CookiesProvider>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Router />);

reportWebVitals();

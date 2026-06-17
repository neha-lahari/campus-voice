import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Signup';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Communities from './pages/Communities';
import CommunityDetails from './pages/CommunityDetails';
import CreateCommunity from "./pages/CreateCommunity";
import Profile from './pages/Profile';
import Messages from "./pages/Messages";
import AdminPanel from "./pages/AdminPanel";

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, minHeight: 'calc(100vh - 56px)' }}>
        {children}
      </main>
    </div>
  </>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={<PrivateRoute><AppLayout><AdminPanel /></AppLayout></PrivateRoute>} />
      <Route path="/home" element={<PrivateRoute><AppLayout><Home /></AppLayout></PrivateRoute>} />
      <Route path="/communities" element={<PrivateRoute><AppLayout><Communities /></AppLayout></PrivateRoute>} />
      <Route path="/create-community" element={<PrivateRoute><AppLayout><CreateCommunity /></AppLayout></PrivateRoute>} />
      <Route path="/community/:slug" element={<PrivateRoute><AppLayout><CommunityDetails /></AppLayout></PrivateRoute>} />

      {/* ✅ REMOVED /community/:id/notices — notices live inside CommunityDetails tab */}

      <Route path="/post/:id" element={<PrivateRoute><AppLayout><PostDetail /></AppLayout></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><AppLayout><Messages /></AppLayout></PrivateRoute>} />
      <Route path="/profile/:id" element={<Profile />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </SocketProvider>
    </AuthProvider>
  );
}
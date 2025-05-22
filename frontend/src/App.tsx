import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JoinRoom from "./pages/JoinRoom";
import CreateRoom from "./pages/CreateRoom";
import RoomPage from "./pages/RoomPage";
import Room from "./pages/Room";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ChatRoom from "./pages/ChatRoom";


const Profile = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.username}!</h1>
      <p>Email: {user?.email}</p>
      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.JSX.Element }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/rooms"
            element={
             <ProtectedRoute>
              <RoomPage />
             </ProtectedRoute>
            }
          />
          <Route
            path="/room/:room_id"
            element={
              <ProtectedRoute>
                <Room />
              </ProtectedRoute>
           }
          />
          <Route path="/room/:roomId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
          <Route
            path="/createroom"
            element={
              <ProtectedRoute>
                <CreateRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/joinroom"
            element={
              <ProtectedRoute>
                <JoinRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

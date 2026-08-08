import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Movies from "./pages/Movies";
import Explore from "./pages/Explore";
import Admin from "./pages/Admin";


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {

  const token = localStorage.getItem("orbitToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// =====================================================
// APP
// =====================================================

function App() {

  return (
    <BrowserRouter>

      {/* One global Navbar only */}
      <Navbar />

      <Routes>

        {/* ==========================================
            PUBLIC
        ========================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==========================================
            PROTECTED
        ========================================== */}

        <Route
          path="/movies"
          element={
            <ProtectedRoute>
              <Movies />
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          }
        />


        {/* ==========================================
            ADMIN
        ========================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
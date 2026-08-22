import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Landing from "./pages/Landing";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Movies from "./pages/Movies";
import Explore from "./pages/Explore";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {

  const token =
    localStorage.getItem(
      "orbitToken"
    );

  if (!token) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }

  return children;

}


// =====================================================
// APP
// =====================================================

function App() {

  return (

    <BrowserRouter>


      {/* =================================================
          GLOBAL NAVBAR
      ================================================= */}

      <Navbar />


      <Routes>


        {/* =================================================
            PUBLIC LANDING
        ================================================= */}

        <Route
          path="/"
          element={
            <Landing />
          }
        />


        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        {/* =================================================
            REGISTER
        ================================================= */}

        <Route
          path="/register"
          element={
            <Register />
          }
        />


        {/* =================================================
            WELCOME EXPERIENCE
        ================================================= */}

        <Route
          path="/welcome"
          element={

            <ProtectedRoute>

              <Welcome />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/home"
          element={
            <Home />
          }
        />


        {/* =================================================
            CHAT
        ================================================= */}

        <Route
          path="/chat"
          element={

            <ProtectedRoute>

              <Chat />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            MOVIES
        ================================================= */}

        <Route
          path="/movies"
          element={

            <ProtectedRoute>

              <Movies />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            EXPLORE
        ================================================= */}

        <Route
          path="/explore"
          element={

            <ProtectedRoute>

              <Explore />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            MY PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={

            <ProtectedRoute>

              <Profile />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            PUBLIC ORBIT ID PROFILE
        ================================================= */}

        <Route
          path="/profile/:orbitId"
          element={

            <ProtectedRoute>

              <Profile />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/admin"
          element={

            <ProtectedRoute>

              <Admin />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;
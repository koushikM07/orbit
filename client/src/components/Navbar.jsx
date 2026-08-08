import { Link, useNavigate } from "react-router-dom";

import {
  Globe,
  LogIn,
  UserPlus,
  LogOut,
  Film,
  Compass,
  Shield,
  User,
} from "lucide-react";

function Navbar() {

  const navigate = useNavigate();

  const token = localStorage.getItem("orbitToken");

  const storedUser = localStorage.getItem("orbitUser");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    user = null;
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem("orbitToken");
    localStorage.removeItem("orbitUser");

    navigate("/");

    window.location.reload();
  };


  return (

    <nav className="w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">


        {/* =================================================
            ORBIT LOGO
        ================================================= */}

        <Link
          to="/"
          className="flex items-center gap-3 hover:scale-105 transition-transform duration-300"
        >

          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">

            <Globe
              size={23}
              className="text-white"
            />

          </div>

          <span className="text-2xl font-bold text-white tracking-wide">
            Orbit
          </span>

        </Link>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="flex items-center gap-7">


          {/* HOME */}

          <Link
            to="/"
            className="text-slate-300 hover:text-orange-500 transition"
          >
            Home
          </Link>


          {/* =================================================
              LOGGED IN
          ================================================= */}

          {token && user ? (

            <>


              {/* MOVIES */}

              <Link
                to="/movies"
                className="flex items-center gap-2 text-slate-300 hover:text-orange-500 transition"
              >

                <Film size={18} />

                Movies

              </Link>


              {/* EXPLORE */}

              <Link
                to="/explore"
                className="flex items-center gap-2 text-slate-300 hover:text-orange-500 transition"
              >

                <Compass size={18} />

                Explore

              </Link>


              {/* PROFILE */}

              <Link
                to="/profile"
                className="flex items-center gap-2 text-slate-300 hover:text-orange-500 transition"
              >

                <User size={18} />

                Profile

              </Link>


              {/* ADMIN */}

              {user.role === "ADMIN" && (

                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition"
                >

                  <Shield size={18} />

                  Admin

                </Link>

              )}


              {/* USER GREETING */}

              <span className="text-slate-400">
                Hi, {user.name}
              </span>


              {/* LOGOUT */}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-300 hover:text-red-400 transition"
              >

                <LogOut size={18} />

                Logout

              </button>

            </>

          ) : (

            /* =================================================
               LOGGED OUT
            ================================================= */

            <>


              {/* LOGIN */}

              <Link
                to="/login"
                className="flex items-center gap-2 text-slate-300 hover:text-orange-500 transition"
              >

                <LogIn size={18} />

                Login

              </Link>


              {/* REGISTER */}

              <Link
                to="/register"
                className="flex items-center gap-2 text-slate-300 hover:text-orange-500 transition"
              >

                <UserPlus size={18} />

                Register

              </Link>

            </>

          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;
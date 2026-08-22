import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Globe,
  Menu,
  X,
  MessageCircle,
  Bell,
  Home as HomeIcon,
  Film,
  Compass,
  MessageSquare,
  User,
  Shield,
  Settings,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";

function Navbar() {

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const token =
    localStorage.getItem("orbitToken");

  const storedUser =
    localStorage.getItem("orbitUser");

  let user = null;

  try {

    user = storedUser
      ? JSON.parse(storedUser)
      : null;

  } catch {

    user = null;

  }


  // =====================================================
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {

        setMenuOpen(false);

      }

    };

    if (menuOpen) {

      document.addEventListener(
        "mousedown",
        handleClickOutside
      );

    }

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, [menuOpen]);


  // =====================================================
  // CLOSE MENU
  // =====================================================

  const closeMenu = () => {

    setMenuOpen(false);

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem("orbitToken");

    localStorage.removeItem("orbitUser");

    setMenuOpen(false);

    navigate("/");

    window.location.reload();

  };


  // =====================================================
  // PROFILE CLICK
  // =====================================================

  const handleProfile = () => {

    if (!token) {

      navigate("/login");

      return;

    }

    navigate("/profile");

  };


  return (

    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">

        <div className="flex items-center justify-between">


          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div
            ref={menuRef}
            className="relative flex items-center"
          >


            {/* =================================================
                HAMBURGER
            ================================================= */}

            <button

              onClick={() =>
                setMenuOpen(!menuOpen)
              }

              className="
                w-10
                h-10
                rounded-xl
                flex
                items-center
                justify-center
                text-slate-300
                hover:text-white
                hover:bg-slate-800
                transition
              "

              aria-label="Open Orbit menu"

            >

              {menuOpen ? (

                <X size={23} />

              ) : (

                <Menu size={23} />

              )}

            </button>


            {/* =================================================
                ORBIT LOGO
            ================================================= */}

            <Link
              to="/"
              onClick={closeMenu}
              className="
                ml-3
                flex
                items-center
                gap-2
                group
              "
            >

              <div
                className="
                  w-9
                  h-9
                  sm:w-10
                  sm:h-10
                  rounded-xl
                  bg-orange-500
                  flex
                  items-center
                  justify-center
                  shadow-lg
                  shadow-orange-500/20
                  group-hover:scale-105
                  transition-transform
                "
              >

                <Globe
                  size={22}
                  className="text-white"
                />

              </div>


              <span
                className="
                  text-xl
                  sm:text-2xl
                  font-bold
                  text-white
                  tracking-wide
                "
              >
                Orbit
              </span>

            </Link>


            {/* =================================================
                HAMBURGER MENU
            ================================================= */}

            {menuOpen && (

              <div
                className="
                  absolute
                  left-0
                  top-14
                  w-72
                  rounded-2xl
                  border
                  border-slate-800
                  bg-slate-950
                  shadow-2xl
                  shadow-black/40
                  overflow-hidden
                "
              >

                {/* =================================================
                    MENU HEADER
                ================================================= */}

                <div
                  className="
                    px-5
                    py-4
                    border-b
                    border-slate-800
                  "
                >

                  <div
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-slate-500
                    "
                  >
                    Orbit
                  </div>

                  <div
                    className="
                      mt-1
                      text-lg
                      font-semibold
                      text-white
                    "
                  >
                    Navigation
                  </div>

                </div>


                {/* =================================================
                    MAIN
                ================================================= */}

                <div className="p-3">


                  <div
                    className="
                      px-3
                      pt-1
                      pb-2
                      text-xs
                      uppercase
                      tracking-wider
                      text-slate-500
                    "
                  >
                    Main
                  </div>


                  {/* HOME */}

                  <Link
                    to="/"
                    onClick={closeMenu}
                    className="
                      flex
                      items-center
                      gap-3
                      px-3
                      py-3
                      rounded-xl
                      text-slate-300
                      hover:text-white
                      hover:bg-slate-800
                      transition
                    "
                  >

                    <HomeIcon size={19} />

                    <span>
                      Home
                    </span>

                  </Link>


                  {/* MOVIES */}

                  {token && user && (

                    <Link
                      to="/movies"
                      onClick={closeMenu}
                      className="
                        flex
                        items-center
                        gap-3
                        px-3
                        py-3
                        rounded-xl
                        text-slate-300
                        hover:text-white
                        hover:bg-slate-800
                        transition
                      "
                    >

                      <Film size={19} />

                      <span>
                        Movies
                      </span>

                    </Link>

                  )}


                  {/* EXPLORE */}

                  {token && user && (

                    <Link
                      to="/explore"
                      onClick={closeMenu}
                      className="
                        flex
                        items-center
                        gap-3
                        px-3
                        py-3
                        rounded-xl
                        text-slate-300
                        hover:text-white
                        hover:bg-slate-800
                        transition
                      "
                    >

                      <Compass size={19} />

                      <span>
                        Explore
                      </span>

                    </Link>

                  )}


                  {/* =================================================
                      COMMUNITY
                  ================================================= */}

                  {token && user && (

                    <>

                      <div
                        className="
                          px-3
                          pt-5
                          pb-2
                          text-xs
                          uppercase
                          tracking-wider
                          text-slate-500
                        "
                      >
                        Community
                      </div>


                      {/* DISCUSSIONS */}

                      <Link
                        to="/explore"
                        onClick={closeMenu}
                        className="
                          flex
                          items-center
                          gap-3
                          px-3
                          py-3
                          rounded-xl
                          text-slate-300
                          hover:text-white
                          hover:bg-slate-800
                          transition
                        "
                      >

                        <MessageSquare size={19} />

                        <span>
                          Discussions
                        </span>

                      </Link>


                      {/* CHAT */}

                      <Link
                        to="/chat"
                        onClick={closeMenu}
                        className="
                          flex
                          items-center
                          gap-3
                          px-3
                          py-3
                          rounded-xl
                          text-slate-300
                          hover:text-white
                          hover:bg-slate-800
                          transition
                        "
                      >

                        <MessageCircle size={19} />

                        <span>
                          Chat
                        </span>

                      </Link>

                    </>

                  )}


                  {/* =================================================
                      ACCOUNT
                  ================================================= */}

                  {token && user && (

                    <>

                      <div
                        className="
                          px-3
                          pt-5
                          pb-2
                          text-xs
                          uppercase
                          tracking-wider
                          text-slate-500
                        "
                      >
                        Account
                      </div>


                      {/* PROFILE */}

                      <Link
                        to="/profile"
                        onClick={closeMenu}
                        className="
                          flex
                          items-center
                          gap-3
                          px-3
                          py-3
                          rounded-xl
                          text-slate-300
                          hover:text-white
                          hover:bg-slate-800
                          transition
                        "
                      >

                        <User size={19} />

                        <span>
                          Profile
                        </span>

                      </Link>


                      {/* SETTINGS */}

                      <button
                        onClick={() => {

                          closeMenu();

                          // Settings page will be added later

                        }}
                        className="
                          w-full
                          flex
                          items-center
                          gap-3
                          px-3
                          py-3
                          rounded-xl
                          text-slate-500
                          hover:text-slate-300
                          hover:bg-slate-800
                          transition
                        "
                      >

                        <Settings size={19} />

                        <span>
                          Settings
                        </span>

                        <span
                          className="
                            ml-auto
                            text-[10px]
                            uppercase
                            text-slate-600
                          "
                        >
                          Soon
                        </span>

                      </button>

                    </>

                  )}


                  {/* =================================================
                      ADMIN
                  ================================================= */}

                  {token &&
                    user &&
                    user.role === "ADMIN" && (

                      <>

                        <div
                          className="
                            px-3
                            pt-5
                            pb-2
                            text-xs
                            uppercase
                            tracking-wider
                            text-slate-500
                          "
                        >
                          Administration
                        </div>


                        <Link
                          to="/admin"
                          onClick={closeMenu}
                          className="
                            flex
                            items-center
                            gap-3
                            px-3
                            py-3
                            rounded-xl
                            text-orange-400
                            hover:text-orange-300
                            hover:bg-slate-800
                            transition
                          "
                        >

                          <Shield size={19} />

                          <span>
                            Admin Panel
                          </span>

                        </Link>

                      </>

                    )}


                  {/* =================================================
                      LOGGED OUT
                  ================================================= */}

                  {!token && (

                    <>

                      <div
                        className="
                          px-3
                          pt-5
                          pb-2
                          text-xs
                          uppercase
                          tracking-wider
                          text-slate-500
                        "
                      >
                        Account
                      </div>


                      <Link
                        to="/login"
                        onClick={closeMenu}
                        className="
                          flex
                          items-center
                          gap-3
                          px-3
                          py-3
                          rounded-xl
                          text-slate-300
                          hover:text-white
                          hover:bg-slate-800
                          transition
                        "
                      >

                        <LogIn size={19} />

                        <span>
                          Login
                        </span>

                      </Link>


                      <Link
                        to="/register"
                        onClick={closeMenu}
                        className="
                          flex
                          items-center
                          gap-3
                          px-3
                          py-3
                          rounded-xl
                          text-slate-300
                          hover:text-white
                          hover:bg-slate-800
                          transition
                        "
                      >

                        <UserPlus size={19} />

                        <span>
                          Register
                        </span>

                      </Link>

                    </>

                  )}

                </div>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                {token && user && (

                  <div
                    className="
                      border-t
                      border-slate-800
                      p-3
                    "
                  >

                    <button
                      onClick={handleLogout}
                      className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-3
                        py-3
                        rounded-xl
                        text-slate-400
                        hover:text-red-400
                        hover:bg-slate-900
                        transition
                      "
                    >

                      <LogOut size={19} />

                      <span>
                        Logout
                      </span>

                    </button>

                  </div>

                )}

              </div>

            )}

          </div>


          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="flex items-center gap-2">


            {/* =================================================
                CHAT
            ================================================= */}

            {token && user && (

              <button
                onClick={() =>
                  navigate("/chat")
                }
                className="
                  relative
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-slate-300
                  hover:text-white
                  hover:bg-slate-800
                  transition
                "
                title="Chat"
              >

                <MessageCircle size={21} />

              </button>

            )}


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            {token && user && (

              <button
                className="
                  relative
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-slate-300
                  hover:text-white
                  hover:bg-slate-800
                  transition
                "
                title="Notifications"
              >

                <Bell size={21} />


                {/* Notification dot */}

                <span
                  className="
                    absolute
                    top-2
                    right-2
                    w-2
                    h-2
                    rounded-full
                    bg-orange-500
                  "
                />

              </button>

            )}


            {/* =================================================
                PROFILE
            ================================================= */}

            {token && user ? (

              <button
                onClick={handleProfile}
                className="
                  ml-1
                  w-10
                  h-10
                  rounded-full
                  overflow-hidden
                  border
                  border-slate-700
                  bg-slate-800
                  flex
                  items-center
                  justify-center
                  hover:border-orange-500
                  transition
                "
                title={user.name}
              >

                {user.avatarUrl ? (

                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />

                ) : (

                  <User
                    size={19}
                    className="text-slate-300"
                  />

                )}

              </button>

            ) : (

              <Link
                to="/login"
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-orange-500
                  text-white
                  text-sm
                  font-medium
                  hover:bg-orange-600
                  transition
                "
              >
                Login
              </Link>

            )}

          </div>

        </div>

      </div>

    </nav>

  );

}

export default Navbar;
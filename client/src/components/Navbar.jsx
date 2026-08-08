import { Link } from "react-router-dom";
import { Globe, LogIn, UserPlus } from "lucide-react";
import { Compass } from "lucide-react";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-slate-950 text-white border-b border-slate-800">

      <Link
  to="/"
  className="flex items-center gap-2 hover:scale-105 transition-transform duration-300"
>
  <Link
  to="/explore"
  className="hover:text-orange-500 transition flex items-center gap-2"
>
  <Compass size={18} />
  Explore
</Link>
  <Globe className="text-orange-500" size={30} />
  <h1 className="text-2xl font-bold tracking-wide">ORBIT</h1>
</Link>

      <div className="flex items-center gap-8">

        <Link className="hover:text-orange-500 transition" to="/">
          Home
        </Link>

        <Link className="hover:text-orange-500 transition" to="/login">
          <div className="flex items-center gap-2">
            <LogIn size={18} />
            Login
          </div>
        </Link>

        <Link className="hover:text-orange-500 transition" to="/register">
          <div className="flex items-center gap-2">
            <UserPlus size={18} />
            Register
          </div>
        </Link>
    
      </div>
    </nav>
  );
}

export default Navbar;
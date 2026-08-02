import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center px-4">

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 w-full max-w-md shadow-2xl">

        <h1 className="text-4xl font-bold text-white text-center">
          Welcome Back
        </h1>

        <p className="text-slate-400 text-center mt-3">
          Login to continue to Orbit
        </p>

        <div className="mt-8 space-y-6">

          <div className="relative">

            <Mail
              className="absolute left-4 top-4 text-slate-400"
              size={20}
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full bg-slate-800 text-white rounded-xl py-4 pl-12 pr-4 outline-none border border-slate-700 focus:border-orange-500"
            />

          </div>

          <div className="relative">

            <Lock
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition"
              size={20}
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-slate-800 text-white rounded-xl py-4 pl-12 pr-12 outline-none border border-slate-700 focus:border-orange-500"
            />

            <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition"
>
  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
</button>

          </div>

          <button
            className="w-full bg-orange-500 hover:bg-orange-600 py-4 rounded-xl text-white font-semibold transition"
          >
            Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setSuccess(false);
      setMessage("Please enter email and password.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setSuccess(false);
        setMessage(data.message || "Login failed.");
        return;
      }

      // ==========================================
      // SAVE JWT
      // ==========================================

      localStorage.setItem(
        "orbitToken",
        data.token
      );

      // ==========================================
      // SAVE USER
      // ==========================================

      localStorage.setItem(
        "orbitUser",
        JSON.stringify(data.user)
      );

      console.log("Login successful:", data.user);

      setSuccess(true);
      setMessage(data.message);

      // ==========================================
      // ROLE BASED REDIRECT
      // ==========================================

      if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (error) {

      console.error("LOGIN ERROR:", error);

      setSuccess(false);
      setMessage("Server is not responding.");

    }
  };


  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center px-4">

      <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-800">

        <h1 className="text-5xl font-bold text-white text-center">
          Welcome Back
        </h1>

        <p className="text-slate-400 text-center mt-4 mb-8">
          Login to your Orbit account
        </p>


        {/* MESSAGE */}

        {message && (
          <div
            className={`mb-5 px-4 py-3 rounded-xl text-center font-medium ${
              success
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {message}
          </div>
        )}


        {/* LOGIN FORM */}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full px-5 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
          />


          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full px-5 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
          />


          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 py-4 rounded-xl text-white font-semibold transition"
          >
            Login
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;
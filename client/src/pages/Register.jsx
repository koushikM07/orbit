function Register() {
  return (
    <div className="container">
      <h1>Create Account</h1>

      <form className="auth-form">
        <input type="text" placeholder="Full Name" />

        <input type="email" placeholder="Email" />

        <input type="password" placeholder="Password" />

        <button>Create Account</button>
      </form>
    </div>
  );
}

export default Register;
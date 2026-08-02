import { useState } from 'react'
import { Link } from "react-router-dom";
import "../App.css";

function App() {
  return (
    <div className="container">
      <h1>🌍 Orbit</h1>

      <p>Share your thoughts with the world.</p>

      <Link to="/login">
  <button>Login</button>
</Link>

<Link to="/register">
  <button>Register</button>
</Link>
      <hr />

      <h2>Latest Discussions</h2>

     <div className="topics">
  <div className="topic-card">🎬 Movies</div>
  <div className="topic-card">💻 Technology</div>
  <div className="topic-card">✈️ Travel</div>
  <div className="topic-card">🍕 Food</div>
</div>
    </div>
  );
}

export default App;
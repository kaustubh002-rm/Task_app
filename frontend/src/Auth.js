import { useState } from "react";
import API from "./api";
import "./App.css";

function Auth({ setIsAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    try {
      if (isLogin) {
        const res = await API.post("/login", form);
        localStorage.setItem("token", res.data.token);
        setIsAuth(true);
      } else {
        await API.post("/signup", form);
        alert("Signup successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data || "Error");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">

        <h2>{isLogin ? "Welcome Back 👋" : "Create Account 🚀"}</h2>
        <p className="subtitle">
          {isLogin ? "Login to continue" : "Signup to get started"}
        </p>

        <input
          name="email"
          placeholder="Enter Email"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Enter Password"
          onChange={handleChange}
        />

        <button onClick={submit}>
          {isLogin ? "Login" : "Signup"}
        </button>

        <p className="toggle" onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Don't have an account? Signup"
            : "Already have an account? Login"}
        </p>

      </div>
    </div>
  );
}

export default Auth;
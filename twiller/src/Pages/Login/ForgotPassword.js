import { useState } from "react";
import "./forgotPassword.css"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://twitterclone-1-uvwk.onrender.com/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "New password has been sent to your email");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        toast.error(`${data.message || "Something went wrong"}`);
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <img
          src="https://i.ibb.co/8Lxt6bjY/images-removebg-preview.png"
          alt="Logo"
          className="forgot-logo"
        />
        <h2 className="forgot-heading">Forgot your password?</h2>
        <p className="forgot-text">
          Enter your account email and we’ll send you a new password.  
          You can change it later in your settings.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="forgot-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="forgot-btn">Send new password</button>
        </form>
        <p className="forgot-footer" onClick={() => navigate("/login")}>
          Back to login
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

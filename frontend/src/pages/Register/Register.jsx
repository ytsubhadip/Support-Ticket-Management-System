import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import{UserPlus, Ticket, ArrowRight} from "lucide-react";
import api from "../../services/api";
import "./Register.css"

function Register(){
    
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name:"",
        email:"",
        password:"",
        role:"user"
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e)=>{
        setForm((prev)=>({
            ...prev,
            [e.target.name] : e.target.value,
        }));
    };

    const handleSubmit = async(e)=>{

        e.preventDefault();
        setError("");

        if(form.password.length < 8 || form.password.length> 128){
            setError("Password must be between 8 and 128 charracters.");
            return;
        }

        if (form.password != form.confirmPassword){
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try{
            await api.post("/auth/register",{
                name:  form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                role: form.role
            });

            navigate("/login",{
                replace: true,
                state:{
                    message:"Account create successfully. Please sign in"
                },
            });
        } catch (error){

            const detail = error.response?.data?.detail;

            setError(
                Array.isArray(detail)
                ? detail.map((item) => item.msg).join(",")
                :typeof detail === "string"
                ? detail    
                : "Registration failed. Please try again."
            );
        } finally{
            setLoading(false);
        }

    };  

    return(
        <div className="register-page">
      <div className="register-card">
        

        <div className="register-heading">
          <div className="heading-icon">
            <UserPlus size={24} />
          </div>

          <h1>Create your account</h1>
          <p>Join our support ticket management system.</p>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              minLength={2}
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="role">Register as</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="user">User</option>
              <option value="support_agent">Support Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Enter password again"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            className="register-button"
            type="submit"
            disabled={loading}
          >
            
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <ArrowRight size={18} />}

          </button>
        </form>

        <div className="register-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>


    );
}
export default Register;
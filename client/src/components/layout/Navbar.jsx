import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f43f5e)" }}>
            ✈
          </div>
          <span className="font-display font-semibold text-lg tracking-tight text-white">
            Trrip
          </span>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-night-300 hover:text-white transition-colors hidden sm:block">
                My Trips
              </Link>
              <Link to="/upload" className="btn-primary text-xs px-4 py-2">
                + New Trip
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: "linear-gradient(135deg, #f59e0b40, #f43f5e40)", border: "1px solid rgba(245,158,11,0.3)" }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="text-xs text-night-400 hover:text-white transition-colors hidden sm:block">
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-xs">Sign in</Link>
              <Link to="/register" className="btn-primary text-xs px-4 py-2">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

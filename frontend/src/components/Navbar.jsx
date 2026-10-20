import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Ticket,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  Users,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("access_token");
  const isLoggedIn = !!token;

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const role = user?.role || "user";

  const isAdmin = role === "admin";
  const isSupportAgent = role === "support_agent";

  /*
   * Role-based routes
   */
  const dashboardPath = isAdmin
    ? "/admin"
    : isSupportAgent
    ? "/support/dashboard"
    : "/dashboard";

  const ticketsPath = isAdmin
    ? "/admin/tickets"
    : isSupportAgent
    ? "/support/tickets"
    : "/tickets";

  const handleLogout = () => {
    setMenuOpen(false);

    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link
          to={dashboardPath}
          className="navbar-logo"
          onClick={closeMenu}
        >
          <div className="navbar-logo-icon">
            <Ticket size={21} />
          </div>

          <span>TicketFlow</span>
        </Link>

        {/* Desktop Navigation */}
        {isLoggedIn && (
          <nav className="navbar-links">

            {/* Dashboard */}
            <NavLink
              to={dashboardPath}
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              <LayoutDashboard size={18} />

              <span>Dashboard</span>
            </NavLink>

            {/* Admin: Manage Tickets */}
            {isAdmin && (
              <NavLink
                to="/admin/tickets"
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active" : ""}`
                }
              >
                <ClipboardList size={18} />

                <span>Manage Tickets</span>
              </NavLink>
            )}

            {/* Admin: Manage Users */}
            {isAdmin && (
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active" : ""}`
                }
              >
                <Users size={18} />

                <span>Manage Users</span>
              </NavLink>
            )}

            {/* Support Agent / Normal User: Tickets */}
            {!isAdmin && (
              <NavLink
                to={ticketsPath}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active" : ""}`
                }
              >
                <Ticket size={18} />

                <span>
                  {isSupportAgent
                    ? "My Tickets"
                    : "Tickets"}
                </span>
              </NavLink>
            )}

            {/* Profile - not for admin */}
            {!isAdmin && (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active" : ""}`
                }
              >
                <User size={18} />

                <span>Profile</span>
              </NavLink>
            )}

          </nav>
        )}

        {/* Right Side */}
        <div className="navbar-right">

          {isLoggedIn ? (
            <>
              {/* Optional user name */}
              <div className="navbar-user-info">
                <span className="navbar-user-name">
                  {user?.name || "User"}
                </span>

                <span className="navbar-user-role">
                  {isAdmin
                    ? "Admin"
                    : isSupportAgent
                    ? "Support Agent"
                    : "User"}
                </span>
              </div>

              {/* Logout */}
              <button
                className="navbar-logout"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={18} />

                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              className="navbar-login"
              onClick={() => navigate("/login")}
            >
              <LogIn size={18} />

              <span>Login</span>
            </button>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar-menu-button"
          onClick={() =>
            setMenuOpen((previous) => !previous)
          }
          aria-label="Toggle navigation"
        >
          {menuOpen ? (
            <X size={23} />
          ) : (
            <Menu size={23} />
          )}
        </button>

      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="mobile-navbar">

          {isLoggedIn ? (
            <>

              {/* Dashboard */}
              <NavLink
                to={dashboardPath}
                className="mobile-navbar-link"
                onClick={closeMenu}
              >
                <LayoutDashboard size={18} />

                Dashboard
              </NavLink>

              {/* Admin */}
              {isAdmin && (
                <>
                  <NavLink
                    to="/admin/tickets"
                    className="mobile-navbar-link"
                    onClick={closeMenu}
                  >
                    <ClipboardList size={18} />

                    Manage Tickets
                  </NavLink>

                  <NavLink
                    to="/admin/users"
                    className="mobile-navbar-link"
                    onClick={closeMenu}
                  >
                    <Users size={18} />

                    Manage Users
                  </NavLink>
                </>
              )}

              {/* Agent / User Tickets */}
              {!isAdmin && (
                <NavLink
                  to={ticketsPath}
                  className="mobile-navbar-link"
                  onClick={closeMenu}
                >
                  <Ticket size={18} />

                  {isSupportAgent
                    ? "My Tickets"
                    : "Tickets"}
                </NavLink>
              )}

              {/* Profile */}
              {!isAdmin && (
                <NavLink
                  to="/profile"
                  className="mobile-navbar-link"
                  onClick={closeMenu}
                >
                  <User size={18} />

                  Profile
                </NavLink>
              )}

              {/* Logout */}
              <button
                className="mobile-logout"
                onClick={handleLogout}
              >
                <LogOut size={18} />

                Logout
              </button>

            </>
          ) : (
            <button
              className="mobile-login"
              onClick={() => {
                closeMenu();
                navigate("/login");
              }}
            >
              <LogIn size={18} />

              Login
            </button>
          )}

        </div>
      )}

    </header>
  );
}

export default Navbar;
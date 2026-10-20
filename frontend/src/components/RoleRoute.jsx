  import { Navigate, Outlet } from "react-router-dom";

  function RoleRoute({ allowedRoles }) {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    // Not logged in
    if (!token) {
      return <Navigate to="/login" replace />;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      return <Navigate to="/login" replace />;
    }

    // User does not have the required role
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
  }

  export default RoleRoute;
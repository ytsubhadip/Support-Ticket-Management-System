import { Navigate, Outlet } from "react-router-dom";

function SupportAgentRoute() {
  const token = localStorage.getItem("access_token");
  const storedUser = localStorage.getItem("user");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    user = null;
  }

  if (user?.role !== "support_agent") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default SupportAgentRoute;
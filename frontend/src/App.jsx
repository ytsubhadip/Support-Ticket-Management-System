import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login/Login"
import ProtectRoute from "./components/ProtectRoute"
import Register from "./pages/Register/Register"
import Tickets from "./pages/Tickets/Tickets"
import Navbar from "./components/Navbar"
import Profile from "./pages/Profile/Profile"
import PublicRoute from "./components/PublicRoute"
import AdminTickets from "./pages/Admin/AdminTickets"
import RoleRoute from "./components/RoleRoute"
import AdminUsers from "./pages/Admin/AdminUsers"
import AdminDashboard from "./pages/Admin/AdminDashboard"
import SupportAgentRoute from "./components/SupportAgentRoute"

import SupportAgentTickets from "./pages/Support/SupportAgentTickets"
import SupportAgentDashboard from "./pages/Support/SupportAgentDashboard"


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>


        <Route element={<ProtectRoute />}>
          <Route path="/dashboard" element={
            <>
              <Navbar />
              <Tickets />
            </>
          } />
          <Route path="/profile" element={
            <>
              <Navbar />
              <Profile />
            </>
          } />
        </Route>

        <Route element={<RoleRoute allowedRoles={["admin"]} />}>


          <Route
            path="/admin"
            element={
              <>
                <Navbar />
                <AdminDashboard />
              </>
            }
          />

          <Route
            path="/admin/tickets"
            element={
              <>
                <Navbar />
                <AdminTickets />
              </>
            }
          />

          <Route
            path="/admin/users"
            element={
              <>
                <Navbar />
                <AdminUsers />

              </>

            }
          />
        </Route>

        <Route element={<SupportAgentRoute />}>
          
            <Route
              path="/support/dashboard"
              element={
              <>
              <Navbar/>
              <SupportAgentDashboard />
              </>
              }
            />

            <Route
              path="/support/tickets"
              element={
                <>
                <Navbar/>
                <SupportAgentTickets />
                </>
              
            
            }
            />

        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default App;
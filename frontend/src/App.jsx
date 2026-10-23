import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login/Login"
import Register from "./pages/Register/Register"

import ProtectRoute from "./components/ProtectRoute"
import PublicRoute from "./components/PublicRoute"
import RoleRoute from "./components/RoleRoute"
import SupportAgentRoute from "./components/SupportAgentRoute"

import Navbar from "./components/Navbar"

import Tickets from "./pages/Tickets/Tickets"
import TicketDetails from "./pages/Tickets/TicketDetails"

import Profile from "./pages/Profile/Profile"

import AdminTickets from "./pages/Admin/AdminTickets"
import AdminUsers from "./pages/Admin/AdminUsers"
import AdminDashboard from "./pages/Admin/AdminDashboard"

import SupportAgentTickets from "./pages/Support/SupportAgentTickets"
import SupportAgentDashboard from "./pages/Support/SupportAgentDashboard"


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================== */}

        <Route element={<PublicRoute />}>
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />
        </Route>


        {/* =========================
            PROTECTED USER ROUTES
        ========================== */}

        <Route element={<ProtectRoute />}>

          <Route
            path="/dashboard"
            element={
              <>
                <Navbar />
                <Tickets />
              </>
            }
          />

          <Route
            path="/tickets/:ticketId"
            element={
              <>
                <Navbar />
                <TicketDetails />
              </>
            }
          />

          <Route
            path="/profile"
            element={
              <>
                <Navbar />
                <Profile />
              </>
            }
          />

        </Route>


        {/* =========================
            ADMIN ROUTES
        ========================== */}

        <Route
          element={
            <RoleRoute allowedRoles={["admin"]} />
          }
        >

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


        {/* =========================
            SUPPORT AGENT ROUTES
        ========================== */}

        <Route element={<SupportAgentRoute />}>

          <Route
            path="/support/dashboard"
            element={
              <>
                <Navbar />
                <SupportAgentDashboard />
              </>
            }
          />

          <Route
            path="/support/tickets"
            element={
              <>
                <Navbar />
                <SupportAgentTickets />
              </>
            }
          />

          <Route
            path="/support/tickets/:ticketId"
            element={
              <>
                <Navbar />
                <TicketDetails />
              </>
            }
          />

        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default App
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tickets/");

      if (Array.isArray(response.data)) {
        setTickets(response.data);
      } else if (Array.isArray(response.data.items)) {
        setTickets(response.data.items);
      } else if (Array.isArray(response.data.tickets)) {
        setTickets(response.data.tickets);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error("Failed to load tickets:", error);

      alert(
        error.response?.data?.detail ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Convert status to a consistent format
  const getStatus = (ticket) => {
    return String(ticket.status || "")
      .trim()
      .toLowerCase();
  };

  const completedTasks = tickets.filter(
    (ticket) => getStatus(ticket) === "closed"
  ).length;

  const pendingTasks = tickets.filter((ticket) => {
    const status = getStatus(ticket);

    return (
      status === "open" ||
      status === "in progress" ||
      status === "pending"
    );
  }).length;

  const totalTasks = tickets.length;

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          <RefreshCw
            size={22}
            className="admin-dashboard-spinner"
          />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">

      {/* Header */}
      <div className="admin-dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Overview of your support tickets and tasks.
          </p>
        </div>

        <button
          className="admin-dashboard-refresh"
          onClick={loadTickets}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Task Summary */}
      <div className="admin-task-cards">

        {/* Total */}
        <div className="admin-task-card">

          <div className="admin-task-icon total">
            <ClipboardList size={24} />
          </div>

          <div>
            <span>Total Tasks</span>
            <strong>{totalTasks}</strong>
          </div>

        </div>

        {/* Pending */}
        <div className="admin-task-card">

          <div className="admin-task-icon pending">
            <Clock3 size={24} />
          </div>

          <div>
            <span>Pending Tasks</span>
            <strong>{pendingTasks}</strong>
          </div>

        </div>

        {/* Completed */}
        <div className="admin-task-card">

          <div className="admin-task-icon completed">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <span>Completed Tasks</span>
            <strong>{completedTasks}</strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;
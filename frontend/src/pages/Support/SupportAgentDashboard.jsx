import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock3,
  LoaderCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";
import "./SupportAgentDashboard.css";

function SupportAgentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tickets/assigned");

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
      console.error("Failed to load assigned tickets:", error);

      alert(
        error.response?.data?.detail ||
          "Failed to load assigned tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const getStatus = (ticket) => {
    return String(ticket.status || "")
      .trim()
      .toLowerCase();
  };

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => getStatus(ticket) === "open"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => getStatus(ticket) === "in progress"
  ).length;

  const completedTickets = tickets.filter(
    (ticket) => getStatus(ticket) === "closed"
  ).length;

  if (loading) {
    return (
      <div className="support-dashboard-page">
        <div className="support-dashboard-loading">
          <RefreshCw
            size={22}
            className="support-dashboard-spinner"
          />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="support-dashboard-page">

      {/* Header */}
      <div className="support-dashboard-header">
        <div>
          <h1>Support Agent Dashboard</h1>

          <p>
            Overview of your assigned support tickets.
          </p>
        </div>

        <button
          className="support-dashboard-refresh"
          onClick={loadTickets}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="support-task-cards">

        {/* Total */}
        <div className="support-task-card">
          <div className="support-task-icon total">
            <ClipboardList size={24} />
          </div>

          <div>
            <span>Total Assigned</span>
            <strong>{totalTickets}</strong>
          </div>
        </div>

        {/* Open */}
        <div className="support-task-card">
          <div className="support-task-icon open">
            <Clock3 size={24} />
          </div>

          <div>
            <span>Open</span>
            <strong>{openTickets}</strong>
          </div>
        </div>

        {/* In Progress */}
        <div className="support-task-card">
          <div className="support-task-icon progress">
            <LoaderCircle size={24} />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{inProgressTickets}</strong>
          </div>
        </div>

        {/* Completed */}
        <div className="support-task-card">
          <div className="support-task-icon completed">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedTickets}</strong>
          </div>
        </div>

      </div>

    </div>
  );
}

export default SupportAgentDashboard;
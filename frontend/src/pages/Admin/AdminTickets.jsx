import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminTickets.css";

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("");

  // =========================
  // Load all tickets
  // =========================

  const loadTickets = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tickets/");

      const data = response.data;

      if (Array.isArray(data)) {
        setTickets(data);
      } else if (Array.isArray(data.items)) {
        setTickets(data.items);
      } else if (Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      } else {
        setTickets([]);
      }

    } catch (error) {
      console.error("Failed to load tickets:", error);

      alert(
        error.response?.data?.detail ||
        "Failed to load tickets"
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================
  // Load support agents
  // =========================

  const loadAgents = async () => {
    try {
      setAgentsLoading(true);

      const response = await api.get(
        "/users/support-agents"
      );

      setAgents(response.data);

    } catch (error) {
      console.error("Failed to load agents:", error);

      alert(
        error.response?.data?.detail ||
        "Failed to load support agents"
      );
    } finally {
      setAgentsLoading(false);
    }
  };


  // =========================
  // Initial load
  // =========================

  useEffect(() => {
    loadTickets();
    loadAgents();
  }, []);


  // =========================
  // Open assign modal
  // =========================

  const handleOpenAssign = (ticket) => {
    setSelectedTicket(ticket);

    // If ticket already has an agent,
    // pre-select that agent.
    setSelectedAgent(
      ticket.assigned_to || ""
    );
  };


  // =========================
  // Assign agent
  // =========================

  const handleAssignAgent = async () => {
    if (!selectedTicket) {
      return;
    }

    if (!selectedAgent) {
      alert("Please select a support agent");
      return;
    }

    try {
      await api.patch(
        `/tickets/${selectedTicket.id}/assign/${selectedAgent}`
      );

      alert("Support agent assigned successfully");

      // Close modal
      setSelectedTicket(null);
      setSelectedAgent("");

      // Reload tickets
      await loadTickets();

    } catch (error) {
      console.error(
        "Failed to assign agent:",
        error
      );

      alert(
        error.response?.data?.detail ||
        "Failed to assign support agent"
      );
    }
  };


  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="admin-page">
        <h1>Manage Tickets</h1>
        <p>Loading tickets...</p>
      </div>
    );
  }


  return (
    <div className="admin-page">

      <div className="admin-page-header">

        <div>
          <h1>Manage Tickets</h1>

          <p>
            View tickets and assign support agents.
          </p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={loadTickets}
        >
          ↻ Refresh
        </button>

      </div>


      {/* =========================
          Tickets Table
      ========================= */}

      <div className="admin-table-container">

        <table className="admin-ticket-table">

          <thead>
            <tr>
              <th>Ticket</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned Agent</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {tickets.length === 0 ? (

              <tr>
                <td
                  colSpan="6"
                  className="empty-table"
                >
                  No tickets found.
                </td>
              </tr>

            ) : (

              tickets.map((ticket) => (

                <tr key={ticket.id}>

                  <td>
                    <div className="admin-ticket-title">
                      {ticket.title}
                    </div>

                    <small>
                      {String(ticket.id).slice(0, 8)}
                    </small>
                  </td>


                  <td>
                    {ticket.category || "-"}
                  </td>


                  <td>
                    <span
                      className={`priority-badge priority-${String(
                        ticket.priority || ""
                      ).toLowerCase()}`}
                    >
                      {ticket.priority || "-"}
                    </span>
                  </td>


                  <td>
                    <span className="status-badge">
                      {ticket.status || "-"}
                    </span>
                  </td>


                  <td>
                    {ticket.assigned_to ? (
                      <span className="assigned-agent">
                        Assigned
                      </span>
                    ) : (
                      <span className="not-assigned">
                        Not Assigned
                      </span>
                    )}
                  </td>


                  <td>

                    <button
                      className="assign-button"
                      onClick={() =>
                        handleOpenAssign(ticket)
                      }
                    >
                      {ticket.assigned_to
                        ? "Change Agent"
                        : "Assign Agent"}
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      {/* =========================
          Assign Agent Modal
      ========================= */}

      {selectedTicket && (

        <div className="admin-modal-overlay">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>
                <h2>
                  {selectedTicket.assigned_to
                    ? "Change Support Agent"
                    : "Assign Support Agent"}
                </h2>

                <p>
                  Ticket:{" "}
                  <strong>
                    {selectedTicket.title}
                  </strong>
                </p>
              </div>


              <button
                className="admin-modal-close"
                onClick={() => {
                  setSelectedTicket(null);
                  setSelectedAgent("");
                }}
              >
                ×
              </button>

            </div>


            <div className="admin-form-group">

              <label>
                Support Agent
              </label>

              <select
                value={selectedAgent}
                onChange={(e) =>
                  setSelectedAgent(e.target.value)
                }
                disabled={agentsLoading}
              >

                <option value="">
                  {agentsLoading
                    ? "Loading agents..."
                    : "Select support agent"}
                </option>

                {agents.map((agent) => (

                  <option
                    key={agent.id}
                    value={agent.id}
                  >
                    {agent.name} - {agent.email}
                  </option>

                ))}

              </select>

            </div>


            <div className="admin-modal-actions">

              <button
                className="admin-cancel-button"
                onClick={() => {
                  setSelectedTicket(null);
                  setSelectedAgent("");
                }}
              >
                Cancel
              </button>


              <button
                className="admin-assign-button"
                onClick={handleAssignAgent}
                disabled={!selectedAgent}
              >
                {selectedTicket.assigned_to
                  ? "Change Agent"
                  : "Assign Agent"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminTickets;
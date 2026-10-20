import { useEffect, useState } from "react";
import {
  RefreshCw,
  Eye,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";
import "./SupportAgentTickets.css";

function SupportAgentTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

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
      console.error(
        "Failed to load assigned tickets:",
        error
      );

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

  const getStatusClass = (status) => {
    const value = String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    return `agent-status agent-status-${value}`;
  };

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedStatus(ticket.status || "Open");
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setSelectedStatus("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket) {
      return;
    }

    if (!selectedStatus) {
      alert("Please select a status");
      return;
    }

    if (
      String(selectedTicket.status).toLowerCase() ===
        "closed" &&
      selectedStatus !== "Closed"
    ) {
      alert("Closed tickets cannot be reopened");
      return;
    }

    try {
      await api.patch(
        `/tickets/${selectedTicket.id}/status`,
        {
          status: selectedStatus,
        }
      );

      alert("Ticket status updated successfully");

      handleCloseModal();

      await loadTickets();
    } catch (error) {
      console.error(
        "Failed to update ticket status:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to update ticket status"
      );
    }
  };

  if (loading) {
    return (
      <div className="support-tickets-page">
        <div className="support-tickets-loading">
          <RefreshCw
            size={22}
            className="support-tickets-spinner"
          />

          <span>
            Loading assigned tickets...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="support-tickets-page">

      {/* Header */}
      <div className="support-tickets-header">

        <div>
          <h1>My Assigned Tickets</h1>

          <p>
            Tickets currently assigned to you.
          </p>
        </div>

        <button
          className="support-tickets-refresh"
          onClick={loadTickets}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* Tickets */}
      <div className="support-tickets-container">

        <table className="support-tickets-table">

          <thead>
            <tr>
              <th>Ticket</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {tickets.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="support-empty-table"
                >
                  <div className="support-empty-content">
                    <CheckCircle2 size={35} />

                    <strong>
                      No tickets assigned
                    </strong>

                    <span>
                      You currently have no tickets
                      assigned to you.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id}>

                  {/* Ticket */}
                  <td>
                    <div className="support-ticket-title">
                      {ticket.title}
                    </div>

                    <small>
                      {String(ticket.id).slice(0, 8)}
                    </small>
                  </td>

                  {/* Category */}
                  <td>
                    {ticket.category || "-"}
                  </td>

                  {/* Priority */}
                  <td>
                    <span
                      className={`agent-priority agent-priority-${String(
                        ticket.priority || ""
                      ).toLowerCase()}`}
                    >
                      {ticket.priority || "-"}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={getStatusClass(
                        ticket.status
                      )}
                    >
                      {ticket.status || "-"}
                    </span>
                  </td>

                  {/* Action */}
                  <td>
                    <button
                      className="support-view-button"
                      onClick={() =>
                        handleOpenTicket(ticket)
                      }
                    >
                      <Eye size={16} />
                      Update Status
                    </button>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

      {/* Modal */}
      {selectedTicket && (
        <div className="support-modal-overlay">

          <div className="support-modal">

            {/* Header */}
            <div className="support-modal-header">

              <div>
                <h2>
                  Update Ticket
                </h2>

                <p>
                  {selectedTicket.title}
                </p>
              </div>

              <button
                className="support-modal-close"
                onClick={handleCloseModal}
              >
                ×
              </button>

            </div>

            {/* Ticket information */}
            <div className="support-ticket-info">

              <div>
                <span>Category</span>
                <strong>
                  {selectedTicket.category || "-"}
                </strong>
              </div>

              <div>
                <span>Priority</span>
                <strong>
                  {selectedTicket.priority || "-"}
                </strong>
              </div>

              <div>
                <span>Current Status</span>
                <strong>
                  {selectedTicket.status || "-"}
                </strong>
              </div>

            </div>

            {/* Status */}
            <div className="support-form-group">

              <label>
                Ticket Status
              </label>

              <select
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value
                  )
                }
                disabled={
                  String(
                    selectedTicket.status
                  ).toLowerCase() === "closed"
                }
              >
                <option value="Open">
                  Open
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Closed">
                  Closed
                </option>
              </select>

              {String(
                selectedTicket.status
              ).toLowerCase() === "closed" && (
                <small className="support-closed-message">
                  Closed tickets cannot be reopened.
                </small>
              )}

            </div>

            {/* Actions */}
            <div className="support-modal-actions">

              <button
                className="support-cancel-button"
                onClick={handleCloseModal}
              >
                Cancel
              </button>

              <button
                className="support-update-button"
                onClick={handleUpdateStatus}
                disabled={
                  String(
                    selectedTicket.status
                  ).toLowerCase() === "closed" ||
                  selectedStatus ===
                    selectedTicket.status
                }
              >
                <Clock3 size={16} />

                Update Status
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default SupportAgentTickets;
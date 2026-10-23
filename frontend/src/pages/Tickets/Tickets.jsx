
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Ticket, Trash2, RefreshCw } from "lucide-react";
import api from "../../services/api";
import "./Tickets.css";

const initialForm = {
  title: "",
  description: "",
  category: "Technical",
  priority: "Medium",
};

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingTicket, setEditingTicket] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "Technical",
    priority: "Medium",
  });

  const loadTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/tickets/");
      const data = response.data;

      // Supports either a list response or a paginated response.
      const rows = Array.isArray(data)
        ? data
        : data.items ?? data.tickets ?? [];

      setTickets(rows);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Could not load tickets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditClick = (ticket) => {
    setEditingTicket(ticket);

    setEditForm({
      title: ticket.title || "",
      description: ticket.description || "",
      category: ticket.category || "Technical",
      priority: ticket.priority || "Medium"
    });
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setCreating(true);

    try {
      await api.post("/tickets/", {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
      });

      setForm(initialForm);
      setShowForm(false);
      setMessage("Ticket created successfully.");
      await loadTickets();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Could not create ticket. Please check your details."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();

    if (!editingTicket) return;

    try {
      await api.patch(
        `/tickets/${editingTicket.id}`,
        editForm
      );

      alert("Ticket update successfully");
      setEditingTicket(null);

      // reload tickts
      loadTickets();
    } catch (error) {
      console.error("Update ticket error:", error);

      alert(
        error.response?.data?.detail ||
        "Failed to update ticket"
      );

    }




  }


  const handleDelete = async (ticketId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/tickets/${ticketId}`);

      setTickets((previous) =>
        previous.filter((ticket) => ticket.id !== ticketId)
      );

      setMessage("Ticket deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Could not delete ticket. Check your permissions."
      );
    }
  };

  const statusClass = (status = "") =>
    status.toLowerCase().replaceAll(" ", "-");

  return (
    <div className="tickets-page">
      <header className="tickets-header">
        <div>
          <h1>My Tickets</h1>
          <p>Create and manage your support requests.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setError("");
            setMessage("");
            setShowForm((previous) => !previous);
          }}
        >
          <Plus size={18} />
          {showForm ? "Cancel" : "Create Ticket"}
        </button>
      </header>

      {error && (
        <div className="ticket-alert error-alert" role="alert">
          {typeof error === "string" ? error : "Something went wrong."}
        </div>
      )}

      {message && (
        <div className="ticket-alert success-alert" role="status">
          {message}
        </div>
      )}

      {showForm && (
        <section className="ticket-form-card">
          <h2>Create a Support Ticket</h2>

          <form onSubmit={handleCreate}>
            <div className="ticket-field">
              <label htmlFor="title">Ticket title</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Briefly describe your issue"
                minLength={3}
                maxLength={200}
                required
              />
            </div>

            <div className="ticket-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Explain the issue in detail..."
                rows={5}
                required
              />
            </div>

            <div className="ticket-form-row">
              <div className="ticket-field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="Technical">Technical</option>
                  <option value="Billing">Billing</option>
                  <option value="Account">Account</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="ticket-field">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={creating}
            >
              {creating ? "Creating..." : "Submit Ticket"}
            </button>
          </form>
        </section>
      )}

      <section className="ticket-list-section">
        <div className="ticket-list-heading">
          <div>
            <h2>All My Tickets</h2>
            <p>{tickets.length} ticket(s)</p>
          </div>

          <button
            className="refresh-button"
            onClick={loadTickets}
            disabled={loading}
            aria-label="Refresh tickets"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="ticket-empty">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="ticket-empty">
            <Ticket size={38} />
            <h3>No tickets yet</h3>
            <p>Create a ticket when you need help from support.</p>
          </div>
        ) : (
          <div className="ticket-table-wrapper">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="ticket-title-link"
                      >
                        <strong>{ticket.title}</strong>
                      </Link>

                      <span className="ticket-id">
                        {String(ticket.id).slice(0, 8)}
                      </span>
                    </td>

                    <td>{ticket.category}</td>

                    <td>
                      <span
                        className={`priority-badge ${String(
                          ticket.priority
                        ).toLowerCase()}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${statusClass(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td>
                      {ticket.created_at
                        ? new Date(ticket.created_at).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <div className="ticket-actions">

                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="ticket-chat-button"
                          title="Open conversation"
                        >
                          💬
                        </Link>

                        <button
                          className="ticket-edit-button"
                          onClick={() => handleEditClick(ticket)}
                          title="Edit ticket"
                        >
                          ✏️
                        </button>

                        <button
                          className="ticket-delete-button"
                          onClick={() => handleDelete(ticket.id)}
                          title="Delete ticket"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editingTicket && (
          <div className="edit-modal-overlay">

            <div className="edit-modal">

              <div className="edit-modal-header">
                <div>
                  <h2>Edit Ticket</h2>
                  <p>Update your ticket details.</p>
                </div>

                <button
                  className="edit-modal-close"
                  onClick={() => setEditingTicket(null)}
                >
                  ×
                </button>
              </div>


              <form onSubmit={handleUpdateTicket}>

                {/* Title */}

                <div className="form-group">

                  <label htmlFor="edit-title">
                    Title
                  </label>

                  <input
                    id="edit-title"
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    required
                  />

                </div>


                {/* Description */}

                <div className="form-group">

                  <label htmlFor="edit-description">
                    Description
                  </label>

                  <textarea
                    id="edit-description"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows="5"
                    required
                  />

                </div>


                {/* Category */}

                <div className="form-group">

                  <label htmlFor="edit-category">
                    Category
                  </label>

                  <select
                    id="edit-category"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                  >
                    <option value="Technical">
                      Technical
                    </option>

                    <option value="Billing">
                      Billing
                    </option>

                    <option value="Account">
                      Account
                    </option>

                    <option value="General">
                      General
                    </option>
                  </select>

                </div>


                {/* Priority */}

                <div className="form-group">

                  <label htmlFor="edit-priority">
                    Priority
                  </label>

                  <select
                    id="edit-priority"
                    name="priority"
                    value={editForm.priority}
                    onChange={handleEditChange}
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Critical">
                      Critical
                    </option>

                  </select>

                </div>


                {/* Buttons */}

                <div className="edit-modal-actions">

                  <button
                    type="button"
                    className="edit-cancel-button"
                    onClick={() => setEditingTicket(null)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="edit-save-button"
                  >
                    Save Changes
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}
      </section>
    </div>
  );
}

export default Tickets;

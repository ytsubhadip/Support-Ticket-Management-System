import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Send,
    Paperclip,
    X,
    Download,
} from "lucide-react";

import api from "../../services/api";
import "./TicketDetails.css";

function TicketDetails() {
    const { ticketId } = useParams();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [attachments, setAttachments] = useState([]);

    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [error, setError] = useState("");

    // -----------------------------------------
    // Load messages
    // -----------------------------------------

    const loadMessages = async () => {
        setError("");

        try {
            const response = await api.get(
                `/tickets/${ticketId}/messages`
            );

            setMessages(response.data);
        } catch (err) {
            console.error(
                "Failed to load messages:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Could not load conversation."
            );
        }
    };

    // -----------------------------------------
    // Load attachments
    // -----------------------------------------

    const loadAttachments = async () => {
        try {
            const response = await api.get(
                `/tickets/${ticketId}/attachments`
            );

            setAttachments(response.data);
        } catch (err) {
            console.error(
                "Failed to load attachments:",
                err
            );
        }
    };

    // -----------------------------------------
    // Load conversation
    // -----------------------------------------

    const loadConversation = async () => {
        setLoading(true);
        setError("");

        try {
            await Promise.all([
                loadMessages(),
                loadAttachments(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConversation();
    }, [ticketId]);

    // -----------------------------------------
    // Select file
    // -----------------------------------------

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setSelectedFile(file);
    };

    // -----------------------------------------
    // Remove selected file
    // -----------------------------------------

    const removeSelectedFile = () => {
        setSelectedFile(null);

        const input = document.getElementById(
            "ticket-attachment"
        );

        if (input) {
            input.value = "";
        }
    };

    // -----------------------------------------
    // Upload attachment
    // -----------------------------------------

    const uploadAttachment = async (file) => {
        if (!file) {
            return null;
        }

        const formData = new FormData();

        formData.append("file", file);

        const response = await api.post(
            `/tickets/${ticketId}/attachments`,
            formData
        );

        return response.data;
    };
    // -----------------------------------------
    // Send message
    // -----------------------------------------

    const handleSendMessage = async (e) => {
        e.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage && !selectedFile) {
            return;
        }

        setSending(true);
        setError("");

        try {
            // 1. Send message if there is one
            if (trimmedMessage) {
                const messageResponse = await api.post(
                    `/tickets/${ticketId}/messages`,
                    {
                        message: trimmedMessage,
                    }
                );

                setMessages((previous) => [
                    ...previous,
                    messageResponse.data,
                ]);
            }

            // 2. Upload attachment if selected
            if (selectedFile) {
                await uploadAttachment(selectedFile);

                await loadAttachments();
            }

            // 3. Clear form
            setMessage("");
            setSelectedFile(null);

            const input = document.getElementById(
                "ticket-attachment"
            );

            if (input) {
                input.value = "";
            }

        } catch (error) {
            console.error(
                "Failed to send message:",
                error.response?.data || error
            );

            const detail = error.response?.data?.detail;

            if (typeof detail === "string") {
                setError(detail);
            } else if (Array.isArray(detail)) {
                setError(
                    detail
                        .map((item) => item.msg || "Validation error")
                        .join(", ")
                );
            } else {
                setError(
                    "Failed to send message or upload attachment."
                );
            }

        } finally {
            setSending(false);
        }
    };

    // -----------------------------------------
    // Download attachment
    // -----------------------------------------

    const handleDownloadAttachment = async (attachment) => {
        try {
            const response = await api.get(
                `/tickets/${ticketId}/attachments/${attachment.id}`,
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob(
                [response.data],
                { type: attachment.mime_type }
            );

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = attachment.filename;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error(
                "Failed to download attachment:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to download attachment"
            );
        }
    };

    // -----------------------------------------
    // Back navigation
    // -----------------------------------------

    const handleBack = () => {
        try {
            const storedUser =
                localStorage.getItem("user");

            const user = storedUser
                ? JSON.parse(storedUser)
                : null;

            if (
                user?.role ===
                "support_agent"
            ) {
                navigate("/support/tickets");
                return;
            }

            if (
                user?.role ===
                "admin"
            ) {
                navigate("/admin");
                return;
            }

            navigate("/dashboard");
        } catch (error) {
            console.error(
                "Failed to determine user role:",
                error
            );

            navigate("/dashboard");
        }
    };

    return (
        <div className="ticket-details-page">

            {/* -------------------------------- */}
            {/* Header */}
            {/* -------------------------------- */}

            <div className="ticket-details-header">

                <button
                    type="button"
                    onClick={handleBack}
                    className="back-to-tickets"
                >
                    <ArrowLeft size={18} />
                    Back to Tickets
                </button>

                <h1>
                    Ticket Conversation
                </h1>

                <p>
                    Ticket ID:{" "}
                    {String(ticketId).slice(0, 8)}
                </p>

            </div>


            {/* -------------------------------- */}
            {/* Error */}
            {/* -------------------------------- */}

            {error && (
                <div className="ticket-alert error-alert">
                    {error}
                </div>
            )}


            {/* -------------------------------- */}
            {/* Conversation */}
            {/* -------------------------------- */}

            <section className="conversation-card">

                <div className="conversation-header">

                    <h2>
                        Conversation
                    </h2>

                    <button
                        type="button"
                        onClick={loadConversation}
                        disabled={loading}
                        className="conversation-refresh-button"
                    >
                        Refresh
                    </button>

                </div>


                {/* -------------------------------- */}
                {/* Messages */}
                {/* -------------------------------- */}

                <div className="conversation-messages">

                    {loading ? (
                        <p className="conversation-empty">
                            Loading conversation...
                        </p>
                    ) : messages.length === 0 ? (
                        <p className="conversation-empty">
                            No messages yet.
                        </p>
                    ) : (
                        messages.map((item) => (
                            <div
                                key={item.id}
                                className="conversation-message"
                            >

                                <div className="message-meta">

                                    <strong>
                                        {item.sender_role}
                                    </strong>

                                    <span>
                                        {new Date(
                                            item.created_at
                                        ).toLocaleString()}
                                    </span>

                                </div>

                                <div className="message-content">
                                    {item.message}
                                </div>

                            </div>
                        ))
                    )}

                </div>


                {/* -------------------------------- */}
                {/* Attachments */}
                {/* -------------------------------- */}

                {attachments.length > 0 && (
                    <div className="ticket-attachments">

                        <div className="ticket-attachments-header">
                            <h3>Attachments</h3>
                        </div>

                        {attachments.length === 0 ? (
                            <p className="no-attachments">
                                No attachments yet.
                            </p>
                        ) : (
                            <div className="attachment-list">

                                {attachments.map((attachment) => (
                                    <div
                                        key={attachment.id}
                                        className="attachment-item"
                                    >

                                        <div className="attachment-info">
                                            <strong>
                                                {attachment.filename}
                                            </strong>

                                            <span>
                                                {Math.round(
                                                    attachment.file_size / 1024
                                                )} KB
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadAttachment(attachment)}
                                        >
                                            Download
                                        </button>

                                    </div>
                                ))}

                            </div>
                        )}

                    </div>
                )}


                {/* -------------------------------- */}
                {/* Message form */}
                {/* -------------------------------- */}

                <form
                    className="message-form"
                    onSubmit={
                        handleSendMessage
                    }
                >

                    <textarea
                        value={message}
                        onChange={(event) =>
                            setMessage(
                                event.target.value
                            )
                        }
                        placeholder="Write a message..."
                        rows={4}
                        disabled={
                            sending ||
                            uploading
                        }
                    />


                    {/* -------------------------------- */}
                    {/* Selected file */}
                    {/* -------------------------------- */}

                    {selectedFile && (
                        <div className="selected-file">

                            <div className="selected-file-info">

                                <Paperclip
                                    size={17}
                                />

                                <span>
                                    {
                                        selectedFile.name
                                    }
                                </span>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    removeSelectedFile
                                }
                                title="Remove file"
                                disabled={
                                    sending ||
                                    uploading
                                }
                            >
                                <X size={16} />
                            </button>

                        </div>
                    )}


                    {/* -------------------------------- */}
                    {/* Form actions */}
                    {/* -------------------------------- */}

                    <div className="message-form-actions">

                        <label
                            htmlFor="ticket-attachment"
                            className="attach-file-button"
                        >
                            <Paperclip
                                size={17}
                            />

                            Attach File
                        </label>

                        <input
                            id="ticket-attachment"
                            type="file"
                            hidden
                            onChange={
                                handleFileChange
                            }
                            disabled={
                                sending ||
                                uploading
                            }
                        />


                        <button
                            type="submit"
                            disabled={
                                sending ||
                                uploading ||
                                (
                                    !message.trim() &&
                                    !selectedFile
                                )
                            }
                            className="send-message-button"
                        >
                            <Send
                                size={17}
                            />

                            {uploading
                                ? "Uploading..."
                                : sending
                                    ? "Sending..."
                                    : "Send"}
                        </button>

                    </div>

                </form>

            </section>

        </div>
    );
}

export default TicketDetails;
import { useEffect, useState } from "react";
import { User, Mail, Shield, Edit3, Save, X } from "lucide-react";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

      setForm({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
    });

    setEditing(false);
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name: form.name,
      email: form.email,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    setUser(updatedUser);
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          User information not found.
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className="profile-container">

        {/* Header */}
        <div className="profile-header">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account information.</p>
          </div>

          {!editing && (
            <button
              className="profile-edit-button"
              onClick={handleEdit}
            >
              <Edit3 size={18} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="profile-card">

          {/* Avatar */}
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <h2>{user.name}</h2>
              <span className="profile-role">
                {user.role}
              </span>
            </div>
          </div>

          {/* Account Information */}
          <div className="profile-section">

            <h3>Account Information</h3>

            <div className="profile-fields">

              {/* Name */}
              <div className="profile-field">

                <label>
                  <User size={17} />
                  Name
                </label>

                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{user.name}</p>
                )}

              </div>

              {/* Email */}
              <div className="profile-field">

                <label>
                  <Mail size={17} />
                  Email
                </label>

                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{user.email}</p>
                )}

              </div>

              {/* Role */}
              <div className="profile-field">

                <label>
                  <Shield size={17} />
                  Role
                </label>

                <p className="role-value">
                  {user.role}
                </p>

              </div>

            </div>

          </div>

          {/* Edit Buttons */}
          {editing && (
            <div className="profile-actions">

              <button
                className="profile-cancel"
                onClick={handleCancel}
              >
                <X size={17} />
                Cancel
              </button>

              <button
                className="profile-save"
                onClick={handleSave}
              >
                <Save size={17} />
                Save Changes
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Profile;
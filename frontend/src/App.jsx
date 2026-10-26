import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";
import "./App.css";

const API = "https://event-admin-panel-i4ya.onrender.com/api/events"; 

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  const loadEvents = async () => {
    try {
      const response = await axios.get(API);
      setEvents(response.data);
    } catch {
      alert("Could not load events. Check whether the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);
      setEvents((previous) => previous.filter((event) => event._id !== id));
    } catch {
      alert("Could not delete the event.");
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingCount = events.filter(
    (event) => new Date(event.eventDate) >= today
  ).length;

  const totalRegistrations = events.reduce(
    (sum, event) => sum + (Number(event.totalRegistrations) || 0),
    0
  );

  const filteredEvents = events.filter((event) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      (event.eventName || "").toLowerCase().includes(search) ||
      (event.venue || "").toLowerCase().includes(search);

    const eventDate = new Date(event.eventDate);
    eventDate.setHours(0, 0, 0, 0);

    const isUpcoming = eventDate >= today;

    const matchesFilter =
      eventFilter === "all" ||
      (eventFilter === "upcoming" && isUpcoming) ||
      (eventFilter === "past" && !isUpcoming);

    return matchesSearch && matchesFilter;
  });

  return (
    <main className="container">
      <section className="welcome-banner">
        <div>
          <p className="eyebrow">EVENT MANAGEMENT WORKSPACE</p>
          <h1>Your events, all in one place.</h1>
          <p>
            Plan events, track registrations, and keep everything organised.
          </p>
        </div>
        <div className="banner-icon" aria-hidden="true">
          ✦
        </div>
      </section>

      <div className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h2>Dashboard</h2>
          <p className="subtitle">Here is your event activity at a glance.</p>
        </div>
        <Link className="primary-btn" to="/add">
          + Create Event
        </Link>
      </div>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-top">
            <span>Total Events</span>
            <span className="stat-icon purple">✦</span>
          </div>
          <h2>{events.length}</h2>
          <p>Events in your workspace</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Total Registrations</span>
            <span className="stat-icon green">↗</span>
          </div>
          <h2>{totalRegistrations}</h2>
          <p>Registrations across all events</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Upcoming Events</span>
            <span className="stat-icon orange">◷</span>
          </div>
          <h2>{upcomingCount}</h2>
          <p>Events scheduled for today or later</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Event Directory</h2>
            <p className="subtitle">
              Browse and manage your event schedule.
            </p>
          </div>
          <span className="count-badge">
            {filteredEvents.length} shown
          </span>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search by event name or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search events by name or venue"
            />
          </div>

          <select
            className="filter-select"
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            aria-label="Filter events"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading your events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <h3>
              {events.length === 0
                ? "Your event space is ready!"
                : "No matching events"}
            </h3>
            <p>
              {events.length === 0
                ? "Create your first event to get started."
                : "Try another search term or change the filter."}
            </p>
            {events.length === 0 && (
              <Link className="primary-btn" to="/add">
                Create Your First Event
              </Link>
            )}
            {events.length > 0 && (
              <button
                className="cancel-btn"
                onClick={() => {
                  setSearchTerm("");
                  setEventFilter("all");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>EVENT</th>
                  <th>EVENT ID</th>
                  <th>DATE</th>
                  <th>VENUE</th>
                  <th>REGISTRATIONS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const date = new Date(event.eventDate);
                  const isUpcoming = date >= today;

                  return (
                    <tr key={event._id}>
                      <td>
                        <div className="event-title-cell">
                          <span className="event-avatar">
                            {(event.eventName || "E")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                          <div className="event-title-content">
                            <strong>{event.eventName}</strong>
                            <small>
                              {event.eventDescription || "No description"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="id-cell">
                          {event._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="date-cell">
                          <strong>{date.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}</strong>
                          <span className={`status-badge ${isUpcoming ? "upcoming" : "past"}`}>
                            {isUpcoming ? "Upcoming" : "Past"}
                          </span>
                        </div>
                      </td>
                      <td>{event.venue}</td>
                      <td>
                        <span className="registration-badge">
                          {event.totalRegistrations || 0}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <Link
                            className="edit-btn"
                            to={`/edit/${event._id}`}
                          >
                            Edit
                          </Link>
                          <button
                            className="delete-btn"
                            onClick={() => deleteEvent(event._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [form, setForm] = useState({
    eventName: "",
    eventDescription: "",
    eventDate: "",
    venue: "",
  });

  const [saving, setSaving] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(editing);

  useEffect(() => {
    if (!editing) return;

    const loadEvent = async () => {
      try {
        const response = await axios.get(API);
        const event = response.data.find((item) => item._id === id);

        if (!event) {
          alert("Event not found.");
          navigate("/");
          return;
        }

        setForm({
          eventName: event.eventName || "",
          eventDescription: event.eventDescription || "",
          eventDate: new Date(event.eventDate).toISOString().slice(0, 10),
          venue: event.venue || "",
        });
      } catch {
        alert("Could not load event details. Check your backend.");
      } finally {
        setLoadingEvent(false);
      }
    };

    loadEvent();
  }, [id, editing, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editing) {
        await axios.put(`${API}/${id}`, form);
        alert("Event updated successfully!");
      } else {
        await axios.post(API, form);
        alert("Event created successfully!");
      }

      navigate("/");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Could not save the event. Check your backend."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingEvent) {
    return (
      <main className="container form-container">
        <p>Loading event details...</p>
      </main>
    );
  }

  return (
    <main className="container form-container">
      <Link className="back-link" to="/">
        ← Back to Dashboard
      </Link>

      <section className="form-panel">
        <p className="eyebrow">{editing ? "EDIT EVENT" : "EVENT CREATION"}</p>
        <h1>{editing ? "Update your event" : "Create something memorable."}</h1>
        <p className="subtitle">
          {editing
            ? "Make changes to the details below."
            : "Add the details to bring your next event to life."}
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Event Name
            <input
              name="eventName"
              value={form.eventName}
              onChange={handleChange}
              placeholder="e.g. Annual Tech Summit"
              maxLength={100}
              required
            />
          </label>

          <label>
            Event Description
            <textarea
              name="eventDescription"
              value={form.eventDescription}
              onChange={handleChange}
              placeholder="What is this event about?"
              rows="4"
              maxLength={1000}
              required
            />
          </label>

          <div className="form-row">
            <label>
              Event Date
              <input
                type="date"
                name="eventDate"
                value={form.eventDate}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Venue
              <input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="e.g. Main Auditorium"
                maxLength={150}
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
            <button className="primary-btn" type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editing
                  ? "Save Changes"
                  : "Create Event"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function AppLayout() {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="brand">
          <span className="brand-icon">E</span>
          Event<span>Hub</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/add" className="nav-add">
            + Add Event
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<EventForm />} />
        <Route path="/edit/:id" element={<EventForm />} />
      </Routes>

      <footer>EventHub Admin Panel · Thoughtfully organised events</footer>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
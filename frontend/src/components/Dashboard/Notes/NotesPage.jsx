import React, { useState, useEffect } from "react";
import axios from "axios";
import "./NotesPage.css";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaLightbulb, FaTags } from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;
const userId = localStorage.getItem("userId") || "user01";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");

  // Unique categories for demonstration
  const categories = [
    { key: "all", label: "All" },
    { key: "work", label: "Work" },
    { key: "personal", label: "Personal" },
    { key: "ideas", label: "Ideas" },
    { key: "todo", label: "To-Do" },
  ];

  // Unique: Note Insights (word count, note count)
  const totalNotes = notes.length;
  const totalWords = notes.reduce((sum, note) => sum + note.content.split(/\s+/).length, 0);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notes/${userId}`);
      setNotes(response.data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      if (editingNote) {
        await axios.put(`${BACKEND_URL}/api/notes/${editingNote.id}`, {
          userId,
          title,
          content,
        });
      } else {
        await axios.post(`${BACKEND_URL}/api/notes`, {
          userId,
          title,
          content,
        });
      }

      setTitle("");
      setContent("");
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingNote(note);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/notes/${id}`);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const filteredNotes = notes.filter((note) =>
    (category === "all" || note.category === category) &&
    (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="notes-page-container">
      {/* Unique Navigation Bar */}
      <div className="notes-nav-bar">
        <button className="back-btn" onClick={() => navigate("/dashboard")}> <FaArrowLeft /> Dashboard </button>
        <h2>📝 Notes Center</h2>
        <div className="notes-nav-actions">
          <span className="notes-insight"><FaLightbulb /> {totalNotes} Notes, {totalWords} Words</span>
        </div>
      </div>

      {/* Unique: Category Filter */}
      <div className="notes-categories">
        <FaTags className="category-icon" />
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`category-btn${category === cat.key ? " active" : ""}`}
            onClick={() => setCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="notes-header">
        <h2>📝 My Notes</h2>
        <input
          type="text"
          className="search-input"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="note-editor">
        <input
          type="text"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Write your note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={handleSave}>
          {editingNote ? "Update Note" : "Add Note"}
        </button>
      </div>

      <div className="notes-list">
        {filteredNotes.map((note) => (
          <div key={note.id} className="note-card">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <div className="note-actions">
              <button onClick={() => handleEdit(note)}>✏️ Edit</button>
              <button onClick={() => handleDelete(note.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
        {filteredNotes.length === 0 && <p className="no-notes">No notes found.</p>}
      </div>
    </div>
  );
};

export default NotesPage;

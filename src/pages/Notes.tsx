import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { FiArrowLeft, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { LuPin, LuPinOff } from "react-icons/lu";
import "../css/checklist.css";
import "../css/notes.css";
import Header from "../components/Header";
import { notePreview, noteTitle, useNotes } from "../hooks/LOCAL/useNotes";
import { useShortcuts } from "../hooks/LOCAL/useShortcuts";
import { timeAgo } from "../lib/dates";
import type { Note } from "../lib/types";

// /notes = list, /notes/:id = editor (one route, so the notes state stays put between them)
export default function Notes() {
  const id = useParams()["*"]?.split("/")[0] || undefined;
  const navigate = useNavigate();
  // notes left empty disappear once you leave them
  const notes = useNotes(id);
  const [query, setQuery] = useState("");
  const [deleted, setDeleted] = useState<Note | null>(null);

  const open = id ? notes.notes.find((n) => n.id === id) : undefined;

  // the "Undo" bar goes away after a while
  useEffect(() => {
    if (!deleted) return;
    const timer = setTimeout(() => setDeleted(null), 6000);
    return () => clearTimeout(timer);
  }, [deleted]);

  const newNote = () => {
    navigate(`/notes/${notes.create()}`);
  };

  const remove = (note: Note) => {
    notes.remove(note.id);
    if (note.text.trim()) setDeleted(note);
    if (id) navigate("/notes");
  };

  useShortcuts({ n: newNote });
  // Esc closes the editor even while typing
  useShortcuts(
    {
      escape: () => {
        if (!id) return false;
        navigate("/notes");
      },
    },
    { inInputs: true },
  );

  const undoBar = deleted && (
    <div className="notes-undo" role="status">
      <span>Note deleted</span>
      <button
        type="button"
        className="page-button"
        onClick={() => {
          notes.restore(deleted);
          setDeleted(null);
        }}
      >
        Undo
      </button>
    </div>
  );

  // ---------- editor ----------
  if (id) {
    if (!open)
      return (
        <div className="page-container page-center">
          <h1 className="page-title">Note not found</h1>
          <p className="page-text">It may have been deleted.</p>
          <Link to="/notes" className="page-button">
            Back to notes
          </Link>
        </div>
      );

    return (
      <div className="page-container notes-editor">
        <div className="notes-toolbar">
          <Link to="/notes" className="page-button page-button-icon" title="Back (Esc)">
            <FiArrowLeft /> Notes
          </Link>
          <span className="notes-saved">Saved · edited {timeAgo(open.updatedAt)}</span>
          <button
            type="button"
            className={`page-button page-button-icon ${open.pinned ? "is-active" : ""}`}
            onClick={() => notes.togglePin(open.id)}
            title={open.pinned ? "Unpin" : "Pin to top"}
            aria-pressed={open.pinned}
          >
            {open.pinned ? <LuPinOff /> : <LuPin />}
          </button>
          <button
            type="button"
            className="page-button page-button-icon check-danger"
            onClick={() => remove(open)}
            title="Delete note"
          >
            <FiTrash2 />
          </button>
        </div>

        <textarea
          className="notes-text"
          value={open.text}
          onChange={(e) => notes.write(open.id, e.target.value)}
          placeholder={"Title\nWrite anything…"}
          aria-label="Note"
          autoFocus
        />
        <p className="notes-hint">
          First line is the title · {open.text.trim() ? open.text.trim().split(/\s+/).length : 0} words
        </p>
      </div>
    );
  }

  // ---------- list ----------
  const q = query.trim().toLowerCase();
  const shown = q ? notes.notes.filter((n) => n.text.toLowerCase().includes(q)) : notes.notes;
  const count = notes.notes.length;

  return (
    <div className="page-container">
      <Header title="Notes" subtitle={count ? `${count} note${count === 1 ? "" : "s"}` : "No notes yet"}>
        <button type="button" className="check-submit notes-new" onClick={newNote} title="New note (N)">
          <FiPlus />
          <span>New</span>
        </button>
      </Header>

      {count > 0 && (
        <label className="notes-search">
          <FiSearch aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            aria-label="Search notes"
          />
        </label>
      )}

      {undoBar}

      {count === 0 ? (
        <p className="check-empty page-text notes-empty">
          Quick notes for things that aren't a checklist: an idea, a phone number, a recipe. Press{" "}
          <kbd>N</kbd> or tap New.
        </p>
      ) : shown.length === 0 ? (
        <p className="check-empty page-text notes-empty">No notes match "{query}".</p>
      ) : (
        <ul className="notes-grid">
          {shown.map((note) => (
            <li key={note.id}>
              <Link to={`/notes/${note.id}`} className="notes-card">
                <span className="notes-card-title">
                  {note.pinned && <LuPin className="notes-pin" aria-label="Pinned" />}
                  {noteTitle(note)}
                </span>
                {notePreview(note) && <span className="notes-card-text">{notePreview(note)}</span>}
                <span className="notes-card-date">{timeAgo(note.updatedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import Header from "../components/Header";

const SHORTCUTS = [
  ["N", "Focus the input"],
  ["Enter", "Add / save item"],
  ["Esc", "Cancel editing"],
  ["Ctrl+Z", "Undo"],
  ["Ctrl+Shift+Z / Ctrl+Y", "Redo"],
  ["Ctrl+J", "Toggle dark theme"],
];

export default function Help() {
  return (
    <div className="page-container">
      <Header title="Help" />

      <section className="page-section">
        <h2>How it works</h2>
        <p className="page-text">
          Tap an item to tick it off. Drag the handle to reorder. Everything is
          saved in your browser and works offline once the page has loaded.
          Nothing is sent to a server.
        </p>
      </section>

      <section className="page-section">
        <h2>Keyboard shortcuts</h2>
        <ul className="page-list">
          {SHORTCUTS.map(([keys, action]) => (
            <li key={keys}>
              <span>{action}</span>
              <span>
                {keys.split(" / ").map((k, i) => (
                  <span key={k}>
                    {i > 0 && " / "}
                    <kbd>{k}</kbd>
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

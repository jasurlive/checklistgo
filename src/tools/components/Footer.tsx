const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="page-footer">
      © 2019–{YEAR}{" "}
      <a href="https://jasurlive.uz" target="_blank" rel="noreferrer">
        jasurlive.uz
      </a>
    </footer>
  );
}

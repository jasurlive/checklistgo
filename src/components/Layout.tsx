import { Outlet, useLocation } from "react-router";
import Menu from "../shared/Menu";
import ErrorBoundary from "./ErrorBoundary";

// every route renders inside this: navbar + page area
export default function Layout() {
  const { pathname } = useLocation();
  // "/notes/abc" -> "/notes": a new page resets errors, moving inside one page doesn't remount it
  const page = "/" + (pathname.split("/")[1] ?? "");

  return (
    <div className="with-menu">
      <Menu />

      {/* .menu-page = everything right of (desktop) / above (mobile) the navbar */}
      <div className="menu-page">
        {/* key resets the error when you navigate to another page */}
        <ErrorBoundary key={page}>
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  );
}

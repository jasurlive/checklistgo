import { useState, type ReactNode } from "react";
import { NavLink } from "react-router";
import { FiChevronLeft, FiChevronRight, FiCheckSquare, FiEdit3, FiSettings } from "react-icons/fi";
import { LuRepeat, LuShoppingBasket } from "react-icons/lu";
import "../css/menu.css";
import { useTheme } from "../hooks/LOCAL/useTheme";
import { useShortcuts } from "../hooks/LOCAL/useShortcuts";
import { load, save } from "../lib/storage";

export type MenuItem = {
  label: string;
  icon: ReactNode;
  href: string;
  mobile?: boolean;
  bottom?: boolean;
};

export default function Menu({
  items = [
    { label: "Checklist", icon: <FiCheckSquare />, href: "/", mobile: true },
    { label: "Shopping", icon: <LuShoppingBasket />, href: "/shopping", mobile: true },
    { label: "Habits", icon: <LuRepeat />, href: "/habits", mobile: true },
    { label: "Notes", icon: <FiEdit3 />, href: "/notes", mobile: true },
    // bottom: pinned to the bottom of the sidebar on desktop, keep these last
    { label: "Settings", icon: <FiSettings />, href: "/settings", mobile: true, bottom: true },
  ],
}: {
  items?: MenuItem[];
}) {
  const { toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(() => load("menu-collapsed", true));

  const toggleMenu = () => {
    setCollapsed((value) => {
      save("menu-collapsed", !value);
      return !value;
    });
  };

  // global shortcuts, listed on the Settings page: keep both in sync
  useShortcuts({ "ctrl+j": toggleTheme, "`": toggleMenu });

  return (
    <nav className={`menu ${collapsed ? "menu-collapsed" : ""}`}>
      <button
        type="button"
        className="menu-toggle"
        onClick={toggleMenu}
        aria-label="Toggle sidebar (`)"
        title="Toggle sidebar (`)"
      >
        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      {items.map((item) => {
        const className = `menu-item ${
          item.mobile ? "menu-mobile-visible" : "menu-desktop-only"
        } ${item.bottom ? "menu-bottom" : ""}`;

        return (
          // NavLink adds .active on the current page; `end` so "/" isn't active everywhere
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/"}
            className={className}
            title={item.label}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

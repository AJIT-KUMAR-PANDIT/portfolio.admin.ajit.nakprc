"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import axios from "axios";

import styles from "./Dock.module.scss";

export default function Dock() {
  const overlayRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [dockSubMenu, setDockSubMenu] = useState(null);
  const [maxVisible, setMaxVisible] = useState(7);
  const [navData, setNavData] = useState({ items: [] }); // Initialize with an empty items array
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme, resolvedTheme } = useTheme();

  // Fetch navigation data
  useEffect(() => {
    const fetchNavData = async () => {
      try {
        const response = await axios.get("/api/nav");
        setNavData(response.data);
      } catch (error) {
        console.error("Error fetching navigation data:", error);
      }
    };
    fetchNavData();
  }, []);

  // Responsive max visible
  useEffect(() => {
    const updateMax = () => {
      if (window.innerWidth < 640) setMaxVisible(3);
      else if (window.innerWidth < 1024) setMaxVisible(5);
      else setMaxVisible(7);
    };
    updateMax();
    window.addEventListener("resize", updateMax);
    return () => window.removeEventListener("resize", updateMax);
  }, []);

  // Close overlay click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (overlayRef.current && e.target === overlayRef.current) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  const handleDockSubMenuClick = (item) => {
    setDockSubMenu(dockSubMenu?.name === item.name ? null : item);
  };

  const renderItem = (item, i, size = "normal", onSubMenuClick = null) => {
    const Icon = LucideIcons[item.icon] || LucideIcons.Circle;
    const circleClass = size === "large" ? "large" : "";
    const textClass = size === "large" ? "large" : "";

    if (item.subItems) {
      return (
        <button
          key={i}
          onClick={() =>
            onSubMenuClick ? onSubMenuClick(item) : setOpenSubMenu(item.name)
          }
          className={styles["dock-item"]}
        >
          <div
            className={`${styles.circle} ${circleClass}`}
            style={{
              backgroundColor: item.color || "#e5e7eb",
              borderRadius: "50%",
            }}
          >
            <Icon className={circleClass} />
          </div>
          <span className={textClass}>{item.name}</span>
        </button>
      );
    }

    return (
      <Link key={i} href={item.link} className={styles["dock-item"]}>
        <div
          className={`${styles.circle} ${circleClass}`}
          style={{ backgroundColor: item.color || "#e5e7eb" }}
        >
          <Icon className={circleClass} />
        </div>
        <span className={textClass}>{item.name}</span>
      </Link>
    );
  };

  const { items } = navData;
  const visibleItems = items.slice(0, maxVisible);
  const hiddenItems = items.slice(maxVisible);

  return (
    <>
      <section
        className={`${styles.dock} ${theme === "dark" ? styles.dark : ""}`}
      >
        {visibleItems.map((item, i) =>
          renderItem(item, i, "normal", handleDockSubMenuClick)
        )}

        <AnimatePresence>
          {dockSubMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`${styles["dock-submenu"]} ${
                theme === "dark" ? styles.dark : ""
              }`}
            >
              <button
                onClick={() => setDockSubMenu(null)}
                className={styles["submenu-close"]}
              >
                <LucideIcons.X size={18} />
              </button>
              <div className={styles["submenu-items"]}>
                {dockSubMenu.subItems.map((subItem, i) =>
                  renderItem(subItem, i, "normal")
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden items */}
        {hiddenItems.length > 0 && (
          <button
            onClick={() => {
              setOpen(true);
              setDockSubMenu(null);
            }}
            className={styles["dock-item"]}
          >
            <div className={styles.circle}>
              <LucideIcons.Menu />
            </div>
            <span>More</span>
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => {
            if (theme === "light") setTheme("dark");
            else if (theme === "dark") setTheme("system");
            else setTheme("light");
          }}
          className={styles["dock-item"]}
        >
          <div className={styles.circle}>
            {!mounted ? (
              <LucideIcons.Loader2 className="animate-spin" />
            ) : theme === "light" ? (
              <LucideIcons.Sun />
            ) : theme === "dark" ? (
              <LucideIcons.Moon />
            ) : (
              <LucideIcons.Monitor />
            )}
          </div>
          <span>{!mounted ? "..." : theme}</span>
        </button>
      </section>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${styles["dock-overlay"]} ${
              theme === "dark" ? styles.dark : ""
            }`}
          >
            <button onClick={() => setOpen(false)} className="overlay-close">
              <LucideIcons.X />
            </button>

            {!openSubMenu ? (
              <div className={styles["overlay-grid"]}>
                {hiddenItems.map((item, i) => renderItem(item, i, "large"))}
              </div>
            ) : (
              <div className={styles["overlay-grid"]}>
                <button onClick={() => setOpenSubMenu(null)}>
                  <LucideIcons.ArrowLeft /> Back
                </button>
                {items
                  .find((i) => i.name === openSubMenu)
                  ?.subItems.map((subItem, i) =>
                    renderItem(subItem, i, "large")
                  )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

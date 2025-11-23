// app/page.tsx

"use client";

import { useState } from "react";
import {
  HomeIcon,
  ArrowsRightLeftIcon,
  PresentationChartBarIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const PinToggleIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    width='18'
    height='18'
  >
    {/* outer rounded square */}
    <rect
      x='3.5'
      y='4'
      width='17'
      height='16'
      rx='4'
      ry='4'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.6'
    />
    {/* middle divider */}
    <line
      x1='12'
      y1='5'
      x2='12'
      y2='19'
      stroke='currentColor'
      strokeWidth='1.4'
      strokeLinecap='round'
    />
    {/* two small dots on the left side */}
    <circle cx='8.2' cy='9' r='0.9' fill='currentColor' />
    <circle cx='8.2' cy='15' r='0.9' fill='currentColor' />
  </svg>
)

export default function HomePage() {
  const [activePage, setActivePage] = useState<'Home' | 'Swap' | 'Test' | 'Batch Send' | 'Explore' | 'About Us'>('Home')
  const [isPinned, setIsPinned] = useState(false);

  const sidebarClass = isPinned ? "sidebar sidebar-pinned" : "sidebar sidebar-floating";
  const mainClass = isPinned ? "main main-pinned" : "main main-floating";
  const pageTitles = {
  "Home": "Home",
  "Swap": "Swap",
  "Test": "Test",
  "Batch Send": "Batch",
  "Explore": "Explore",
  "About Us": "About"
};

  return (
    <>
      {/* top header */}
<header className={`header ${isPinned ? 'header-pinned' : 'header-floating'}`}>
  <div className="header-left">{pageTitles[activePage]}</div>

        <div className="header-center">
          <input placeholder="paste ink wallet address (coming soon)" disabled />
        </div>

        <div className="header-right">
          <button disabled>connect wallet</button>
        </div>
      </header>

      <div className="layout-shell">
        {/* sidebar */}
<aside className={sidebarClass}>

  {/* small logo area like Step */}
  <div className="sidebar-brand">
    <div className="sidebar-logo-small">IN</div>
  </div>

  {/* pin button, CSS already hides it when collapsed */}
  <div className="sidebar-pin-row">
<button
  className='sidebar-pin-btn'
  onClick={() => setIsPinned(prev => !prev)}
>
  <PinToggleIcon />
</button>

  </div>

  <nav className="sidebar-nav">
    <button
      className={`sidebar-item ${activePage === "Home" ? "sidebar-item-active" : ""}`}
      onClick={() => setActivePage("Home")}
    >
      <span className="sidebar-icon-slot">
        <span className="sidebar-icon">
          <HomeIcon />
        </span>
      </span>
      <span className="sidebar-label">Home</span>
    </button>

    <button
      className={`sidebar-item ${activePage === "Swap" ? "sidebar-item-active" : ""}`}
      onClick={() => setActivePage("Swap")}
    >
      <span className="sidebar-icon-slot">
        <span className="sidebar-icon">
          <ArrowsRightLeftIcon />
        </span>
      </span>
      <span className="sidebar-label">Swap</span>
    </button>

    <button
      className={`sidebar-item ${activePage === "Test" ? "sidebar-item-active" : ""}`}
      onClick={() => setActivePage("Test")}
    >
      <span className="sidebar-icon-slot">
        <span className="sidebar-icon">
          <PresentationChartBarIcon />
        </span>
      </span>
      <span className="sidebar-label">Test</span>
    </button>

    <button
      className={`sidebar-item ${activePage === "Batch Send" ? "sidebar-item-active" : ""}`}
      onClick={() => setActivePage("Batch Send")}
    >
      <span className="sidebar-icon-slot">
        <span className="sidebar-icon">
          <CubeIcon />
        </span>
      </span>
      <span className="sidebar-label">Batch Send</span>
    </button>

    <button
      className={`sidebar-item ${activePage === "Explore" ? "sidebar-item-active" : ""}`}
      onClick={() => setActivePage("Explore")}
    >
      <span className="sidebar-icon-slot">
        <span className="sidebar-icon">
          <MagnifyingGlassIcon />
        </span>
      </span>
      <span className="sidebar-label">Explore</span>
    </button>

    <button
      className={`sidebar-item ${activePage === "About Us" ? "sidebar-item-active" : ""}`}
      onClick={() => setActivePage("About Us")}
    >
      <span className="sidebar-icon-slot">
        <span className="sidebar-icon">
          <InformationCircleIcon />
        </span>
      </span>
      <span className="sidebar-label">About Us</span>
    </button>
  </nav>

</aside>

        {/* main content */}
        <main className={mainClass}>
          <div className="main-inner">
            <h1 className="page-title">ink dashboard</h1>
            <p className="page-subtitle">
              theme work in progress, real portfolio view will come back here later
            </p>
          </div>
        </main>
      </div>
    </>
  );
}

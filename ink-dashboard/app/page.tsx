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
  Cog6ToothIcon,
  GlobeAltIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";


// svg footer - step style X icon
const TwitterIconSvg = () => (
  <svg
    width="18"
    height="16"
    viewBox="0 0 18 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.6582 0.6875H16.1191L10.7051 6.91016L17.1035 15.3125H11.3125L8.17383 10.2148L3.70898 15.3125H1.21289L6.70312 8.96875L0.896484 0.6875H6.0293L8.9082 5.05859L13.6582 0.6875ZM12.7793 13.8359H14.1504L5.29102 2.09375H3.81445L12.7793 13.8359Z"
      fill="#9498A1"
    />
  </svg>
)


// tiny svg button for pin
const PinToggleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
  >
    <rect
      x="3.5"
      y="4"
      width="17"
      height="16"
      rx="4"
      ry="4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <line
      x1="12"
      y1="5"
      x2="12"
      y2="19"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <circle cx="8.2" cy="9" r="0.9" fill="currentColor" />
    <circle cx="8.2" cy="15" r="0.9" fill="currentColor" />
  </svg>
);

type PageKey = "Home" | "Swap" | "Test" | "Batch Send" | "Explore" | "About Us";

export default function HomePage() {
  const [activePage, setActivePage] = useState<PageKey>("Home");
  const [isPinned, setIsPinned] = useState(false);

  const sidebarClass = isPinned
    ? "sidebar sidebar-pinned"
    : "sidebar sidebar-floating";

  const mainClass = isPinned
    ? "main main-pinned"
    : "main main-floating";

  const pageTitles: Record<PageKey, string> = {
    Home: "Home",
    Swap: "Swap",
    Test: "Test",
    "Batch Send": "Batch",
    Explore: "Explore",
    "About Us": "About",
  };

  return (
    <>
      {/* top header */}
      <header className={`header ${isPinned ? "header-pinned" : "header-floating"}`}>
        <div className="header-left">{pageTitles[activePage]}</div>

        <div className="header-center">
          <input
            placeholder="paste ink wallet address (coming soon)"
            disabled
          />
        </div>

        <div className="header-right">
          <button disabled>connect wallet</button>
        </div>
      </header>

      <div className="layout-shell">
        {/* sidebar */}
        
        <aside className={sidebarClass}>
  {/* logo + pin row */}
  <div className='sidebar-brand'>
    <div className='sidebar-logo-wrapper'>
      <div className='sidebar-logo-small'>IN</div>
      <span className='sidebar-app-name'>Ink Dashboard</span>
    </div>

    <button
      className='sidebar-pin-btn pin-in-brand'
      onClick={() => setIsPinned(prev => !prev)}
    >
      <PinToggleIcon />
    </button>
  </div>

  {/* main nav items */}
  <nav className='sidebar-nav'>
    <button
      className={`sidebar-item ${
        activePage === 'Home' ? 'sidebar-item-active' : ''
      }`}
      onClick={() => setActivePage('Home')}
    >
      <span className='sidebar-icon-slot'>
        <span className='sidebar-icon'>
          <HomeIcon />
        </span>
      </span>
      <span className='sidebar-label'>Home</span>
    </button>

    <button
      className={`sidebar-item ${
        activePage === 'Swap' ? 'sidebar-item-active' : ''
      }`}
      onClick={() => setActivePage('Swap')}
    >
      <span className='sidebar-icon-slot'>
        <span className='sidebar-icon'>
          <ArrowsRightLeftIcon />
        </span>
      </span>
      <span className='sidebar-label'>Swap</span>
    </button>

    <button
      className={`sidebar-item ${
        activePage === 'Test' ? 'sidebar-item-active' : ''
      }`}
      onClick={() => setActivePage('Test')}
    >
      <span className='sidebar-icon-slot'>
        <span className='sidebar-icon'>
          <PresentationChartBarIcon />
        </span>
      </span>
      <span className='sidebar-label'>Test</span>
    </button>

    <button
      className={`sidebar-item ${
        activePage === 'Batch Send' ? 'sidebar-item-active' : ''
      }`}
      onClick={() => setActivePage('Batch Send')}
    >
      <span className='sidebar-icon-slot'>
        <span className='sidebar-icon'>
          <CubeIcon />
        </span>
      </span>
      <span className='sidebar-label'>Batch Send</span>
    </button>

    <button
      className={`sidebar-item ${
        activePage === 'Explore' ? 'sidebar-item-active' : ''
      }`}
      onClick={() => setActivePage('Explore')}
    >
      <span className='sidebar-icon-slot'>
        <span className='sidebar-icon'>
          <MagnifyingGlassIcon />
        </span>
      </span>
      <span className='sidebar-label'>Explore</span>
    </button>

    <button
      className={`sidebar-item ${
        activePage === 'About Us' ? 'sidebar-item-active' : ''
      }`}
      onClick={() => setActivePage('About Us')}
    >
      <span className='sidebar-icon-slot'>
        <span className='sidebar-icon'>
          <InformationCircleIcon />
        </span>
      </span>
      <span className='sidebar-label'>About Us</span>
    </button>
  </nav>

  {/* section 2: settings */}
  <section className='sidebar-section'>
    <button className='sidebar-item sidebar-item-secondary'>
      <span className='sidebar-icon-slot'>
        <span className='sidebar-icon'>
          <Cog6ToothIcon />
        </span>
      </span>
      <span className='sidebar-label'>Settings</span>
    </button>

    <button className='sidebar-item sidebar-item-secondary'>
      <span className='sidebar-icon-slot'>
        <span className='sidebar-icon'>
          <GlobeAltIcon />
        </span>
      </span>
      <span className='sidebar-label'>English</span>
    </button>
  </section>

  {/* section 3: ink links */}
  <section className='sidebar-section'>
    <button className='sidebar-item sidebar-item-secondary'>
      <span className='sidebar-icon-slot'>
        <span className='sidebar-icon'>
          <ChartBarIcon />
        </span>
      </span>
      <span className='sidebar-label'>Reward Stats</span>
    </button>

    <button className='sidebar-item sidebar-item-secondary'>
      <span className='sidebar-icon-slot'>
        <span className='sidebar-icon'>
          <DocumentTextIcon />
        </span>
      </span>
      <span className='sidebar-label'>Portfolio Coverage</span>
    </button>

    <button className='sidebar-item sidebar-item-secondary'>
      <span className='sidebar-icon-slot'>
        <span className='sidebar-icon'>
          <MagnifyingGlassIcon />
        </span>
      </span>
      <span className='sidebar-label'>Ink Explorer</span>
    </button>
  </section>


{/* move X icon above the line */}
<div className="sidebar-twitter-alone">
  <button className="sidebar-footer-twitter">
    <span className="sidebar-bottom-icon">
      <TwitterIconSvg />
    </span>

    {/* label */}
    <span className="sidebar-twitter-label">follow on X</span>
  </button>
</div>


{/* now the footer stays only for copyright */}
<div className="sidebar-footer">
<div className="sidebar-footer-copy">
  <span className="sidebar-footer-copy-symbol">©</span>
  <span className="sidebar-footer-copy-text">2025 Ink Dashboard</span>
</div>
</div>
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

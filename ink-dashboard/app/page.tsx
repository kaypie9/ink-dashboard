// app/page.tsx

"use client";

import { useState, useEffect } from "react";
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

function generateRandomSeries(length = 32): number[] {
  const points: number[] = [];
  let current = 4; // fake starting value

  for (let i = 0; i < length; i++) {
    const delta = (Math.random() - 0.5) * 0.4; // small up/down moves
    current = Math.max(0.2, current + delta);
    points.push(current);
  }

  return points;
}

type PageKey = "Home" | "Swap" | "Test" | "Batch Send" | "Explore" | "About Us";

type TokenHolding = {
  address: string
  symbol: string
  decimals: number
  rawBalance: string
  balance: number
  priceUsd?: number
  valueUsd?: number
  iconUrl?: string
}

type PortfolioResponse = {
  mock: boolean
  address: string
  totalValueUsd: number
  balances: {
    nativeInk: number
    stables: number
    lpTokens: number
  }
  vaults: any[]
  vaultDepositsUsd: number
  unclaimedYieldUsd: number
  tokens: TokenHolding[]
}

export default function HomePage() {
  const [activePage, setActivePage] = useState<PageKey>("Home");
  const [isPinned, setIsPinned] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
const [portfolioSeries, setPortfolioSeries] = useState<number[] | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null)
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false)
  const [portfolioError, setPortfolioError] = useState<string | null>(null)


  // todo later: replace this with the connected wallet or search address
  const walletAddress = '0x0000000000000000000000000000000000000000'

  useEffect(() => {
    if (!walletAddress) return

    const fetchPortfolio = async () => {
      try {
        setIsLoadingPortfolio(true)
        setPortfolioError(null)

        const res = await fetch(`/api/portfolio?wallet=${walletAddress}`)
        if (!res.ok) {
          throw new Error(`status ${res.status}`)
        }

        const data: PortfolioResponse = await res.json()
        setPortfolio(data)
      } catch (err) {
        console.error('portfolio fetch failed', err)
        setPortfolioError('could not load portfolio')
      } finally {
        setIsLoadingPortfolio(false)
      }
    }

    fetchPortfolio()
  }, [walletAddress])


useEffect(() => {
  setPortfolioSeries(generateRandomSeries());
}, []);

let startValue = 0;
let endValue = 0;
let changePct = 0;
let isUp = true;
let currentValue = 0;
let linePoints = "";
let fillPoints = "";

if (portfolioSeries) {
  startValue = portfolioSeries[0];
  endValue = portfolioSeries[portfolioSeries.length - 1];
  changePct = ((endValue - startValue) / startValue) * 100;
  isUp = changePct >= 0;
  currentValue = portfolio?.totalValueUsd ?? endValue;


  const min = Math.min(...portfolioSeries);
  const max = Math.max(...portfolioSeries);
  const range = max - min || 1;

  linePoints = portfolioSeries
    .map((v, i) => {
      const x = (i / (portfolioSeries.length - 1)) * 100;
      const y = 38 - ((v - min) / range) * 28;
      return `${x},${y}`;
    })
    .join(" ");

  fillPoints = `0,40 ${linePoints} 100,40`;
}


  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.dataset.theme = theme;
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

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
  <div className="search-wrapper">
    <span className="search-icon">
      <svg width="18" height="18" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" fill="none"/>
        <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    </span>

    <input
      placeholder="Search Address or .INK Domain"
    />
  </div>
</div>


<div className="header-right">
  <button
    type="button"
    className="theme-toggle-btn"
    onClick={toggleTheme}
  >
    {theme === "light" ? "☾" : "☀"}
  </button>

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

    <div className="main-header-row">
      <div>
        <h1 className="page-title">ink dashboard</h1>
        <p className="page-subtitle">
          simple overview of your ink portfolio
        </p>
      </div>

      <div className="page-tag">
        demo view
      </div>
    </div>

{/* portfolio header card */}
<div className={`portfolio-header-card ${isUp ? "chart-up" : "chart-down"}`}>

  {/* left side: wallet identity + quick actions */}
  <div className="portfolio-meta">
    <div className="wallet-identity">
      <div className="wallet-label-row">
        <span className="wallet-label">EVM Wallet</span>
        <span className="wallet-status-pill">Not Connected</span>
      </div>
      <div className="wallet-address-text">
        connect wallet to view address
      </div>
    </div>

    <div className="wallet-actions-row">
      <button className="wallet-action-btn" disabled>send</button>
      <button className="wallet-action-btn" disabled>receive</button>
      <button className="wallet-action-btn" disabled>swap</button>
    </div>
  </div>

  {/* right side: net worth + chart */}
  <div className="portfolio-networth">
    <div className="portfolio-title-row">
      <span className="portfolio-title">Net worth</span>
      <span className="portfolio-title-caret">⌄</span>
    </div>

    <div className="portfolio-networth-main">
      <div className="portfolio-chart">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none">
          <polygon className="portfolio-chart-fill" points={fillPoints} />
          <polyline className="portfolio-chart-line" points={linePoints} />
        </svg>
      </div>

      <div className="portfolio-header-content">
        <div className="portfolio-main-row">
          <span className="portfolio-value">
            ${currentValue.toFixed(2)}
          </span>
          <span className={`portfolio-change ${isUp ? "up" : "down"}`}>
            {isUp ? "+" : ""}
            {changePct.toFixed(2)}%
          </span>
          <div className="portfolio-icons">
            <span className="icon-dropdown">⌄</span>
            <span className="icon-info">?</span>
          </div>
        </div>

        <div className="portfolio-subnote">
          ink assets on this wallet
        </div>
      </div>
    </div>
  </div>
</div>



<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-label">wallet</div>
    <div className="stat-value">$0.00</div>
    <div className="stat-note">spot assets on ink</div>
  </div>

  <div className="stat-card">
    <div className="stat-label">yielding</div>
    <div className="stat-value">$0.00</div>
    <div className="stat-note">staked, deposits, positions</div>
  </div>

  <div className="stat-card">
    <div className="stat-label">nfts</div>
    <div className="stat-value">0</div>
    <div className="stat-note">total ink nfts owned</div>
  </div>
</div>


        {/* holdings table */}
    <section className="positions-section">
      <div className="positions-header-row">
        <div>
          <h2 className="section-title">Holdings</h2>
          <p className="section-subtitle">
            example assets - real balances will show after connect
          </p>
        </div>
      </div>

<div className="positions-table">
  {/* table header */}
  <div className="positions-row positions-row-head">
    <span className="col-token">token</span>
    <span className="col-price">price</span>
    <span className="col-amount">amount</span>
    <span className="col-pnl">pnl 24h</span>
    <span className="col-value">value (usd)</span>
  </div>

  {/* loading state */}
  {isLoadingPortfolio && (
    <div className="positions-row positions-row-empty">
      <span className="col-token">loading portfolio...</span>
      <span className="col-price"></span>
      <span className="col-amount"></span>
      <span className="col-pnl"></span>
      <span className="col-value"></span>
    </div>
  )}

  {/* error state */}
  {portfolioError && !isLoadingPortfolio && (
    <div className="positions-row positions-row-empty">
      <span className="col-token">could not load portfolio</span>
      <span className="col-price"></span>
      <span className="col-amount"></span>
      <span className="col-pnl"></span>
      <span className="col-value"></span>
    </div>
  )}

  {/* no tokens */}
  {!isLoadingPortfolio &&
    !portfolioError &&
    portfolio &&
    portfolio.tokens.length === 0 && (
      <div className="positions-row positions-row-empty">
        <span className="col-token">no tokens found</span>
        <span className="col-price"></span>
        <span className="col-amount"></span>
        <span className="col-pnl"></span>
        <span className="col-value"></span>
      </div>
    )}

  {/* real tokens from /api/portfolio */}
  {!isLoadingPortfolio &&
    !portfolioError &&
    portfolio &&
    portfolio.tokens.map((t) => {
      const price = t.priceUsd ?? 0
      const value = t.valueUsd ?? price * t.balance
      const pnl = 0 // we do not have pnl yet

      const pnlClass =
        pnl > 0
          ? "col-pnl col-pnl-up"
          : pnl < 0
          ? "col-pnl col-pnl-down"
          : "col-pnl col-pnl-flat"

      return (
        <div className="positions-row" key={t.address || t.symbol}>
          <span className="col-token">
            <a
              className="asset-pill asset-pill-link"
              href={`https://explorer.inkonchain.com/token/${t.address}`}
              target="_blank"
              rel="noreferrer"
            >
              {t.symbol || "unknown"}
            </a>
          </span>

          <span className="col-price">
            {price ? `$${price.toFixed(4)}` : "-"}
          </span>

          <span className="col-amount">
            {t.balance.toFixed(4)}
          </span>

          <span className={pnlClass}>
{`${pnl > 0 ? "+" : ""}${(pnl || 0).toFixed(2)}%`}
          </span>

          <span className="col-value">
            {`$${value.toFixed(2)}`}
          </span>
        </div>
      )
    })}
</div>

    </section>

  </div>
</main>
      </div>
    </>
  );
}

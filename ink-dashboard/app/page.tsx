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
);

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

const RefreshIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

type PageKey = "Home" | "Swap" | "Test" | "Batch Send" | "Explore" | "About Us";

type TokenHolding = {
  address: string;
  symbol: string;
  decimals: number;
  rawBalance: string;
  balance: number;
  priceUsd?: number;
  valueUsd?: number;
  iconUrl?: string;
};

type HistoryRange = "1W" | "1M" | "1Y";

type PositionsTab = "wallet" | "yielding" | "nfts" | "transactions";

type HistoryPoint = {
  t: number; // timestamp in ms
  v: number; // usd value
};

function isSpamToken(t: TokenHolding): boolean {
  const price = t.priceUsd ?? 0;
  const value = t.valueUsd ?? price * t.balance;

  // if it has real value, keep it
  if (value >= 0.01) return false;

  const sym = (t.symbol || "").toLowerCase();

  const looksLikeLink =
    sym.includes("http") ||
    sym.includes(".com") ||
    sym.includes(".org") ||
    sym.includes(".net") ||
    sym.includes(".io");

  const looksLikeBot =
    sym.includes("bot") ||
    sym.includes("telegram") ||
    sym.includes("tg ") ||
    sym.includes("@");

  const veryLongSymbol = sym.length > 24;

  // zero value and looks shady
  if (!price && (looksLikeLink || looksLikeBot || veryLongSymbol)) {
    return true;
  }

  return false;
}


function formatDateLabel(t: number) {
  const d = new Date(t);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTimeLabel(t: number) {
  const d = new Date(t);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAddress(addr: string) {
  if (!addr) return "";
  if (addr.length <= 14) return addr;
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatLastUpdated(ts: number | null): string {
  if (!ts) return "";
  const diffSec = Math.floor((Date.now() - ts) / 1000);

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec} seconds ago`;

  const mins = Math.floor(diffSec / 60);
  if (mins < 60) {
    return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  }

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}


type PortfolioResponse = {
  mock: boolean;
  address: string;
  totalValueUsd: number;
  balances: {
    nativeInk: number;
    stables: number;
    lpTokens: number;
  };
  vaults: any[];
  vaultDepositsUsd: number;
  unclaimedYieldUsd: number;
  tokens: TokenHolding[];
};

export default function HomePage() {
  const [activePage, setActivePage] = useState<PageKey>("Home");
  const [isPinned, setIsPinned] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // real wallet and search input
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  // portfolio + loading state
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [copied, setCopied] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  // icons from Dexscreener keyed by token address
  const [tokenIcons, setTokenIcons] = useState<{ [addr: string]: string }>({});

  // history range and data
  const [historyRange, setHistoryRange] = useState<HistoryRange>("1W");
  const [netWorthHistory, setNetWorthHistory] = useState<HistoryPoint[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [positionsTab, setPositionsTab] = useState<PositionsTab>("wallet");

  const showSkeleton = isLoadingPortfolio && !portfolio;


// try to get token icon from backend that proxies Dexscreener
const fetchDexIcon = async (address: string) => {
  if (!address) return;
  if (tokenIcons[address]) return;

  try {
    const res = await fetch(
      `/api/token-icon?address=${encodeURIComponent(address)}`
    );

    if (!res.ok) {
      console.error('token-icon api failed', res.status);
      return;
    }

    const data: { iconUrl?: string | null } = await res.json();

    if (!data.iconUrl) return;

    const icon = data.iconUrl as string;

    setTokenIcons(prev =>
      prev[address] ? prev : { ...prev, [address]: icon }
    );
  } catch (e) {
    console.error('token-icon api crashed', e);
  }
};


// central fetcher used by both auto load and manual refresh
const loadPortfolio = async (
  addr: string
): Promise<PortfolioResponse | null> => {
  if (!addr) return null;

  try {
    setIsLoadingPortfolio(true);
    setPortfolioError(null);

    const res = await fetch(`/api/portfolio?wallet=${addr}`);
    if (!res.ok) throw new Error(`status ${res.status}`);

    const data: PortfolioResponse = await res.json();
    setPortfolio(data);
    setLastUpdatedAt(Date.now());

    // try to fetch icons from Dexscreener for tokens missing iconUrl
if (data?.tokens?.length) {
  data.tokens.forEach((t) => {
    if (!t.address) return;
    if (t.iconUrl) return;
    if (tokenIcons[t.address]) return;
    fetchDexIcon(t.address);
  });
}

    return data;
  } catch (err) {
    console.error("portfolio fetch failed", err);
    setPortfolioError("could not load portfolio");
    return null;
  } finally {
    setIsLoadingPortfolio(false);
  }
};


  // load history from backend with range
  const loadHistory = async (addr: string, range: HistoryRange) => {
    if (!addr) return;

    const rangeParam = range === "1W" ? "1w" : range === "1M" ? "1m" : "1y";

    try {
      const res = await fetch(
        `/api/history?wallet=${addr}&range=${rangeParam}`
      );
      if (!res.ok) {
        console.error("history fetch failed", res.status);
        return;
      }

      const json = await res.json();

      const arr = Array.isArray(json)
        ? json
        : Array.isArray((json as any).points)
        ? (json as any).points
        : [];

      const points: HistoryPoint[] = arr
        .map((p: any) => {
          const value = Number(
            p.value_usd ?? p.net_worth_usd ?? p.total_value_usd ?? 0
          );

          const ts = p.timestamp ?? p.taken_at ?? p.time ?? null;
          const t = ts ? new Date(ts).getTime() : Date.now();

          return { t, v: value };
        })
        .filter((p: HistoryPoint) => p.v >= 0);


      setNetWorthHistory(points);
      setHoverIndex(null);
    } catch (err) {
      console.error("history fetch crashed", err);
    }
  };

  // when wallet changes, load portfolio and default history
  useEffect(() => {
    if (!walletAddress) return;

    loadPortfolio(walletAddress);
    loadHistory(walletAddress, historyRange);
  }, [walletAddress]);

  // when range changes, reload history only
  useEffect(() => {
    if (!walletAddress) return;
    loadHistory(walletAddress, historyRange);
  }, [historyRange, walletAddress]);

  // manual refresh: refresh portfolio, write snapshot, reload history
  const refreshAll = async () => {
    if (!walletAddress) return;

    try {
      setIsRefreshing(true);

      const data = await loadPortfolio(walletAddress);
      if (!data) return;

      const netWorth = data.totalValueUsd ?? 0;

      const res = await fetch("/api/snapshot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wallet: walletAddress,
          netWorthUsd: netWorth,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.error("snapshot failed", res.status, errJson);
      }

      await loadHistory(walletAddress, historyRange);
    } catch (err) {
      console.error("refresh failed", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const changeHistoryRange = (range: HistoryRange) => {
    setHistoryRange(range);
  };

  // ------------- chart + % since last refresh -------------

  const latestPoint =
    netWorthHistory.length > 0
      ? netWorthHistory[netWorthHistory.length - 1]
      : null;
  const previousPoint =
    netWorthHistory.length > 1
      ? netWorthHistory[netWorthHistory.length - 2]
      : null;

  const latest =
    latestPoint?.v ?? portfolio?.totalValueUsd ?? 0;
  const previous = previousPoint?.v ?? latest;

  const changePct =
    previous === 0 ? 0 : ((latest - previous) / previous) * 100;

  const isUp = changePct >= 0;

  const currentValue = latest;
  const changeAbs = latest - previous;
  const hasHistory = netWorthHistory.length > 1;


  let linePoints = "";
  let fillPoints = "";
  let hoverX: number | null = null;
  let hoverY: number | null = null;

  const values = netWorthHistory.map((p) => p.v);

  if (values.length > 1) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    linePoints = netWorthHistory
      .map((p, i) => {
        const x =
          netWorthHistory.length === 1
            ? 0
            : (i / (netWorthHistory.length - 1)) * 100;
        const y = 38 - ((p.v - min) / range) * 28;

        if (hoverIndex === i) {
          hoverX = x;
          hoverY = y;
        }

        return `${x},${y}`;
      })
      .join(" ");

    fillPoints = `0,40 ${linePoints} 100,40`;

    // if nothing hovered yet, snap helper to last point
    if (hoverX == null && netWorthHistory.length > 0) {
      const lastIndex = netWorthHistory.length - 1;
      const lastValue = netWorthHistory[lastIndex].v;
      const x =
        netWorthHistory.length === 1
          ? 0
          : (lastIndex / (netWorthHistory.length - 1)) * 100;
      const y = 38 - ((lastValue - min) / range) * 28;
      hoverX = x;
      hoverY = y;
    }
  } else {
    linePoints = "";
    fillPoints = "0,40 100,40 0,40";
  }


const activePoint =
  hoverIndex != null && netWorthHistory[hoverIndex]
    ? netWorthHistory[hoverIndex]
    : null;


  // theme to body
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.dataset.theme = theme;
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const sidebarClass = isPinned
    ? "sidebar sidebar-pinned"
    : "sidebar sidebar-floating";

  const mainClass = isPinned ? "main main-pinned" : "main main-floating";

  const pageTitles: Record<PageKey, string> = {
    Home: "Home",
    Swap: "Swap",
    Test: "Test",
    "Batch Send": "Batch",
    Explore: "Explore",
    "About Us": "About",
  };

  const totalValue = portfolio?.totalValueUsd ?? 0;
  const yieldingUsd = portfolio
    ? (portfolio.vaultDepositsUsd || 0) + (portfolio.unclaimedYieldUsd || 0)
    : 0;
  const walletUsd = Math.max(totalValue - yieldingUsd, 0);

  const nftCount = 0;

  const visibleTokens = portfolio
    ? portfolio.tokens.filter((t) => !isSpamToken(t))
    : [];

    const yieldingPositions = portfolio?.vaults ?? [];

const explorerTxUrl = walletAddress
  ? `https://explorer.inkonchain.com/address/${walletAddress}?tab=txs`
  : null;

  return (
    <>
      {/* top header */}
      <header
        className={`header ${isPinned ? "header-pinned" : "header-floating"}`}
      >
        <div className="header-left">{pageTitles[activePage]}</div>

        <div className="header-center">
          <div className="search-wrapper">
            <span className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                />
                <line
                  x1="16"
                  y1="16"
                  x2="21"
                  y2="21"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <input
              placeholder="Search Address or .INK Domain"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const trimmed = searchInput.trim();
                  if (!trimmed) return;
                  setWalletAddress(trimmed);
                  setNetWorthHistory([]);
                  setHoverIndex(null);
                }
              }}
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
          <div className="sidebar-brand">
            <div className="sidebar-logo-wrapper">
              <div className="sidebar-logo-small">IN</div>
              <span className="sidebar-app-name">Ink Dashboard</span>
            </div>

            <button
              className="sidebar-pin-btn pin-in-brand"
              onClick={() => setIsPinned((prev) => !prev)}
            >
              <PinToggleIcon />
            </button>
          </div>

          {/* main nav items */}
          <nav className="sidebar-nav">
            <button
              className={`sidebar-item ${
                activePage === "Home" ? "sidebar-item-active" : ""
              }`}
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
              className={`sidebar-item ${
                activePage === "Swap" ? "sidebar-item-active" : ""
              }`}
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
              className={`sidebar-item ${
                activePage === "Test" ? "sidebar-item-active" : ""
              }`}
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
              className={`sidebar-item ${
                activePage === "Batch Send" ? "sidebar-item-active" : ""
              }`}
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
              className={`sidebar-item ${
                activePage === "Explore" ? "sidebar-item-active" : ""
              }`}
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
              className={`sidebar-item ${
                activePage === "About Us" ? "sidebar-item-active" : ""
              }`}
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

          {/* section 2: settings */}
          <section className="sidebar-section">
            <button className="sidebar-item sidebar-item-secondary">
              <span className="sidebar-icon-slot">
                <span className="sidebar-icon">
                  <Cog6ToothIcon />
                </span>
              </span>
              <span className="sidebar-label">Settings</span>
            </button>

            <button className="sidebar-item sidebar-item-secondary">
              <span className="sidebar-icon-slot">
                <span className="sidebar-icon">
                  <GlobeAltIcon />
                </span>
              </span>
              <span className="sidebar-label">English</span>
            </button>
          </section>

          {/* section 3: ink links */}
          <section className="sidebar-section">
            <button className="sidebar-item sidebar-item-secondary">
              <span className="sidebar-icon-slot">
                <span className="sidebar-icon">
                  <ChartBarIcon />
                </span>
              </span>
              <span className="sidebar-label">Reward Stats</span>
            </button>

            <button className="sidebar-item sidebar-item-secondary">
              <span className="sidebar-icon-slot">
                <span className="sidebar-icon">
                  <DocumentTextIcon />
                </span>
              </span>
              <span className="sidebar-label">Portfolio Coverage</span>
            </button>

            <button className="sidebar-item sidebar-item-secondary">
              <span className="sidebar-icon-slot">
                <span className="sidebar-icon">
                  <MagnifyingGlassIcon />
                </span>
              </span>
              <span className="sidebar-label">Ink Explorer</span>
            </button>
          </section>

          {/* X button */}
          <div className="sidebar-twitter-alone">
            <button className="sidebar-footer-twitter">
              <span className="sidebar-bottom-icon">
                <TwitterIconSvg />
              </span>
              <span className="sidebar-twitter-label">follow on X</span>
            </button>
          </div>

          {/* footer */}
          <div className="sidebar-footer">
            <div className="sidebar-footer-copy">
              <span className="sidebar-footer-copy-symbol">©</span>
              <span className="sidebar-footer-copy-text">
                2025 Ink Dashboard
              </span>
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

              <div className="main-header-right">
                <span className="last-updated-text">
                  {walletAddress && lastUpdatedAt
                    ? `last updated ${formatLastUpdated(lastUpdatedAt)}`
                    : walletAddress
                    ? "no data yet"
                    : "enter a wallet to start"}
                </span>

                <button
                  className="refresh-round-btn"
                  onClick={refreshAll}
                  disabled={isRefreshing || !walletAddress}
                >
                  <span className={isRefreshing ? "spin-refresh" : ""}>
                    <RefreshIcon />
                  </span>
                </button>
              </div>
            </div>

                      {/* portfolio header card */}
            <div
              className={`portfolio-header-card ${
                isUp ? "chart-up" : "chart-down"
              }`}
            >
              {isLoadingPortfolio && (
                <div className="portfolio-loading-overlay">
                  <div className="portfolio-loading-spinner" />
                  <span className="portfolio-loading-text">
                    loading wallet...
                  </span>
                </div>
              )}

              <div className="portfolio-header-grid">
                {/* left side: wallet identity + quick actions */}
                <div className="portfolio-meta">
                  <div className="wallet-identity">
                    <div className="wallet-label-row">
                      <span className="wallet-label">EVM Wallet</span>
                      <span className="wallet-status-pill">Not Connected</span>
                    </div>
                    <div
                      className={
                        "wallet-address-row" + (copied ? " show-tooltip" : "")
                      }
                      onClick={async () => {
                        if (!walletAddress) return;
                        try {
                          await navigator.clipboard.writeText(walletAddress);
                        } catch (e) {
                          console.error("clipboard failed", e);
                        }
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                      }}
                    >
                      {copied && (
                        <span className="wallet-copy-tooltip">copied</span>
                      )}

                      <span className="wallet-address-text">
                        current view wallet:{" "}
                        {walletAddress
                          ? formatAddress(walletAddress)
                          : "none selected"}
                      </span>

                      {walletAddress && (
                        <span className="wallet-copy-hint">tap to copy</span>
                      )}
                    </div>

                  </div>

                  <div className="wallet-actions-row">
                    <button className="wallet-action-btn" disabled>
                      send
                    </button>
                    <button className="wallet-action-btn" disabled>
                      receive
                    </button>
                    <button className="wallet-action-btn" disabled>
                      swap
                    </button>
                  </div>
                </div>

                {/* right side: net worth + chart */}
                <div className="portfolio-networth">
                  <div className="portfolio-title-row">
                    <div className="portfolio-title-left">
                      <span className="portfolio-title">Net worth</span>
                      <span className="portfolio-title-pill">ink only</span>
                    </div>

                    <div className="portfolio-range-switch">
                      <button
                        className={
                          historyRange === "1W"
                            ? "range-btn range-btn-active"
                            : "range-btn"
                        }
                        onClick={() => changeHistoryRange("1W")}
                      >
                        1W
                      </button>
                      <button
                        className={
                          historyRange === "1M"
                            ? "range-btn range-btn-active"
                            : "range-btn"
                        }
                        onClick={() => changeHistoryRange("1M")}
                      >
                        1M
                      </button>
                      <button
                        className={
                          historyRange === "1Y"
                            ? "range-btn range-btn-active"
                            : "range-btn"
                        }
                        onClick={() => changeHistoryRange("1Y")}
                      >
                        1Y
                      </button>
                    </div>
                  </div>

  <div className="portfolio-tag-row">
    <div className="portfolio-tag-right">
      <span className="portfolio-tag-dot"></span>
      <span className="portfolio-tag-text">live snapshot</span>
    </div>
  </div>

                  <div className="portfolio-networth-main premium-networth">
    <div className="portfolio-chart-wrapper">
      <div className="portfolio-chart-bg"></div>

      {activePoint && hoverX != null && (
        <div
          className="chart-tooltip"
          style={{ left: `${hoverX}%` }}
        >
          <div className="chart-tooltip-inner">
            <div className="chart-tooltip-date">
              {formatDateTimeLabel(activePoint.t)}
            </div>
            <div className="chart-tooltip-row">
              <span className="chart-tooltip-dot-icon" />
              <span className="chart-tooltip-label">Net worth</span>
              <span className="chart-tooltip-value">
                {`$${activePoint.v.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="portfolio-chart">

                        <svg
                          viewBox="0 0 100 50"
                          preserveAspectRatio="none"
                          className="chart-svg"
                          onMouseLeave={() => setHoverIndex(null)}
                          onMouseMove={(e) => {
                            if (netWorthHistory.length < 2) return;
                            const rect =
                              (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const step =
                              rect.width / (netWorthHistory.length - 1);
                            const index = Math.round(x / step);
                            const clamped = Math.max(
                              0,
                              Math.min(netWorthHistory.length - 1, index)
                            );
                            setHoverIndex(clamped);
                          }}
                        >
          <polygon
            className="portfolio-chart-fill"
            points={fillPoints}
          />
          <polyline
            className="portfolio-chart-line"
            points={linePoints}
          />
          {hoverX != null && hoverY != null && (
            <>
              <line
                className="chart-hover-line"
                x1={hoverX}
                x2={hoverX}
                y1={0}
                y2={50}
              />
              <circle
                className="chart-hover-dot"
                cx={hoverX}
                cy={hoverY}
                r={1.2}
              />
            </>
          )}
        </svg>

                      </div>
                    </div>

                    <div className="portfolio-header-content premium-meta">
                      <div className="premium-main-row">
                        <div className="portfolio-main-left">
                          <span className="portfolio-value">{`$${currentValue.toFixed(
                            2
                          )}`}</span>

                          <span
                            className={`portfolio-change-pill ${
                              isUp ? "pill-up" : "pill-down"
                            }`}
                          >
                            <span className="change-arrow">
                              {isUp ? "▲" : "▼"}
                            </span>
                            <span className="change-pct">
                              {changePct.toFixed(2)}%
                            </span>
                          </span>
                        </div>
                      </div>

{hasHistory ? (
  <div className="portfolio-sub-row premium-sub-row">
    <span
      className={`portfolio-sub-value portfolio-pnl-abs ${
        changeAbs >= 0 ? "pnl-up" : "pnl-down"
      }`}
    >
      {changeAbs >= 0 ? "+" : "-"}${Math.abs(changeAbs).toFixed(2)}
    </span>
  </div>
) : (
        <div className="portfolio-sub-row premium-sub-row">
          <span className="portfolio-sub-label">no history yet</span>
          <span className="portfolio-sub-value">$0.00</span>
        </div>
      )}

                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* asset distribution cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">wallet</div>
                {showSkeleton ? (
                  <>
                    <div className="skeleton skeleton-lg" />
                    <div className="skeleton skeleton-sm" />
                  </>
                ) : (
                  <>
                    <div className="stat-value">{`$${walletUsd.toFixed(
                      2
                    )}`}</div>
                    <div className="stat-note">spot assets on ink</div>
                  </>
                )}
              </div>

              <div className="stat-card">
                <div className="stat-label">yielding</div>
                {showSkeleton ? (
                  <>
                    <div className="skeleton skeleton-lg" />
                    <div className="skeleton skeleton-sm" />
                  </>
                ) : (
                  <>
                    <div className="stat-value">{`$${yieldingUsd.toFixed(
                      2
                    )}`}</div>
                    <div className="stat-note">
                      staked, deposits, positions
                    </div>
                  </>
                )}
              </div>


              <div className="stat-card">
                <div className="stat-label">nfts</div>
                {showSkeleton ? (
                  <>
                    <div className="skeleton skeleton-lg" />
                    <div className="skeleton skeleton-sm" />
                  </>
                ) : (
                  <>
                    <div className="stat-value">{nftCount}</div>
                    <div className="stat-note">total ink nfts owned</div>
                  </>
                )}
              </div>

            </div>

{/* holdings + tabs */}
<section className="positions-section">
  <div className="positions-header-row">
    <div>
      <h2 className="section-title">Portfolio</h2>
      <p className="section-subtitle">
        on ink for this wallet
      </p>
    </div>

    <div className="positions-tabs">
      <button
        className={
          positionsTab === "wallet"
            ? "positions-tab-btn positions-tab-btn-active"
            : "positions-tab-btn"
        }
        onClick={() => setPositionsTab("wallet")}
      >
        Wallet
      </button>
      <button
        className={
          positionsTab === "yielding"
            ? "positions-tab-btn positions-tab-btn-active"
            : "positions-tab-btn"
        }
        onClick={() => setPositionsTab("yielding")}
      >
        Yielding
      </button>
      <button
        className={
          positionsTab === "nfts"
            ? "positions-tab-btn positions-tab-btn-active"
            : "positions-tab-btn"
        }
        onClick={() => setPositionsTab("nfts")}
      >
        NFTs
      </button>
            <button
        className={
          positionsTab === "transactions"
            ? "positions-tab-btn positions-tab-btn-active"
            : "positions-tab-btn"
        }
        onClick={() => setPositionsTab("transactions")}
      >
        Transactions
      </button>
    </div>
  </div>

  {/* TAB 1: wallet tokens (current table) */}
  {positionsTab === "wallet" && (
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
      {showSkeleton && (
        <div className="positions-row">
          <span className="col-token">
            <span className="token-icon skeleton skeleton-rect" />
            <span className="skeleton skeleton-md" style={{ flex: 1 }} />
          </span>
          <span className="col-price">
            <span className="skeleton skeleton-sm" />
          </span>
          <span className="col-amount">
            <span className="skeleton skeleton-sm" />
          </span>
          <span className="col-pnl">
            <span className="skeleton skeleton-sm" />
          </span>
          <span className="col-value">
            <span className="skeleton skeleton-sm" />
          </span>
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
  visibleTokens.length === 0 && (
    <div className="positions-row positions-row-empty">
      <span className="col-token">no tokens found</span>
      <span className="col-price"></span>
      <span className="col-amount"></span>
      <span className="col-pnl"></span>
      <span className="col-value"></span>
    </div>
  )}


      {/* real tokens from api */}
{!isLoadingPortfolio &&
  !portfolioError &&
  portfolio &&
  visibleTokens.map((t) => {
          const price = t.priceUsd ?? 0;
          const value = t.valueUsd ?? price * t.balance;
          const pnl = 0;

          const pnlClass =
            pnl > 0
              ? "col-pnl col-pnl-up"
              : pnl < 0
              ? "col-pnl col-pnl-down"
              : "col-pnl col-pnl-flat";

          return (
            <div
              className="positions-row"
              key={t.address || t.symbol}
            >
              <span className="col-token">
                <span className="token-icon">
                  {t.iconUrl || tokenIcons[t.address] ? (
                    <img
                      src={t.iconUrl || tokenIcons[t.address]}
                      alt={t.symbol || "token"}
                      className="token-icon-img"
                    />
                  ) : (
                    (t.symbol || "?").slice(0, 3).toUpperCase()
                  )}
                </span>

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
          );
        })}
    </div>
  )}

  {/* TAB 2: yielding pools placeholder */}
{positionsTab === "yielding" && (
  <div className="positions-table">
    <div className="positions-row positions-row-head">
      <span className="col-token">position</span>
      <span className="col-price">platform</span>
      <span className="col-amount">amount</span>
      <span className="col-pnl">apr</span>
      <span className="col-value">value (usd)</span>
    </div>

    {showSkeleton && (
      <div className="positions-row">
        <span className="col-token">
          <span className="skeleton skeleton-md" style={{ flex: 1 }} />
        </span>
        <span className="col-price">
          <span className="skeleton skeleton-sm" />
        </span>
        <span className="col-amount">
          <span className="skeleton skeleton-sm" />
        </span>
        <span className="col-pnl">
          <span className="skeleton skeleton-sm" />
        </span>
        <span className="col-value">
          <span className="skeleton skeleton-sm" />
        </span>
      </div>
    )}

    {!showSkeleton &&
      !portfolioError &&
      portfolio &&
      yieldingPositions.length === 0 && (
        <div className="positions-row positions-row-empty">
          <span className="col-token">no yielding positions found</span>
          <span className="col-price"></span>
          <span className="col-amount"></span>
          <span className="col-pnl"></span>
          <span className="col-value"></span>
        </div>
      )}

    {!showSkeleton &&
      !portfolioError &&
      portfolio &&
      yieldingPositions.map((v, idx) => {
        const label =
          (v.name as string) ||
          (v.symbol as string) ||
          (v.poolName as string) ||
          "yield position";

        const platform =
          (v.protocol as string) ||
          (v.platform as string) ||
          "unknown";

        const depositedUsd =
          (v.depositedUsd as number) ??
          (v.valueUsd as number) ??
          (v.depositsUsd as number) ??
          0;

        const amount =
          (v.amount as number) ??
          (v.stakedAmount as number) ??
          0;

        const apr =
          (v.apr as number) ??
          (v.apy as number) ??
          0;

        return (
          <div className="positions-row" key={idx}>
            <span className="col-token">{label}</span>
            <span className="col-price">{platform}</span>
            <span className="col-amount">
              {amount ? amount.toFixed(4) : "-"}
            </span>
            <span className="col-pnl">
              {apr ? `${apr.toFixed(2)}%` : "-"}
            </span>
            <span className="col-value">
              {`$${depositedUsd.toFixed(2)}`}
            </span>
          </div>
        );
      })}
  </div>
)}


  {/* TAB 3: NFTs placeholder */}
{positionsTab === "nfts" && (
  <div className="positions-empty">
    {walletAddress ? (
      nftCount > 0 ? (
        <p>{nftCount} NFTs detected for this wallet on ink</p>
      ) : (
        <p>no NFTs found yet for this wallet on ink</p>
      )
    ) : (
      <p>enter a wallet above to check NFTs on ink</p>
    )}
  </div>
)}


    {/* TAB 4: transactions placeholder */}
{positionsTab === "transactions" && (
  <div className="positions-empty">
    {walletAddress && explorerTxUrl ? (
      <p>
        full transaction history for this wallet is on ink explorer{" "}
        <a
          className="asset-pill asset-pill-link"
          href={explorerTxUrl}
          target="_blank"
          rel="noreferrer"
        >
          open explorer
        </a>
      </p>
    ) : (
      <p>enter a wallet above to see transactions</p>
    )}
  </div>
)}


</section>
          </div>
        </main>
      </div>
    </>
  );
}

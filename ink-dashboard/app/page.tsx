// app/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
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


  // ADD MORE
const PLATFORM_ICONS: Record<string, string> = {
  // inkypump
  '0x1d74317d760f2c72a94386f50e8d10f2c902b899': 'inkypump',

  // across
  '': 'across',

  // Nado
  '0x05ec92d78ed421f3d3ada77ffde167106565974e': 'Nado',
  // add more later here...

  // Li.fi
  '0x864b314d4c5a0399368609581d3e8933a63b9232': 'lifi',
  '0x1bcd304fdad1d1d66529159b1bc8d13c9158d586': 'lifi',

    // dailygm
  '0x9f500d075118272b3564ac6ef2c70a9067fd2d3f': 'dailygm',
}

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

type NftToken = {
  contract: string;
  tokenId: string;
  name: string;
  imageUrl?: string;
};

type NftCollection = {
  address: string;
  name: string;
  symbol: string;
  ownedCount: number;
  tokens: NftToken[];
};

type TxToken = {
  symbol: string;
  address: string;
};

type TxItem = {
  hash: string;
  timestamp: number;
  direction: "in" | "out" | "self";
  from: string;
  to: string;
  otherParty: string;
  valueInk: number;
  gasFeeInk: number;
  gasFeeUsd: number;
  details: string;
  hasNft: boolean;
  status: string;
  tokens: TxToken[];
  method?: string;    // add this
  toLabel?: string;   // keep this
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


function shortAddress(addr: string) {
  if (!addr) return ''
  const a = addr.toLowerCase()
  if (a.length <= 10) return a
  return `${a.slice(0, 6)}…${a.slice(-4)}`
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

type TxLeg = {
  direction: "in" | "out"; // in = received, out = sent
  amount: number | null;
  symbol: string;
};

function parseTxDetails(details: string | undefined): TxLeg[] {
  if (!details) return [];

  const legs: TxLeg[] = [];

  // 1) normal tokens / native coin: "Sent 0.1 ANITA"
  const re = /(Sent|Received)\s+([\d.,]+)\s+([A-Za-z0-9]+)\b/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(details)) !== null) {
    const dir = m[1] === "Sent" ? "out" : "in";
    const amt = parseFloat(m[2].replace(/,/g, ""));
    const sym = m[3];
    legs.push({
      direction: dir,
      amount: Number.isFinite(amt) ? amt : null,
      symbol: sym,
    });
  }

  // 2) NFTs: backend sends "Sent INKBunnies #1234"
  // here we treat it as "+1 INKBunnies" (or "-1 INKBunnies")
  const reNft = /(Sent|Received)\s+([A-Za-z0-9]+)\s+#\d+/g;

  while ((m = reNft.exec(details)) !== null) {
    const dir = m[1] === "Sent" ? "out" : "in";
    const sym = m[2];
    legs.push({
      direction: dir,
      amount: 1,
      symbol: sym,
    });
  }

  return legs;
}


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

const [nftCollections, setNftCollections] = useState<NftCollection[] | null>(
  null
);
const [perCollectionSpentUsd, setPerCollectionSpentUsd] =
  useState<Record<string, number>>({});
const [perCollectionFloorUsd, setPerCollectionFloorUsd] =
  useState<Record<string, number>>({});

// total spent across all collections (for later if you want to display it)
const [totalNftSpentUsd, setTotalNftSpentUsd] = useState<number>(0);

const [isLoadingNfts, setIsLoadingNfts] = useState(false);
const [nftError, setNftError] = useState<string | null>(null);
const [nftSortBy, setNftSortBy] = useState<"balance" | "spent" | null>(null);
const [nftSortDir, setNftSortDir] = useState<"asc" | "desc">("desc");

 // transactions consts
const [txs, setTxs] = useState<TxItem[]>([]);
const [isLoadingTxs, setIsLoadingTxs] = useState(false);
const [txError, setTxError] = useState<string | null>(null);
const [txTokenQuery, setTxTokenQuery] = useState<string>("");
const [txSelectedToken, setTxSelectedToken] = useState<TxToken | null>(null);
const [txPage, setTxPage] = useState(1);
const [txHasMore, setTxHasMore] = useState(false);
const [txTokenDropdownOpen, setTxTokenDropdownOpen] = useState(false);

const [txTokenOptions, setTxTokenOptions] = useState<TxToken[]>([]);

const [nativeUsdPrice, setNativeUsdPrice] = useState(0);


// try to get token icon from backend that proxies Dexscreener
const fetchDexIcon = async (address: string) => {
  if (!address) return;

  const key = address.toLowerCase();
  if (tokenIcons[key]) return;

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
      prev[key] ? prev : { ...prev, [key]: icon }
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

    const key = t.address.toLowerCase();
    if (tokenIcons[key]) return;

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

    // NFTS function

  // NFTS function

  const loadNfts = async (addr: string) => {
    if (!addr) return;

    try {
      setIsLoadingNfts(true);
      setNftError(null);

      const res = await fetch(`/api/nfts?wallet=${addr}`);
      if (!res.ok) throw new Error(`status ${res.status}`);

      const json = await res.json();
      const cols: NftCollection[] = Array.isArray(json.collections)
        ? json.collections
        : [];

      setNftCollections(cols);
    } catch (err) {
      console.error("nfts fetch failed", err);
      setNftError("could not load nfts");
      setNftCollections([]);
    } finally {
      setIsLoadingNfts(false);
    }
  };


    // total spent per collection is loaded from a separate endpoint
  const loadNftSpent = async (addr: string) => {
    if (!addr) return;

    try {
      const res = await fetch(`/api/nfts/spent?wallet=${addr}`);
      if (!res.ok) {
        console.error("nfts spent fetch failed", res.status);
        return;
      }

      const json = await res.json();

      const total = Number(json.totalSpentUsd || 0);
      const perCol = (json.perCollectionSpentUsd || {}) as Record<
        string,
        number
      >;

      setTotalNftSpentUsd(total);
      setPerCollectionSpentUsd(perCol);
    } catch (err) {
      console.error("nfts spent fetch crashed", err);
    }
  };

  // transaction function

// transaction function
const loadTransactions = async (addr: string, page: number) => {
  if (!addr) return;

  try {
    setIsLoadingTxs(true);
    setTxError(null);

    const params = new URLSearchParams();
    params.set('wallet', addr);
    params.set('page', String(page));

    // restore backend token filter
    const tokenAddr = txSelectedToken?.address?.toLowerCase();
    if (tokenAddr) {
      params.set('token', tokenAddr);
    }

    const res = await fetch(`/api/transactions?${params.toString()}`);

    if (!res.ok) throw new Error(`status ${res.status}`);

    const json = await res.json();
    const list: TxItem[] = Array.isArray(json.txs) ? json.txs : [];

    setTxHasMore(!!json.hasMore);

    // new: store native usd price coming from api
if (typeof json.nativeUsdPrice === 'number') {
  setNativeUsdPrice(json.nativeUsdPrice);
}


    setTxs(prev => (page === 1 ? list : [...prev, ...list]));

    if (Array.isArray(json.tokens)) {
      setTxTokenOptions(prev => {
        const map: Record<string, TxToken> = {};

        for (const t of [...prev, ...json.tokens]) {
          if (!t.address) continue;
          const addrKey = t.address.toLowerCase();
          if (!map[addrKey]) {
            map[addrKey] = {
              symbol: t.symbol,
              address: addrKey,
            };
          }
        }

        return Object.values(map);
      });
    }
  } catch (e) {
    console.error('loadTransactions failed', e);
    setTxError('could not load transactions');
  } finally {
    setIsLoadingTxs(false);
  }
};

// when wallet changes, reset tx state and hydrate from cache if present
useEffect(() => {
  if (!walletAddress) return;

  setTxPage(1);
  setTxHasMore(false);
  setTxTokenQuery('');
  setTxSelectedToken(null);
  setTxTokenDropdownOpen(false);
  setTxTokenOptions([]);

  // try to load cached txs for this wallet
  if (typeof window !== 'undefined') {
    try {
      const key = `inkdash_txs_${walletAddress.toLowerCase()}`;
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed: TxItem[] = JSON.parse(raw);
        setTxs(parsed);
      } else {
        setTxs([]);
      }
    } catch {
      setTxs([]);
    }
  } else {
    setTxs([]);
  }

  loadPortfolio(walletAddress);
  loadHistory(walletAddress, historyRange);
  loadNfts(walletAddress);
  loadNftSpent(walletAddress);
}, [walletAddress]);



// whenever wallet, page, or selected token changes, load tx page
useEffect(() => {
  if (!walletAddress) return;
  loadTransactions(walletAddress, txPage);
}, [walletAddress, txPage, txSelectedToken]);







  // when range changes, reload history onlyy
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

   const nftCount = nftCollections
    ? nftCollections.reduce(
        (sum, c) => sum + (c.ownedCount || c.tokens.length || 0),
        0
      )
    : 0;

const sortedNfts = useMemo(() => {
  if (!nftCollections) return [];

  const arr = [...nftCollections];

  if (nftSortBy === "balance") {
    arr.sort((a, b) => {
      const aBal = a.ownedCount || a.tokens.length || 0;
      const bBal = b.ownedCount || b.tokens.length || 0;
      return aBal - bBal;
    });
  } else if (nftSortBy === "spent") {
    arr.sort((a, b) => {
      const aSpent = perCollectionSpentUsd[a.address] || 0;
      const bSpent = perCollectionSpentUsd[b.address] || 0;
      return aSpent - bSpent;
    });
  }

  if (nftSortDir === "desc") arr.reverse();
  return arr;
}, [nftCollections, nftSortBy, nftSortDir, perCollectionSpentUsd]);

const handleNftSort = (key: "balance" | "spent") => {
  if (nftSortBy === key) {
    setNftSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  } else {
    setNftSortBy(key);
    setNftSortDir("desc");
  }
};


  const visibleTokens = portfolio
    ? portfolio.tokens.filter((t) => !isSpamToken(t))
    : [];

    const yieldingPositions = portfolio?.vaults ?? [];

const explorerTxUrl = walletAddress
  ? `https://explorer.inkonchain.com/address/${walletAddress}?tab=txs`
  : null;

// all unique tokens from transactions


  // fetch icons for tokens seen in transactions as well
  useEffect(() => {
    txTokenOptions.forEach((tok) => {
      if (!tok.address) return;

      const key = tok.address.toLowerCase();
      if (tokenIcons[key]) return;

      fetchDexIcon(tok.address);
    });
  }, [txTokenOptions, tokenIcons]);




// suggestions based on query
const txTokenSuggestions = useMemo(() => {
  const q = txTokenQuery.trim().toLowerCase();

  // no typing = no dropdown items
  if (!q) return [];

  return txTokenOptions.filter((tok) => {
    const sym = (tok.symbol || "").toLowerCase();
    const addr = (tok.address || "").toLowerCase();
    return sym.includes(q) || addr.includes(q);
  });
}, [txTokenOptions, txTokenQuery]);

const tokenPriceMap = useMemo(() => {
  const m: Record<string, number> = {};
  if (portfolio?.tokens) {
    portfolio.tokens.forEach((t) => {
      if (t.address && t.priceUsd != null) {
        m[t.address.toLowerCase()] = t.priceUsd;
      }
    });
  }
  return m;
}, [portfolio]);


// final filtered transactions
const filteredTxs = useMemo(() => {
  if (!txSelectedToken) return txs;

  const target = txSelectedToken.address.toLowerCase();
  return txs.filter(tx =>
    (tx.tokens || []).some(
      tok => tok.address && tok.address.toLowerCase() === target
    )
  );
}, [txs, txSelectedToken]);

// auto-load icons for tokens that appear only inside txs
useEffect(() => {
  filteredTxs.forEach(tx => {
    tx.tokens.forEach(t => {
      const addr = t.address?.toLowerCase();
      if (addr && !tokenIcons[addr]) {
        fetchDexIcon(addr);
      }
    });
  });
}, [filteredTxs]);

const showTxFullLoader = isLoadingTxs && txPage === 1;


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
  if (e.key === 'Enter') {
    const raw = (e.currentTarget as HTMLInputElement).value;
    const trimmed = raw.trim();
    if (!trimmed) return;

    // keep local state in sync
    setSearchInput(trimmed);

    // trigger portfolio reload for the pasted address
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

          <button className="connect-wallet-btn">
  connect wallet
</button>

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
<span className="wallet-address-text">
  current view wallet:{" "}
  {walletAddress ? (
    <>
      {formatAddress(walletAddress)}
      <a
        href={`https://explorer.inkonchain.com/address/${walletAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="wallet-explorer-link"
      >
        🔗
      </a>
    </>
  ) : (
    "none selected"
  )}
</span>
                      </span>

{walletAddress && (
  <button
    type="button"
    className="wallet-copy-icon-btn"
    aria-label="Copy address"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  </button>
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
                        </div>
                      </div>

{hasHistory ? (
  <div className="portfolio-sub-row premium-sub-row">
    {/* percent pill on the left */}
    <span
      className={`portfolio-change-pill ${isUp ? "pill-up" : "pill-down"}`}
      style={{ marginRight: "8px" }}
    >
      <span className="change-arrow">{isUp ? "▲" : "▼"}</span>
      <span className="change-pct">{changePct.toFixed(2)}%</span>
    </span>

    {/* dollar change on the right */}
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
  <div className="ink-divider"></div>
<div className="positions-header-row">
  <div className="portfolio-title-stack">
    <div className="section-title">PORTFOLIO</div>
    <div className="section-subtitle">on ink</div>
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
{positionsTab === 'wallet' && (
  <div className='positions-table wallet-table'>
    {/* table header */}
    <div className='positions-row positions-row-head wallet-head'>
      <span className='col-token wallet-head-col'>Token</span>
      <span className='col-price wallet-head-col'>Price</span>
      <span className='col-amount wallet-head-col'>Amount</span>
      <span className='col-value wallet-head-col'>Value (USD)</span>
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
      <span className="col-value"></span>
    </div>
  )}


      {/* real tokens from api */}
{!isLoadingPortfolio &&
  !portfolioError &&
  portfolio &&
  visibleTokens.map((t) => {
const price = t.priceUsd ?? 0
const value = t.valueUsd ?? price * t.balance


          return (
            <div
              className="positions-row"
              key={t.address || t.symbol}
            >
              <span className="col-token">
                <span className="token-icon">
{t.iconUrl || tokenIcons[t.address.toLowerCase()] ? (
  <img
    src={t.iconUrl || tokenIcons[t.address.toLowerCase()]}

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
<div className="positions-row positions-row-head tx-row-head nft-head">

  {/* PROTOCOL */}
  <span className="col-token nft-head-col" style={{ width: "25%" }}>
    Protocol
  </span>

  {/* POOL */}
  <span className="col-token nft-head-col" style={{ width: "30%" }}>
    Pool
  </span>

  {/* BALANCE */}
  <span className="col-amount nft-head-col" style={{ width: "15%", textAlign: "center" }}>
    Balance
  </span>

  {/* REWARDS */}
  <span className="col-amount nft-head-col" style={{ width: "15%", textAlign: "center" }}>
    Rewards
  </span>

  {/* VALUE */}
  <span className="col-value nft-head-col" style={{ width: "15%", textAlign: "right" }}>
    Value (USD)
  </span>

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

    {/* PROTOCOL */}
    <span className="col-token" style={{ width: "25%", display: "flex", alignItems: "center" }}>
      {platform}
    </span>

    {/* POOL */}
    <span className="col-token" style={{ width: "30%", minWidth: 0 }}>
      {label}
    </span>

    {/* BALANCE */}
    <span className="col-amount" style={{ width: "15%", textAlign: "center" }}>
      {amount ? amount.toFixed(4) : "-"}
    </span>

    {/* REWARDS */}
    <span className="col-amount" style={{ width: "15%", textAlign: "center" }}>
      {apr ? `${apr.toFixed(2)}%` : "-"}
    </span>

    {/* VALUE */}
    <span className="col-value" style={{ width: "15%", textAlign: "right" }}>
      {`$${depositedUsd.toFixed(2)}`}
    </span>

  </div>
);
      })}
  </div>
)}



{/* TAB 3: NFTs */}
{positionsTab === 'nfts' && (
  <div className='positions-table nft-table'>


    {/* header */}
<div className='positions-row positions-row-head nft-head'>
  {/* 1. collection */}
  <span className='col-token nft-head-col'>
    Collection
  </span>

  {/* 2. spacer */}
  <span />

  {/* 3. balance (sortable) */}
  <span
    className='col-amount nft-head-col'
    style={{ display: 'flex', justifyContent: 'center' }}
    onClick={() => handleNftSort('balance')}
  >
    <span className='nft-sort-label'>
      Balance
      <span className='nft-sort-arrow'>
        {nftSortBy === 'balance'
          ? nftSortDir === 'asc'
            ? '▲'
            : '▼'
          : '↕'}
      </span>
    </span>
  </span>

  {/* 4. total spent (sortable) */}
  <span
    className='col-value nft-head-col'
    style={{ textAlign: 'right' }}
    onClick={() => handleNftSort('spent')}
  >
    <span className='nft-sort-label'>
      Total spent
      <span className='nft-sort-arrow'>
        {nftSortBy === 'spent'
          ? nftSortDir === 'asc'
            ? '▲'
            : '▼'
          : '↕'}
      </span>
    </span>
  </span>

  {/* 5. floor */}
  <span
    className='col-value nft-head-col'
    style={{ textAlign: 'right' }}
  >
    Floor (USD)
  </span>
</div>


    {/* rows */}
{sortedNfts.map(col => {
  const firstToken = col.tokens[0];

  return (
    <div className='positions-row' key={col.address}>
      {/* 1. collection */}
      <span
        className='col-token'
        style={{
          display: 'flex',
          alignItems: 'center',
          minWidth: 0,
        }}
      >
        <span className='token-icon'>
          {firstToken?.imageUrl ? (
            <img
              src={firstToken.imageUrl}
              className='token-icon-img'
              alt={col.name}
            />
          ) : (
            (col.symbol || '?').slice(0, 3).toUpperCase()
          )}
        </span>

        <a
          className='nft-collection-link'
          href={`https://explorer.inkonchain.com/token/${col.address}?tab=holders`}
          target='_blank'
          rel='noreferrer'
          style={{
            marginLeft: 12,
            flex: 1,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {col.name}
        </a>
      </span>

      {/* 2. spacer */}
      <span />

      {/* 3. balance */}
      <span
        className='col-amount'
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {col.ownedCount || col.tokens.length}
      </span>

      {/* 4. total spent */}
<span
  className='col-value'
  style={{ textAlign: 'right' }}
>
  {(() => {
    const key = (col.address || '').toLowerCase()
    const spent = perCollectionSpentUsd[key]
    return spent != null && spent > 0
      ? `$${spent.toFixed(2)}`
      : '-'
  })()}
</span>



      {/* 5. floor value placeholder for now */}
      <span
        className='col-value'
        style={{ textAlign: 'right' }}
      >
        -
      </span>
    </div>
  );
})}

  </div>
)}


    {/* TAB 4: transactions */}
{positionsTab === "transactions" && (
  <div
className="positions-table tx-table"
  >

    {/* filter input */}
    <div
      className="search-wrapper"
      style={{
        marginBottom: 8,
        maxWidth: 280,
        position: "relative",
      }}
    >
      <span className="search-icon">
        <svg width="14" height="14" viewBox="0 0 24 24">
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
          />
          <line
            x1="16"
            y1="16"
            x2="21"
            y2="21"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <input
        placeholder={
          txSelectedToken
            ? `Filter by token: ${txSelectedToken.symbol}`
            : "Filter by token or contract"
        }
        value={txTokenQuery}
        onChange={(e) => {
          setTxTokenQuery(e.target.value);
          setTxTokenDropdownOpen(true);
        }}
        onFocus={() => {
          if (txTokenQuery.trim()) setTxTokenDropdownOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        onBlur={() => {
          setTimeout(() => setTxTokenDropdownOpen(false), 120);
        }}
      />

      {(txTokenQuery || txSelectedToken) && (
        <button
          type="button"
          onClick={() => {
            setTxTokenQuery("");
            setTxSelectedToken(null);
            setTxTokenDropdownOpen(false);
            setTxPage(1);
          }}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 14,
            opacity: 0.7,
          }}
        >
          ×
        </button>
      )}

{txTokenDropdownOpen && txTokenSuggestions.length > 0 && (
  <div className="tx-token-dropdown">
    {txTokenSuggestions.map((tok) => {
      const addrKey = tok.address.toLowerCase();
      const portfolioToken =
        portfolio?.tokens.find(
          (t) => t.address && t.address.toLowerCase() === addrKey
        ) || null;

      const iconSrc = tokenIcons[addrKey] || portfolioToken?.iconUrl || null;

      return (
        <button
          key={tok.address}
          type="button"
          className="tx-token-item"
          onMouseDown={(e) => {
            e.preventDefault();
            setTxSelectedToken(tok);
            setTxTokenQuery(tok.symbol || tok.address);
            setTxTokenDropdownOpen(false);
            setTxPage(1);
            setTxHasMore(false);
          }}
        >
          <span className="tx-token-avatar">
            {iconSrc ? (
              <img
                src={iconSrc}
                alt={tok.symbol || 'token'}
                className="tx-token-avatar-img"
              />
            ) : (
              (tok.symbol || '?')[0].toUpperCase()
            )}
          </span>

          <div className="tx-token-meta">
            <span className="tx-token-symbol">{tok.symbol}</span>
            <span className="tx-token-address">
              {tok.address.slice(0, 6)}...{tok.address.slice(-4)}
            </span>
          </div>
        </button>
      );
    })}
  </div>
)}
    </div>

    {/* FULL PAGE LOADER */}
{showTxFullLoader ? (
  <div className='tx-full-loader'>
    <div className='tx-full-spinner' />
  </div>
) : (
  <>
        {/* header */}
        <div className="positions-row positions-row-head tx-row-head">
          <span className="col-a">Date / Hash</span>
          <span className="col-b">Platform</span>
          <span className="col-c">Type</span>
          <span className="col-d">Fee</span>
        </div>

        {/* error */}
        {txError && (
          <div className="positions-row positions-row-empty">
            <span className="col-a">{txError}</span>
            <span className="col-b"></span>
            <span className="col-c"></span>
            <span className="col-d"></span>
          </div>
        )}

        {/* empty */}
        {!txError && walletAddress && filteredTxs.length === 0 && (
          <div className="positions-row positions-row-empty">
            <span className="col-a">no transactions found</span>
            <span className="col-b"></span>
            <span className="col-c"></span>
            <span className="col-d"></span>
          </div>
        )}

        {/* rows */}
{filteredTxs.map((tx) => {

  const legs = parseTxDetails(tx.details);

  const hasOut = legs.some((l) => l.direction === "out");
  const hasIn = legs.some((l) => l.direction === "in");
  const isSwapLike = hasOut && hasIn && legs.length >= 2;

  const allIn = legs.length > 0 && legs.every((l) => l.direction === "in");
  const allOutOnly = legs.length > 0 && legs.every((l) => l.direction === "out");

  const lowerDetails = (tx.details || "").toLowerCase();
  const methodName = (tx.method || "").trim();

  const contractName = tx.toLabel || "";
  const contractNameLower = contractName.toLowerCase();

  const hasGmToken = tx.tokens.some((t) =>
    (t.symbol || "").toLowerCase().includes("gm")
  );

  let platformMain = "Contract";
  let platformSub: string | null = null;
  let platformClass = "contract";

    // prefer the explorer style "contract name" if we have it
  let contractDisplay = '';

  if (tx.toLabel && tx.toLabel.trim().length > 0) {
    const trimmed = tx.toLabel.trim();
    // if the label itself looks like a raw address, shorten it
    contractDisplay =
      trimmed.startsWith('0x') && trimmed.length > 14
        ? formatAddress(trimmed)
        : trimmed;
  } else {
    contractDisplay = formatAddress(tx.to);
  }


  // gm style app
  if (
    methodName.toLowerCase() === "gm" ||
    lowerDetails.includes("gm") ||
    contractNameLower.includes("ink gm") ||
    hasGmToken
  ) {
    platformMain = "gm";
    platformSub = contractName || "Ink GM";
    platformClass = "app";
  }
  // approvals
  else if (lowerDetails.includes("approve")) {
    platformMain = methodName || "Approve";
    const firstSym = tx.tokens[0]?.symbol;
    platformSub = contractName || firstSym || "Token";
    platformClass = "approval";
  }
  // swaps and routers
  else if (isSwapLike || lowerDetails.includes("swap")) {
    platformMain = methodName || "Swap";
    platformSub = contractName || "DEX trade";
    platformClass = "swap";
  }
  // nft transfers
  else if (tx.hasNft) {
    platformMain = "NFT";
    platformSub = contractName || "Transfer";
    platformClass = "nft";
  }
  // token or native send only
  else if (allOutOnly) {
    platformMain = "Send";
    platformSub = contractName || formatAddress(tx.otherParty);
    platformClass = "send";
  }
  // token or native receive only  airdrops rewards etc
  else if (allIn) {
    platformMain = "Receive";
    platformSub = contractName || formatAddress(tx.otherParty);
    platformClass = "receive";
  }



return (
  <div
    className={`positions-row tx-row ${
      isSwapLike ? "swap-row" : ""
    }`}
    key={tx.hash}
  >
              <span className="col-a">
                <div>{formatDateTimeLabel(tx.timestamp)}</div>
                <a
                  href={`https://explorer.inkonchain.com/tx/${tx.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="tx-hash"
                >
                  {formatAddress(tx.hash)}
                </a>
              </span>

{/* col B: debank style platform */}
<span className="col-b">
  {(() => {
// Determine which icon to use
let iconKey = '';
const toAddr = (tx.to || '').toLowerCase();
const platformIcon = PLATFORM_ICONS[toAddr];

// prefer platform icon if we know this contract
if (platformIcon) {
  iconKey = platformIcon;
} else if (platformMain === 'Send') {
  iconKey = 'send';
} else if (platformMain === 'Receive') {
  iconKey = 'receive';
} else {
  iconKey = '';
}



    return (
      <div className="tx-platform-block">
        {/* BIG square icon */}
        <div className="tx-big-icon-wrapper">
          {iconKey ? (
            <img
              src={`/platforms/${iconKey}.svg`}
              alt={tx.toLabel}
              className="tx-big-icon"
            />
          ) : (
            <div className="tx-big-icon tx-big-icon-placeholder"></div>
          )}
        </div>

        {/* Texts */}
        <div className="tx-platform-meta">
          {/* METHOD */}
          {tx.method && (
            <div className="tx-method-text">{tx.method}</div>
          )}

          {/* PLATFORM NAME — clickable search */}
          <div
            className="tx-platform-text"
            onClick={() => {
              const trimmed = tx.to?.trim()
              if (!trimmed) return
              setSearchInput(trimmed)
              setWalletAddress(trimmed)
              setNetWorthHistory([])
              setHoverIndex(null)
              setTxPage(1)
            }}
            title={tx.to}
          >
            {contractDisplay}
          </div>
        </div>
      </div>
    );
  })()}
</span>


<span className="col-c">
  {(() => {
    const rawLegs = parseTxDetails(tx.details);

    if (rawLegs.length === 0) {
      return <div className="tx-title">{tx.details}</div>;
    }

    // group by direction + symbol
    const groupMap: Record<string, TxLeg> = {};

    for (const leg of rawLegs) {
      const key =
        leg.direction + ":" + (leg.symbol || "").toUpperCase();

      if (!groupMap[key]) {
        groupMap[key] = {
          direction: leg.direction,
          amount: leg.amount,
          symbol: leg.symbol,
        };
      } else {
        const prevAmt = groupMap[key].amount ?? 0;
        const curAmt = leg.amount ?? 0;
        groupMap[key].amount = prevAmt + curAmt;
      }
    }

    // turn map into array
    const legs = Object.values(groupMap);

    // outs first, then ins
    legs.sort((a, b) => {
      if (a.direction === b.direction) return 0;
      return a.direction === "out" ? -1 : 1;
    });

    return (
      <>
        {legs.slice(0, 4).map((leg, idx) => {
          const sign = leg.direction === "out" ? "-" : "+";
          const lineClass =
            leg.direction === "out"
              ? "tx-amount-line tx-out"
              : "tx-amount-line tx-in";

// 1) always resolve symbol first
const symbolUpper = (leg.symbol || '').toUpperCase();

// 2) native coin override: ETH / INK always forced
if (symbolUpper === 'ETH') {
  const iconSrc = 'https://assets.coingecko.com/coins/images/279/large/ethereum.png';
  const priceUsd = nativeUsdPrice || undefined;
  const valueUsd =
    leg.amount != null && priceUsd != null
      ? leg.amount * priceUsd
      : null;

  return (
    <div key={idx} className={lineClass}>
      <div className="tx-amount-icon">
        <img src={iconSrc} alt="ETH" className="tx-amount-icon-img" />
      </div>
      <span className="tx-amount-symbol">
        {sign} {leg.amount?.toFixed(4)} ETH
        {valueUsd != null ? ` ($${valueUsd.toFixed(2)})` : ''}
      </span>
    </div>
  );
}

if (symbolUpper === 'INK') {
  const iconSrc = 'https://explorer.inkonchain.com/images/token.png';
  const priceUsd = nativeUsdPrice || undefined;
  const valueUsd =
    leg.amount != null && priceUsd != null
      ? leg.amount * priceUsd
      : null;

  return (
    <div key={idx} className={lineClass}>
      <div className="tx-amount-icon">
        <img src={iconSrc} alt="INK" className="tx-amount-icon-img" />
      </div>
      <span className="tx-amount-symbol">
        {sign} {leg.amount?.toFixed(4)} INK
        {valueUsd != null ? ` ($${valueUsd.toFixed(2)})` : ''}
      </span>
    </div>
  );
}

// 3) all other tokens continue normally
const matchToken =
  tx.tokens.find(
    (t) =>
      (t.symbol || '').toUpperCase() === symbolUpper
  ) || tx.tokens[idx];

let addrKey = matchToken?.address
  ? matchToken.address.toLowerCase().trim()
  : '';

let portfolioToken =
  portfolio?.tokens.find(
    (t) => t.address && t.address.toLowerCase() === addrKey
  ) || null;

// fallback match by symbol if only one
if (!portfolioToken && leg.symbol && portfolio?.tokens) {
  const candidates = portfolio.tokens.filter(
    (t) => (t.symbol || '').toUpperCase() === symbolUpper
  );
  if (candidates.length === 1) {
    portfolioToken = candidates[0];
    if (!addrKey && portfolioToken.address) {
      addrKey = portfolioToken.address.toLowerCase();
    }
  }
}

// final icon (non-native)
const iconSrc =
  portfolioToken?.iconUrl ||
  (addrKey && tokenIcons[addrKey]) ||
  null;

const priceUsd =
  addrKey && tokenPriceMap[addrKey] != null
    ? tokenPriceMap[addrKey]
    : undefined;

const valueUsd =
  leg.amount != null && priceUsd != null
    ? leg.amount * priceUsd
    : null;



          return (
            <div key={idx} className={lineClass}>
              <div className="tx-amount-icon">
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt={leg.symbol || "token"}
                    className="tx-amount-icon-img"
                  />
                ) : (
                  (leg.symbol || "T")[0].toUpperCase()
                )}
              </div>

              <span className="tx-amount-symbol">
                {sign}{" "}
                {leg.amount != null ? leg.amount.toFixed(4) : ""}{" "}
                {leg.symbol}
                {valueUsd != null
                  ? ` ($${valueUsd.toFixed(2)})`
                  : ""}
              </span>
            </div>
          );
        })}

{tx.hasNft && tx.tokens.length > 0 && (
  <div className="tx-nft-preview real-nft">
<img
  src={tokenIcons[tx.tokens[0].address.toLowerCase()] || "/nft.png"}
      className="tx-nft-img"
      alt="NFT"
    />
    <span className="tx-nft-name">
      {tx.tokens[0].symbol || "NFT"}
    </span>
  </div>
)}
      </>
    );
  })()}
</span>

              <span className="col-d">
                {tx.gasFeeInk?.toFixed(6) || "-"}
                {tx.gasFeeUsd && (
                  <div className="fee-usd">
                    ${tx.gasFeeUsd.toFixed(4)}
                  </div>
                )}
              </span>
            </div>
          );
        })}

{txHasMore && walletAddress && (
  <div
    className='positions-row positions-row-empty'
    style={{ justifyContent: 'center' }}
  >
    <button
      className='wallet-action-btn'
      onClick={() => setTxPage(p => p + 1)}
      disabled={isLoadingTxs}
    >
      {isLoadingTxs ? 'loading...' : 'load more'}
    </button>
  </div>
)}
      </>
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
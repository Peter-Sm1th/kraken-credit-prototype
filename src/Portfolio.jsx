import { useState, useEffect, useRef } from 'react';
import './Portfolio.css';
import successImage from './assets/success.png';


const SHEET_ANIMATION_MS = 300;
const PUSH_ANIMATION_MS = 300;

const COINGECKO_MARKETS_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,ripple,solana,usd-coin,cardano,dogecoin,tron,wrapped-bitcoin,chainlink&order=market_cap_desc';

const FALLBACK_PRICES = { btc: 69538, eth: 2063, sol: 89 };

const PORTFOLIO_HOLDINGS = {
  btc: 0.0599,
  eth: 1.46,
  sol: 8.0,
};
const CASH_BALANCE = 2000;

const POPULAR_ASSETS = [
  { name: 'Bitcoin', ticker: 'BTC', coinId: 'bitcoin', priceId: 'btc', change: 3.08, apr: '0.1% APR', icon: 'btc' },
  { name: 'Ethereum', ticker: 'ETH', coinId: 'ethereum', priceId: 'eth', change: 3.9, apr: '1-3% APR', icon: 'eth' },
  { name: 'Tether USD', ticker: 'USDT', coinId: 'tether', priceId: null, staticPrice: 1, change: 0.02, apr: null, icon: 'usdt' },
  { name: 'XRP', ticker: 'XRP', coinId: 'ripple', priceId: null, staticPrice: 2.48, change: 8.09, apr: null, icon: 'xrp' },
  { name: 'Solana', ticker: 'SOL', coinId: 'solana', priceId: 'sol', change: 6.14, apr: '4-7% APR', icon: 'sol' },
  { name: 'USDC', ticker: 'USDC', coinId: 'usd-coin', priceId: null, staticPrice: 0.9999, change: 0.01, apr: null, icon: 'usdc' },
  { name: 'Cardano', ticker: 'ADA', coinId: 'cardano', priceId: null, staticPrice: 0.7323, change: 3.01, apr: '2-5% APR', icon: 'ada' },
  { name: 'Dogecoin', ticker: 'DOGE', coinId: 'dogecoin', priceId: null, staticPrice: 0.1746, change: 4.13, apr: null, icon: 'doge' },
  { name: 'TRON', ticker: 'TRX', coinId: 'tron', priceId: null, staticPrice: 0.2316, change: -0.76, apr: null, icon: 'trx' },
  { name: 'Wrapped Bitcoin', ticker: 'WBTC', coinId: 'wrapped-bitcoin', priceId: 'btc', change: 2.32, apr: null, icon: 'btc' },
  { name: 'Chainlink', ticker: 'LINK', coinId: 'chainlink', priceId: null, staticPrice: 14.7, change: 5.37, apr: null, icon: 'link' },
];

function formatPrice(value) {
  if (value == null || Number.isNaN(value)) return '—';
  if (value >= 1) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

function CoinLogo({ coinId, coinsById, fallbackLetter, className = '' }) {
  const coin = coinsById[coinId];
  const src = coin?.image;
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`coin-logo ${className}`.trim()}
        width={40}
        height={40}
        loading="lazy"
      />
    );
  }
  return (
    <div className={`coin-logo-fallback ${className}`.trim()} aria-hidden>
      {fallbackLetter}
    </div>
  );
}

function StatusBar() {
  return (
    <div
      className="status-bar-ios"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px 8px',
        width: '100%',
      }}
    >
      <span style={{ color: 'white', fontSize: '15px', fontWeight: 600 }}>
        9:41
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="13" viewBox="0 0 20 13" fill="none" aria-hidden>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.2 1.14623C19.2 0.513183 18.7224 0 18.1333 0H17.0667C16.4776 0 16 0.513183 16 1.14623V11.0802C16 11.7132 16.4776 12.2264 17.0667 12.2264H18.1333C18.7224 12.2264 19.2 11.7132 19.2 11.0802V1.14623ZM11.7659 2.44528H12.8326C13.4217 2.44528 13.8992 2.97078 13.8992 3.61902V11.0527C13.8992 11.7009 13.4217 12.2264 12.8326 12.2264H11.7659C11.1768 12.2264 10.6992 11.7009 10.6992 11.0527V3.61902C10.6992 2.97078 11.1768 2.44528 11.7659 2.44528ZM7.43411 5.09433H6.36745C5.77834 5.09433 5.30078 5.62652 5.30078 6.28301V11.0377C5.30078 11.6942 5.77834 12.2264 6.36745 12.2264H7.43411C8.02322 12.2264 8.50078 11.6942 8.50078 11.0377V6.28301C8.50078 5.62652 8.02322 5.09433 7.43411 5.09433ZM2.13333 7.53962H1.06667C0.477563 7.53962 0 8.06421 0 8.71132V11.0547C0 11.7018 0.477563 12.2264 1.06667 12.2264H2.13333C2.72244 12.2264 3.2 11.7018 3.2 11.0547V8.71132C3.2 8.06421 2.72244 7.53962 2.13333 7.53962Z"
            fill="white"
          />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="13" viewBox="0 0 18 13" fill="none" aria-hidden>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.5713 2.46628C11.0584 2.46639 13.4504 3.38847 15.2529 5.04195C15.3887 5.1696 15.6056 5.16799 15.7393 5.03834L17.0368 3.77487C17.1045 3.70911 17.1422 3.62004 17.1417 3.52735C17.1411 3.43467 17.1023 3.34603 17.0338 3.28104C12.3028 -1.09368 4.83907 -1.09368 0.108056 3.28104C0.039524 3.34598 0.000639766 3.4346 7.82398e-06 3.52728C-0.000624118 3.61996 0.0370483 3.70906 0.104689 3.77487L1.40255 5.03834C1.53615 5.16819 1.75327 5.1698 1.88893 5.04195C3.69167 3.38836 6.08395 2.46628 8.5713 2.46628ZM8.56795 6.68656C9.92527 6.68647 11.2341 7.19821 12.2403 8.12234C12.3763 8.2535 12.5907 8.25065 12.7234 8.11593L14.0106 6.79663C14.0784 6.72742 14.1161 6.63355 14.1151 6.536C14.1141 6.43844 14.0746 6.34536 14.0054 6.27757C10.9416 3.38672 6.19688 3.38672 3.13305 6.27757C3.06384 6.34536 3.02435 6.43849 3.02345 6.53607C3.02254 6.63366 3.06028 6.72752 3.12822 6.79663L4.41513 8.11593C4.54778 8.25065 4.76215 8.2535 4.89823 8.12234C5.90368 7.19882 7.21152 6.68713 8.56795 6.68656ZM11.0924 9.48011C11.0943 9.58546 11.0572 9.68703 10.9899 9.76084L8.81327 12.2156C8.74946 12.2877 8.66247 12.3283 8.5717 12.3283C8.48093 12.3283 8.39394 12.2877 8.33013 12.2156L6.1531 9.76084C6.08585 9.68697 6.04886 9.58537 6.05085 9.48002C6.05284 9.37467 6.09365 9.27491 6.16364 9.20429C7.55374 7.8904 9.58966 7.8904 10.9798 9.20429C11.0497 9.27497 11.0904 9.37476 11.0924 9.48011Z"
            fill="white"
          />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="13" viewBox="0 0 28 13" fill="none" aria-hidden>
          <rect opacity="0.35" x="0.5" y="0.5" width="24" height="12" rx="3.8" stroke="white" />
          <path opacity="0.4" d="M26 4.78125V8.85672C26.8047 8.51155 27.328 7.70859 27.328 6.81899C27.328 5.92938 26.8047 5.12642 26 4.78125" fill="white" />
          <rect x="2" y="2" width="21" height="9" rx="2.5" fill="white" />
        </svg>
      </div>
    </div>
  );
}

function Portfolio() {
  const [tradeSheetOpen, setTradeSheetOpen] = useState(false);
  const [sheetClosing, setSheetClosing] = useState(false);
  const [buyPageOpen, setBuyPageOpen] = useState(false);
  const [buyPageClosing, setBuyPageClosing] = useState(false);
  const [coins, setCoins] = useState([]);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [buyCoinScreenOpen, setBuyCoinScreenOpen] = useState(false);
  const [buyCoinScreenClosing, setBuyCoinScreenClosing] = useState(false);
  const [buyAmount, setBuyAmount] = useState('0');
  const [payWithSheetOpen, setPayWithSheetOpen] = useState(false);
  const [payWithClosing, setPayWithClosing] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState({
    id: 'cash',
    label: 'Cash (USD)',
    amount: '$2,000',
    meta: 'Available',
  });
  const [creditDetailsSheetOpen, setCreditDetailsSheetOpen] = useState(false);
  const [creditSheetClosing, setCreditSheetClosing] = useState(false);
  const [confirmScreenOpen, setConfirmScreenOpen] = useState(false);
  const [confirmScreenClosing, setConfirmScreenClosing] = useState(false);
  const [ackBorrow, setAckBorrow] = useState(false);
  const [ackWithdraw, setAckWithdraw] = useState(false);
  const [confirmedScreenOpen, setConfirmedScreenOpen] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const amountInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setPricesLoading(true);
    fetch(COINGECKO_MARKETS_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setCoins(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setCoins([]);
      })
      .finally(() => {
        if (!cancelled) setPricesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const coinsById = Object.fromEntries((coins || []).map((c) => [c.id, c]));
  const btcPrice = coinsById.bitcoin?.current_price ?? FALLBACK_PRICES.btc;
  const ethPrice = coinsById.ethereum?.current_price ?? FALLBACK_PRICES.eth;
  const solPrice = coinsById.solana?.current_price ?? FALLBACK_PRICES.sol;
  const prices = { btc: btcPrice, eth: ethPrice, sol: solPrice };
  const btcValue = PORTFOLIO_HOLDINGS.btc * btcPrice;
  const ethValue = PORTFOLIO_HOLDINGS.eth * ethPrice;
  const solValue = PORTFOLIO_HOLDINGS.sol * solPrice;
  const totalValue = btcValue + ethValue + solValue + CASH_BALANCE;

  const getPayMethodConfig = (id) => {
    const configs = {
      credit: { id: 'credit', label: 'Credit line', amount: '$5,000', meta: 'Available' },
      cash: { id: 'cash', label: 'Cash (USD)', amount: '$2,000', meta: 'Available' },
      apple: { id: 'apple', label: 'Apple Pay', amount: '$5,000', meta: 'Limit' },
      visa: { id: 'visa', label: 'Visa', amount: '$5,000', meta: 'Limit' },
      bitcoin: {
        id: 'bitcoin',
        label: 'Bitcoin',
        amount: formatPrice(btcValue),
        meta: `${PORTFOLIO_HOLDINGS.btc} BTC`,
      },
      ethereum: {
        id: 'ethereum',
        label: 'Ethereum',
        amount: formatPrice(ethValue),
        meta: `${PORTFOLIO_HOLDINGS.eth} ETH`,
      },
    };
    return configs[id] || configs.apple;
  };

  const closeSheet = () => {
    setSheetClosing(true);
    setTimeout(() => {
      setTradeSheetOpen(false);
      setSheetClosing(false);
    }, SHEET_ANIMATION_MS);
  };

  const openBuyPage = () => {
    setSheetClosing(true);
    setBuyPageOpen(true);
    setTimeout(() => {
      setTradeSheetOpen(false);
      setSheetClosing(false);
    }, SHEET_ANIMATION_MS);
  };

  const closeBuyPage = () => {
    setBuyPageClosing(true);
    setTimeout(() => {
      setBuyPageOpen(false);
      setBuyPageClosing(false);
    }, PUSH_ANIMATION_MS);
  };

  const openBuyCoinScreen = (asset) => {
    const coin = coinsById[asset.coinId];
    const currentPrice =
      coin?.current_price ??
      (asset.priceId ? (prices[asset.priceId] ?? FALLBACK_PRICES[asset.priceId]) : asset.staticPrice) ??
      0;
    setSelectedCoin({
      name: asset.name,
      ticker: asset.ticker,
      image: coin?.image ?? null,
      currentPrice: Number(currentPrice),
    });
    setBuyCoinScreenOpen(true);
  };

  const closeBuyCoinScreen = () => {
    setBuyCoinScreenClosing(true);
    setTimeout(() => {
      setBuyCoinScreenOpen(false);
      setBuyCoinScreenClosing(false);
      setSelectedCoin(null);
      setBuyAmount('0');
    }, PUSH_ANIMATION_MS);
  };

  const openPayWith = () => {
    // Step 1: open Pay with sheet, ensure credit details sheet is closed
    setPayWithSheetOpen(true);
    setPayWithClosing(false);
    setCreditDetailsSheetOpen(false);
  };

  const closePayWith = () => {
    setPayWithClosing(true);
    setTimeout(() => {
      setPayWithSheetOpen(false);
      setPayWithClosing(false);
    }, SHEET_ANIMATION_MS);
  };

  const openCreditSheet = () => {
    setCreditDetailsSheetOpen(true);
    setCreditSheetClosing(false);
  };

  const closeCreditSheet = (afterClose) => {
    setCreditSheetClosing(true);
    setTimeout(() => {
      setCreditDetailsSheetOpen(false);
      setCreditSheetClosing(false);
      if (afterClose) afterClose();
    }, SHEET_ANIMATION_MS);
  };

  const openConfirmScreen = () => {
    setAckBorrow(false);
    setAckWithdraw(false);
    // Ensure any funding sheets are fully closed before showing confirmation
    setPayWithSheetOpen(false);
    setPayWithClosing(false);
    setCreditDetailsSheetOpen(false);
    setCreditSheetClosing(false);
    setConfirmScreenOpen(true);
  };

  const closeConfirmScreen = () => {
    setConfirmScreenClosing(true);
    setTimeout(() => {
      setConfirmScreenOpen(false);
      setConfirmScreenClosing(false);
    }, PUSH_ANIMATION_MS);
  };

  const openConfirmedScreen = () => {
    setConfirmedScreenOpen(true);
  };

  const closeConfirmedScreen = () => {
    // Reset all transient state so the demo can be re-run without a refresh
    setConfirmedScreenOpen(false);
    setConfirmScreenOpen(false);
    setConfirmScreenClosing(false);
    setTradeSheetOpen(false);
    setSheetClosing(false);
    setBuyPageOpen(false);
    setBuyPageClosing(false);
    setBuyCoinScreenOpen(false);
    setBuyCoinScreenClosing(false);
    setPayWithSheetOpen(false);
    setPayWithClosing(false);
    setCreditDetailsSheetOpen(false);
    setCreditSheetClosing(false);
    setSelectedCoin(null);
    setBuyAmount('0');
    setAckBorrow(false);
    setAckWithdraw(false);
    setSelectedPayMethod(getPayMethodConfig('cash'));
  };

  const handleSelectPayMethod = (method) => {
    console.log('Selected payment method:', method.id);
    setSelectedPayMethod(method);
    if (method.id === 'credit') {
      console.log('Credit selected - closing pay with sheet');
      setPayWithClosing(true);
      setTimeout(() => {
        console.log('Pay with closed - opening credit sheet');
        setPayWithSheetOpen(false);
        setPayWithClosing(false);
        setCreditDetailsSheetOpen(true);
        setCreditSheetClosing(false);
        console.log('creditDetailsSheetOpen should now be true');
      }, 750);
    } else {
      closePayWith();
    }
  };

  const handleKeyboardInput = (rawValue) => {
    if (typeof rawValue !== 'string') return;
    let value = rawValue.replace(/[^0-9.]/g, '');
    const firstDot = value.indexOf('.');
    if (firstDot !== -1) {
      const before = value.slice(0, firstDot + 1);
      const after = value.slice(firstDot + 1).replace(/\./g, '');
      value = before + after;
    }
    if (value === '' || value === '.') {
      setBuyAmount('0');
      return;
    }
    if (value.startsWith('0') && !value.startsWith('0.')) {
      const num = parseFloat(value);
      value = Number.isNaN(num) ? '0' : String(num);
    }
    setBuyAmount(value);
  };

  const onKeypadInput = (key) => {
    if (key === 'back') {
      setBuyAmount((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
      return;
    }
    if (key === '.') {
      setBuyAmount((prev) => (prev.includes('.') ? prev : prev === '0' ? '0.' : prev + '.'));
      return;
    }
    const digit = String(key);
    setBuyAmount((prev) => (prev === '0' && digit !== '.' ? digit : prev + digit));
  };

  const mainPushed = buyPageOpen && !buyPageClosing;
  const buyAmountNum = parseFloat(String(buyAmount).replace(/,/g, '')) || 0;
  const orderUsd = buyAmountNum;
  const orderCrypto =
    selectedCoin && selectedCoin.currentPrice
      ? orderUsd / selectedCoin.currentPrice
      : 0;
  const feeUsd = orderUsd * 0.01;
  const totalUsd = orderUsd + feeUsd;
  const isCreditOnly = selectedPayMethod.id === 'credit';
  const isCashPlusCredit = selectedPayMethod.id === 'cash+credit';
  const creditPortion =
    isCreditOnly ? orderUsd : isCashPlusCredit ? Math.max(0, orderUsd - CASH_BALANCE) : 0;
  const cashPortion = Math.max(0, totalUsd - creditPortion - feeUsd);
  const borrowedAmount = creditPortion;
  const interestDaily = borrowedAmount * (0.1 / 365);
  const interestMonthly = borrowedAmount * (0.1 / 12);
  const interestAnnual = borrowedAmount * 0.1;
  const totalForSplit = totalUsd > 0 ? totalUsd : 0;
  const cashShare = totalForSplit > 0 ? (cashPortion / totalForSplit) * 100 : 0;
  const creditShare = totalForSplit > 0 ? (creditPortion / totalForSplit) * 100 : 0;
  const showCreditPrompt =
    buyAmountNum > CASH_BALANCE && selectedPayMethod.id === 'cash';
  const creditPromptExcess = showCreditPrompt ? buyAmountNum - CASH_BALANCE : 0;

  const handleAddCreditForRemainder = (e) => {
    e.stopPropagation();
    setSelectedPayMethod({
      id: 'cash+credit',
      label: 'Cash + Credit',
      cashAmount: CASH_BALANCE,
      creditAmount: buyAmountNum - CASH_BALANCE,
      total: buyAmountNum,
    });
    setTimeout(() => {
      setCreditDetailsSheetOpen(true);
      setCreditSheetClosing(false);
    }, 750);
  };

  return (
    <div className="portfolio-screen">
      <StatusBar />
      <div className="portfolio-screen-content">
      <div className={`portfolio-main ${mainPushed ? 'portfolio-main--pushed' : ''}`}>
      {/* Main header */}
      <section className="portfolio-header">
        <div className="header-left">
          <div className="avatar">PS</div>
          <div className="header-text">
            <h1 className="portfolio-title">Portfolio</h1>
            <p className={`portfolio-balance ${pricesLoading ? 'portfolio-balance--loading' : ''}`}>
              {pricesLoading ? '...' : formatPrice(totalValue)}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="icon-btn" aria-label="More options">
            <MoreIcon />
          </button>
          <button type="button" className="icon-btn" aria-label="Notifications">
            <BellIcon />
          </button>
        </div>
      </section>

      {/* Chart area */}
      <section className="chart-area">
        <svg viewBox="0 0 350 120" className="chart-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(125, 0, 255, 0.25)" />
              <stop offset="100%" stopColor="rgba(125, 0, 255, 0)" />
            </linearGradient>
          </defs>
          <path
            className="chart-line"
            d="M 0 80 Q 45 70, 90 75 T 180 50 T 270 60 T 350 40 L 350 120 L 0 120 Z"
            fill="url(#chartGradient)"
          />
          <path
            className="chart-stroke"
            d="M 0 80 Q 45 70, 90 75 T 180 50 T 270 60 T 350 40"
            fill="none"
          />
        </svg>
      </section>

      {/* Balances section */}
      <section className="balances-section">
        <div className="balances-header">
          <h2 className="balances-title">Balances</h2>
          <button type="button" className="activity-btn">Activity</button>
        </div>

        <div className="balances-card">
          <div className="card-header">
            <span className="card-label">Crypto</span>
            <span className="card-chevron" aria-hidden>▼</span>
          </div>
          <ul className="balance-list">
            <li className="balance-row">
              <CoinLogo coinId="bitcoin" coinsById={coinsById} fallbackLetter="₿" className="asset-icon asset-btc" />
              <div className="asset-info">
                <span className="asset-name">Bitcoin</span>
                <span className="asset-amount">0.0599 BTC</span>
              </div>
              <span className={`asset-value ${pricesLoading ? 'asset-value--loading' : ''}`}>
                {pricesLoading ? '...' : formatPrice(btcValue)}
              </span>
            </li>
            <li className="balance-row">
              <CoinLogo coinId="ethereum" coinsById={coinsById} fallbackLetter="Ξ" className="asset-icon asset-eth" />
              <div className="asset-info">
                <span className="asset-name">Ethereum</span>
                <span className="asset-amount">1.4600 ETH</span>
              </div>
              <span className={`asset-value ${pricesLoading ? 'asset-value--loading' : ''}`}>
                {pricesLoading ? '...' : formatPrice(ethValue)}
              </span>
            </li>
            <li className="balance-row">
              <CoinLogo coinId="solana" coinsById={coinsById} fallbackLetter="S" className="asset-icon asset-sol" />
              <div className="asset-info">
                <span className="asset-name">Solana</span>
                <span className="asset-amount">8.0000 SOL</span>
              </div>
              <span className={`asset-value ${pricesLoading ? 'asset-value--loading' : ''}`}>
                {pricesLoading ? '...' : formatPrice(solValue)}
              </span>
            </li>
          </ul>
        </div>

      </section>

      {/* Action buttons */}
      <div className="action-buttons">
        <button type="button" className="btn btn-secondary">Withdraw</button>
        <button type="button" className="btn btn-primary" onClick={() => setTradeSheetOpen(true)}>
          Trade
        </button>
      </div>

      {/* Buy page (crypto asset list) — pushes in from right */}
      {(buyPageOpen || buyPageClosing) && (
        <div
          className={`buy-page ${buyPageClosing ? 'buy-page--closing' : ''}`}
          role="dialog"
          aria-label="Buy crypto"
        >
          <header className="buy-page-header">
            <button
              type="button"
              className="buy-page-back"
              onClick={closeBuyPage}
              aria-label="Back"
            >
              <BackChevronIcon />
            </button>
            <h1 className="buy-page-title">Buy</h1>
          </header>
          <div className="buy-page-search-wrap">
            <SearchIcon />
            <input
              type="search"
              className="buy-page-search"
              placeholder="Search"
              aria-label="Search assets"
            />
          </div>
          <h2 className="buy-page-section-title">Popular assets</h2>
          <ul className="buy-page-asset-list">
            {POPULAR_ASSETS.map((asset) => (
              <li key={asset.ticker}>
                <button type="button" className="buy-page-asset-row" onClick={() => openBuyCoinScreen(asset)}>
                  <CoinLogo
                    coinId={asset.coinId}
                    coinsById={coinsById}
                    fallbackLetter={asset.ticker.charAt(0)}
                    className={`buy-page-asset-icon buy-page-asset-icon--${asset.icon}`}
                  />
                  <div className="buy-page-asset-info">
                    <span className="buy-page-asset-name">{asset.name}</span>
                    <span className="buy-page-asset-meta">
                      {asset.ticker}
                      {asset.apr && (
                        <span className="buy-page-asset-apr">{asset.apr}</span>
                      )}
                    </span>
                  </div>
                  <div className="buy-page-asset-right">
                    <span className={`buy-page-asset-price ${pricesLoading ? 'buy-page-asset-price--loading' : ''}`}>
                        {pricesLoading
                          ? '...'
                          : formatPrice(
                              coinsById[asset.coinId]?.current_price ??
                                (asset.priceId ? (prices[asset.priceId] ?? FALLBACK_PRICES[asset.priceId]) : asset.staticPrice)
                            )}
                      </span>
                    <span
                      className={`buy-page-asset-change ${
                        asset.change >= 0 ? 'buy-page-asset-change--up' : 'buy-page-asset-change--down'
                      }`}
                    >
                      {asset.change >= 0 ? '↑' : '↓'} {Math.abs(asset.change).toFixed(2)}%
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="bottom-nav">
        <a href="#home" className="nav-item">
          <HomeIcon />
          <span>Home</span>
        </a>
        <a href="#portfolio" className="nav-item nav-item-active">
          <PortfolioNavIcon />
          <span>Portfolio</span>
        </a>
        <a href="#explore" className="nav-item">
          <ExploreIcon />
          <span>Explore</span>
        </a>
        <a href="#more" className="nav-item">
          <MoreNavIcon />
          <span>More</span>
        </a>
      </nav>
      </div>

      {/* Buy page (crypto asset list) — pushes in from right */}
      {(buyPageOpen || buyPageClosing) && (
        <div
          className={`buy-page ${buyPageClosing ? 'buy-page--closing' : ''}`}
          role="dialog"
          aria-label="Buy crypto"
        >
          <header className="buy-page-header">
            <button
              type="button"
              className="buy-page-back"
              onClick={closeBuyPage}
              aria-label="Back"
            >
              <BackChevronIcon />
            </button>
            <h1 className="buy-page-title">Buy</h1>
          </header>
          <div className="buy-page-search-wrap">
            <SearchIcon />
            <input
              type="search"
              className="buy-page-search"
              placeholder="Search"
              aria-label="Search assets"
            />
          </div>
          <h2 className="buy-page-section-title">Popular assets</h2>
          <ul className="buy-page-asset-list">
            {POPULAR_ASSETS.map((asset) => (
              <li key={asset.ticker}>
                <button type="button" className="buy-page-asset-row" onClick={() => openBuyCoinScreen(asset)}>
                  <CoinLogo
                    coinId={asset.coinId}
                    coinsById={coinsById}
                    fallbackLetter={asset.ticker.charAt(0)}
                    className={`buy-page-asset-icon buy-page-asset-icon--${asset.icon}`}
                  />
                  <div className="buy-page-asset-info">
                    <span className="buy-page-asset-name">{asset.name}</span>
                    <span className="buy-page-asset-meta">
                      {asset.ticker}
                      {asset.apr && (
                        <span className="buy-page-asset-apr">{asset.apr}</span>
                      )}
                    </span>
                  </div>
                  <div className="buy-page-asset-right">
                    <span className={`buy-page-asset-price ${pricesLoading ? 'buy-page-asset-price--loading' : ''}`}>
                        {pricesLoading
                          ? '...'
                          : formatPrice(
                              coinsById[asset.coinId]?.current_price ??
                                (asset.priceId ? (prices[asset.priceId] ?? FALLBACK_PRICES[asset.priceId]) : asset.staticPrice)
                            )}
                      </span>
                    <span
                      className={`buy-page-asset-change ${
                        asset.change >= 0 ? 'buy-page-asset-change--up' : 'buy-page-asset-change--down'
                      }`}
                    >
                      {asset.change >= 0 ? '↑' : '↓'} {Math.abs(asset.change).toFixed(2)}%
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Buy [Coin] screen — for selected asset */}
      {(buyCoinScreenOpen || buyCoinScreenClosing) && selectedCoin && (
        <div
          className={`buy-coin-screen ${buyCoinScreenClosing ? 'buy-coin-screen--closing' : ''}`}
          role="dialog"
          aria-label={`Buy ${selectedCoin.ticker}`}
        >
          <header className="buy-coin-screen-header">
            <button
              type="button"
              className="buy-coin-screen-back"
              onClick={closeBuyCoinScreen}
              aria-label="Back"
            >
              <BackChevronIcon />
            </button>
            <div className="buy-coin-screen-title-wrap">
              {selectedCoin.image ? (
                <img
                  src={selectedCoin.image}
                  alt=""
                  className="buy-coin-screen-logo"
                  width={32}
                  height={32}
                />
              ) : (
                <span className="buy-coin-screen-logo-fallback">{selectedCoin.ticker.charAt(0)}</span>
              )}
              <h1 className="buy-coin-screen-title">Buy {selectedCoin.ticker}</h1>
            </div>
            <button type="button" className="buy-coin-screen-instant" aria-label="Transaction type">
              Instant <span className="buy-coin-screen-chevron">▼</span>
            </button>
          </header>

          <div className="buy-coin-screen-body">
            <div className="buy-coin-screen-top">
              <div className="buy-coin-screen-amount-section">
                <input
                  ref={amountInputRef}
                  type="text"
                  inputMode="decimal"
                  value={buyAmount}
                  onChange={(e) => handleKeyboardInput(e.target.value)}
                  onFocus={() => setAmountFocused(true)}
                  onBlur={() => setAmountFocused(false)}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: 0,
                    height: 0,
                    pointerEvents: 'none',
                  }}
                />
                <div
                  className="buy-coin-screen-amount-wrap"
                  onClick={() => {
                    if (amountInputRef.current) amountInputRef.current.focus();
                  }}
                >
                  <span className="buy-coin-screen-amount-dollar">$</span>
                  {amountFocused && buyAmount === '0' && (
                    <span className="amount-cursor" aria-hidden />
                  )}
                  <span className="buy-coin-screen-amount-value">{buyAmount}</span>
                  {amountFocused && buyAmount !== '0' && (
                    <span className="amount-cursor" aria-hidden />
                  )}
                  <span className="buy-coin-screen-amount-ticker">{selectedCoin.ticker}</span>
                  <span className="buy-coin-screen-amount-swap" aria-hidden>
                    <ConvertIcon />
                  </span>
                </div>
                <p className="buy-coin-screen-limit">
                  You can buy up to <span className="buy-coin-screen-limit-amount">$7,000.00</span>
                </p>
              </div>

              <button type="button" className="buy-coin-screen-frequency">One time <span aria-hidden>▼</span></button>
            </div>

            <div className="buy-coin-screen-funding" onClick={openPayWith}>
              <div className="buy-coin-screen-funding-box">
                {(selectedPayMethod.id === 'credit' || selectedPayMethod.id === 'cash+credit') && (
                  <div className="pay-with-row-icon pay-with-row-icon--credit buy-coin-screen-funding-icon" aria-hidden>⚡</div>
                )}
                {selectedPayMethod.id === 'cash' && (
                  <div className="pay-with-row-icon pay-with-row-icon--cash buy-coin-screen-funding-icon" aria-hidden>$</div>
                )}
                {selectedPayMethod.id === 'apple' && (
                  <div className="buy-coin-screen-card-icon buy-coin-screen-funding-icon" aria-hidden>
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="11" viewBox="0 0 26 11" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M3.3462 1.93296C3.81624 1.97261 4.28628 1.69506 4.58006 1.34316C4.86894 0.981348 5.05989 0.49563 5.01093 0C4.59475 0.0198252 4.08064 0.277553 3.78686 0.639363C3.51757 0.95161 3.28745 1.45715 3.3462 1.93296ZM8.93774 8.31668V0.589812H11.8021C13.2807 0.589812 14.3138 1.62072 14.3138 3.12744C14.3138 4.63415 13.2611 5.67497 11.7629 5.67497H10.1226V8.31668H8.93774ZM5.006 2.02714C4.5919 2.00301 4.21406 2.1532 3.90886 2.27451C3.71246 2.35257 3.54614 2.41868 3.41961 2.41868C3.27762 2.41868 3.10444 2.34904 2.90999 2.27085C2.65521 2.16839 2.36392 2.05125 2.05845 2.05687C1.35829 2.06679 0.707086 2.46825 0.349659 3.10761C-0.38478 4.38633 0.158705 6.27964 0.868662 7.32046C1.2163 7.83592 1.63248 8.40094 2.18086 8.38111C2.42211 8.37189 2.59566 8.29735 2.77526 8.22021C2.98203 8.13139 3.19683 8.03913 3.53223 8.03913C3.85599 8.03913 4.0614 8.12899 4.25858 8.21525C4.44606 8.29726 4.62611 8.37603 4.89339 8.3712C5.46135 8.36128 5.81878 7.85574 6.16642 7.34029C6.54157 6.78706 6.70643 6.24715 6.73145 6.16521L6.73438 6.15573C6.73378 6.15513 6.72915 6.15298 6.72097 6.14919C6.59556 6.09107 5.63702 5.64687 5.62783 4.45572C5.6186 3.45593 6.38811 2.94937 6.50925 2.86963L6.50926 2.86962C6.51663 2.86477 6.5216 2.8615 6.52384 2.85979C6.03422 2.12626 5.2704 2.04696 5.006 2.02714ZM16.478 8.37612C17.2223 8.37612 17.9126 7.99448 18.226 7.38981H18.2505V8.31664H19.3472V4.47055C19.3472 3.35539 18.4659 2.63672 17.1096 2.63672C15.8513 2.63672 14.921 3.3653 14.8867 4.36647H15.9541C16.0423 3.89067 16.478 3.57842 17.0754 3.57842C17.8 3.57842 18.2064 3.9204 18.2064 4.54985V4.9761L16.7277 5.06531C15.3519 5.14957 14.6077 5.71954 14.6077 6.7108C14.6077 7.71197 15.3764 8.37612 16.478 8.37612ZM16.7962 7.45924C16.1646 7.45924 15.7631 7.15195 15.7631 6.6811C15.7631 6.19538 16.1499 5.91288 16.8893 5.86827L18.2063 5.78401V6.22017C18.2063 6.94378 17.5992 7.45924 16.7962 7.45924ZM22.9851 8.61899C22.5102 9.97206 21.9667 10.4181 20.8112 10.4181C20.7231 10.4181 20.4293 10.4082 20.3607 10.3884V9.46156C20.4342 9.47147 20.6153 9.48138 20.7084 9.48138C21.2323 9.48138 21.526 9.25835 21.7072 8.67846L21.8149 8.33648L19.8075 2.71108H21.0462L22.4416 7.27583H22.4661L23.8616 2.71108H25.066L22.9851 8.61899ZM10.1225 1.60087H11.4886C12.5168 1.60087 13.1044 2.15598 13.1044 3.13237C13.1044 4.10876 12.5168 4.66882 11.4837 4.66882H10.1225V1.60087Z" fill="black"/>
                    </svg>
                  </div>
                )}
                {selectedPayMethod.id === 'visa' && (
                  <div className="buy-coin-screen-card-icon buy-coin-screen-funding-icon" aria-hidden>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="8" viewBox="0 0 25 8" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M6.12526 7.75825H4.00494L2.41495 1.69237C2.33949 1.41334 2.17925 1.16667 1.94354 1.0504C1.35531 0.75823 0.707118 0.525705 0 0.408431V0.174895H3.41567C3.88708 0.174895 4.24064 0.525705 4.29957 0.933129L5.12454 5.30865L7.24383 0.174895H9.30522L6.12526 7.75825ZM10.4838 7.75825H8.48129L10.1302 0.174895H12.1327L10.4838 7.75825ZM14.7234 2.27571C14.7823 1.86728 15.1359 1.63374 15.5483 1.63374C16.1965 1.57511 16.9026 1.69238 17.4919 1.98354L17.8454 0.35081C17.2562 0.117274 16.608 0 16.0198 0C14.0762 0 12.662 1.05041 12.662 2.50824C12.662 3.61728 13.6637 4.19961 14.3708 4.55042C15.1359 4.90021 15.4305 5.13375 15.3716 5.48355C15.3716 6.00825 14.7823 6.24178 14.1941 6.24178C13.4869 6.24178 12.7798 6.06688 12.1327 5.77471L11.7791 7.40845C12.4862 7.69962 13.2512 7.81689 13.9584 7.81689C16.1376 7.87451 17.4919 6.82512 17.4919 5.25001C17.4919 3.26647 14.7234 3.15021 14.7234 2.27571V2.27571ZM24.5 7.75825L22.91 0.174895H21.2022C20.8486 0.174895 20.4951 0.408431 20.3772 0.75823L17.4329 7.75825H19.4943L19.9058 6.65021H22.4386L22.6743 7.75825H24.5ZM21.4968 2.21708L22.085 5.07512H20.4361L21.4968 2.21708Z" fill="#172B85"/>
                    </svg>
                  </div>
                )}
                {(selectedPayMethod.id === 'bitcoin' || selectedPayMethod.id === 'ethereum') && (
                  <>
                    {coinsById[selectedPayMethod.id]?.image ? (
                      <img src={coinsById[selectedPayMethod.id].image} alt="" className="pay-with-row-icon pay-with-row-icon--img buy-coin-screen-funding-icon" width={32} height={32} />
                    ) : (
                      <div className={`pay-with-row-icon pay-with-row-icon--${selectedPayMethod.id === 'bitcoin' ? 'btc' : 'eth'} buy-coin-screen-funding-icon`} aria-hidden>
                        {selectedPayMethod.id === 'bitcoin' ? '₿' : 'Ξ'}
                      </div>
                    )}
                  </>
                )}
                <div className="buy-coin-screen-funding-text">
                  {selectedPayMethod.id === 'cash+credit' ? (
                    <>
                      <span className="buy-coin-screen-funding-label">Cash + Credit · {formatPrice(buyAmountNum)} total</span>
                      <span className="buy-coin-screen-funding-meta">
                        $2,000 from your balance · {formatPrice(Math.max(0, buyAmountNum - CASH_BALANCE))} from credit line
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="buy-coin-screen-funding-label">{selectedPayMethod.label}</span>
                      {selectedPayMethod.amount && <span className="buy-coin-screen-funding-amount">{selectedPayMethod.amount}</span>}
                    </>
                  )}
                </div>
                <span className="buy-coin-screen-funding-chevron" aria-hidden>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="11"
                    height="7"
                    viewBox="0 0 11 7"
                    fill="none"
                  >
                    <path
                      d="M10.2458 0.290792C10.0584 0.104542 9.80498 0 9.5408 0C9.27661 0 9.02316 0.104542 8.8358 0.290792L5.2458 3.83079L1.7058 0.290792C1.51844 0.104542 1.26498 0 1.0008 0C0.736612 0 0.483161 0.104542 0.295798 0.290792C0.20207 0.383755 0.127675 0.494356 0.0769067 0.616216C0.026138 0.738075 0 0.868781 0 1.00079C0 1.1328 0.026138 1.26351 0.0769067 1.38537C0.127675 1.50723 0.20207 1.61783 0.295798 1.71079L4.5358 5.95079C4.62876 6.04452 4.73936 6.11891 4.86122 6.16968C4.98308 6.22045 5.11379 6.24659 5.2458 6.24659C5.37781 6.24659 5.50852 6.22045 5.63037 6.16968C5.75223 6.11891 5.86283 6.04452 5.9558 5.95079L10.2458 1.71079C10.3395 1.61783 10.4139 1.50723 10.4647 1.38537C10.5155 1.26351 10.5416 1.1328 10.5416 1.00079C10.5416 0.868781 10.5155 0.738075 10.4647 0.616216C10.4139 0.494356 10.3395 0.383755 10.2458 0.290792Z"
                      fill="white"
                    />
                  </svg>
                </span>
              </div>
              <button
                type="button"
                className="buy-coin-screen-proceed"
                aria-label="Continue"
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirmScreen();
                }}
              >
                →
              </button>
            </div>

            {showCreditPrompt && (
              <div
                className="buy-coin-screen-credit-prompt"
                role="region"
                aria-label="Kraken Credit suggestion"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="buy-coin-screen-credit-prompt-left">
                  <span className="buy-coin-screen-credit-prompt-icon" aria-hidden>⚡</span>
                  <div className="buy-coin-screen-credit-prompt-text">
                    <span className="buy-coin-screen-credit-prompt-title">
                      You&apos;re {formatPrice(creditPromptExcess)} over your cash balance
                    </span>
                    <div className="buy-coin-screen-credit-prompt-sub-row">
                      <span className="buy-coin-screen-credit-prompt-sub">
                        Use Kraken Credit to borrow the rest
                      </span>
                      <button
                        type="button"
                        className="buy-coin-screen-credit-info"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCreditDetailsSheetOpen(true);
                          setCreditSheetClosing(false);
                        }}
                        aria-label="Learn about buying with Kraken Credit"
                      >
                        <span className="buy-coin-screen-credit-info-icon" aria-hidden>
                          i
                        </span>
                      </button>
                    </div>
                    <button
                      type="button"
                      className="buy-coin-screen-credit-prompt-link"
                      onClick={handleAddCreditForRemainder}
                    >
                      + Add credit to order
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="buy-coin-screen-quick-amounts">
              {['20', '50', '100', '250'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className="buy-coin-screen-quick-btn"
                  onClick={() =>
                    setBuyAmount((prev) => {
                      const base = parseFloat(String(prev || '0').replace(/,/g, '')) || 0;
                      const inc = parseFloat(val) || 0;
                      const next = base + inc;
                      return String(next);
                    })
                  }
                >
                  ${val}
                </button>
              ))}
            </div>

            <div className="buy-coin-screen-keypad">
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['.', '0', 'back'],
              ].map((row, i) => (
                <div key={i} className="buy-coin-screen-keypad-row">
                  {row.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className="buy-coin-screen-keypad-key"
                      onClick={() => onKeypadInput(key)}
                      aria-label={key === 'back' ? 'Backspace' : key}
                    >
                      {key === 'back' ? '←' : key}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Confirmation screen — review order before buying */}
      {(confirmScreenOpen || confirmScreenClosing) && selectedCoin && (
        <div
          className={`confirm-screen ${confirmScreenClosing ? 'confirm-screen--closing' : ''}`}
          role="dialog"
          aria-label={`Confirm buy ${selectedCoin.ticker}`}
        >
          <header className="confirm-screen-header">
            <button
              type="button"
              className="confirm-screen-back"
              onClick={closeConfirmScreen}
              aria-label="Back"
            >
              <BackChevronIcon />
            </button>
            <h1 className="confirm-screen-title">Buy {selectedCoin.ticker}</h1>
          </header>

          <div className="confirm-screen-body">
            <div className="confirm-screen-hero">
              {selectedCoin.image ? (
                <img
                  src={selectedCoin.image}
                  alt=""
                  className="confirm-screen-logo"
                  width={64}
                  height={64}
                />
              ) : (
                <span className="confirm-screen-logo-fallback">
                  {selectedCoin.ticker.charAt(0)}
                </span>
              )}
            </div>

            <section className="confirm-screen-summary">
              <p className="confirm-screen-summary-main">
                Buy {formatPrice(orderUsd)} worth of {selectedCoin.ticker}
              </p>
              <p className="confirm-screen-summary-sub">
                at {formatPrice(selectedCoin.currentPrice || 0)}
              </p>
            </section>

            <section className="confirm-screen-details">
              <div className="confirm-row">
                <span className="confirm-row-label">Amount</span>
                <span className="confirm-row-value">
                  {orderCrypto ? `${orderCrypto.toFixed(8)} ${selectedCoin.ticker}` : `0 ${selectedCoin.ticker}`}
                </span>
              </div>
              <div className="confirm-row">
                <span className="confirm-row-label">Kraken fee</span>
                <button type="button" className="confirm-row-value confirm-row-value--fee">
                  {formatPrice(feeUsd)}
                </button>
              </div>
              <div className="confirm-row">
                <span className="confirm-row-label">Total</span>
                <span className="confirm-row-value">{formatPrice(totalUsd)}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-row-label">Pay with</span>
                <span className="confirm-row-value confirm-row-value--credit">
                  {selectedPayMethod.id === 'credit' ? 'Kraken Credit' : selectedPayMethod.id === 'cash+credit' ? 'Cash + Credit' : selectedPayMethod.label}
                </span>
              </div>
            </section>

            {borrowedAmount > 0 && (
              <section className="confirm-screen-borrowing">
                <h2 className="confirm-borrowing-header">BORROWING DETAILS</h2>

                <div className="confirm-borrowing-bar">
                  <div className="confirm-borrowing-bar-inner">
                    {cashPortion > 0 && (
                      <div
                        className="confirm-borrowing-bar-segment confirm-borrowing-bar-segment--cash"
                        style={{ width: `${cashShare}%` }}
                      />
                    )}
                    <div
                      className="confirm-borrowing-bar-segment confirm-borrowing-bar-segment--credit"
                      style={{ width: `${cashPortion > 0 ? creditShare : 100}%` }}
                    />
                  </div>
                </div>

                {cashPortion > 0 && (
                  <div className="confirm-row">
                    <span className="confirm-row-label">
                      <span className="confirm-row-dot confirm-row-dot--cash" />
                      <span>Cash used</span>
                    </span>
                    <span className="confirm-row-value">{formatPrice(cashPortion)}</span>
                  </div>
                )}
                <div className="confirm-row">
                  <span className="confirm-row-label">
                    <span className="confirm-row-dot confirm-row-dot--credit" />
                    <span>Borrowed</span>
                  </span>
                  <span className="confirm-row-value">{formatPrice(borrowedAmount)}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">Interest rate</span>
                  <span className="confirm-row-value">10% APR</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">Est. interest</span>
                  <span className="confirm-row-value confirm-row-value--highlight">
                    {formatPrice(interestDaily)} / day
                  </span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">Liquidation</span>
                  <span className="confirm-row-value confirm-row-value--warning">
                    {selectedCoin && selectedCoin.currentPrice
                      ? `~$${(selectedCoin.currentPrice * 0.75).toLocaleString('en-US', {
                          maximumFractionDigits: 0,
                        })} / ${selectedCoin.ticker}`
                      : '—'}
                  </span>
                </div>
                {selectedCoin?.currentPrice != null && (() => {
                  const liquidationPrice = selectedCoin.currentPrice * 0.75;
                  const safetyBuffer = ((selectedCoin.currentPrice - liquidationPrice) / selectedCoin.currentPrice) * 100;
                  const bufferFormatted = safetyBuffer.toFixed(0);
                  const bufferNum = Number(bufferFormatted);
                  const bufferVariant = bufferNum > 30 ? 'safe' : bufferNum >= 15 ? 'caution' : 'danger';
                  return (
                    <div className={`confirm-liquidation-buffer confirm-liquidation-buffer--${bufferVariant}`}>
                      <span className="confirm-liquidation-buffer-dot" aria-hidden />
                      <span>{selectedCoin.ticker} can drop {bufferFormatted}% before liquidation</span>
                    </div>
                  );
                })()}
              </section>
            )}

            {borrowedAmount > 0 && (
              <section className="confirm-screen-ack">
                <button
                  type="button"
                  className="confirm-ack-toggle confirm-ack-toggle--first"
                  onClick={() => setAckBorrow((prev) => !prev)}
                >
                  <div className="confirm-ack-main">
                    <span
                      className={`confirm-ack-checkbox ${
                        ackBorrow ? 'confirm-ack-checkbox--checked' : ''
                      }`}
                      aria-hidden
                    >
                      {ackBorrow && '✓'}
                    </span>
                    <span className="confirm-ack-text">
                      I understand that if BTC drops too far, Kraken will automatically sell my positions
                      to repay the loan.
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  className="confirm-ack-toggle"
                  onClick={() => setAckWithdraw((prev) => !prev)}
                >
                  <div className="confirm-ack-main">
                    <span
                      className={`confirm-ack-checkbox ${
                        ackWithdraw ? 'confirm-ack-checkbox--checked' : ''
                      }`}
                      aria-hidden
                    >
                      {ackWithdraw && '✓'}
                    </span>
                    <span className="confirm-ack-text">
                      I understand that I won&apos;t be able to withdraw this purchase for 72 hours.
                    </span>
                  </div>
                  <span className="confirm-ack-info" aria-hidden>
                    i
                  </span>
                </button>
              </section>
            )}
          </div>

          <div className="confirm-screen-footer">
            <button
              type="button"
              className="confirm-screen-button"
              disabled={borrowedAmount > 0 && !(ackBorrow && ackWithdraw)}
              onClick={() => {
                if (borrowedAmount > 0 && !(ackBorrow && ackWithdraw)) return;
                setConfirmScreenClosing(true);
                setTimeout(() => {
                  setConfirmScreenOpen(false);
                  setConfirmScreenClosing(false);
                  setBuyCoinScreenOpen(false);
                  setBuyCoinScreenClosing(false);
                  setBuyPageOpen(false);
                  setBuyPageClosing(false);
                  openConfirmedScreen();
                }, PUSH_ANIMATION_MS);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      </div>

      {/* Trade bottom sheet */}
      {(tradeSheetOpen || sheetClosing) && (
        <>
          <div
            className={`bottom-sheet-overlay ${sheetClosing ? 'bottom-sheet-overlay--closing' : ''}`}
            onClick={closeSheet}
            aria-hidden
          />
          <div
            className={`bottom-sheet ${sheetClosing ? 'bottom-sheet--closing' : ''}`}
            role="dialog"
            aria-label="Trade options"
          >
            <div className="bottom-sheet-grabber" />
            <div className="bottom-sheet-content">
              <button type="button" className="bottom-sheet-item" onClick={openBuyPage}>
                <div className="bottom-sheet-icon">
                  <PlusIcon />
                </div>
                <div className="bottom-sheet-text">
                  <span className="bottom-sheet-title">Buy</span>
                  <span className="bottom-sheet-subtitle">Buy crypto with cash</span>
                </div>
                <ChevronIcon />
              </button>
              <button
                type="button"
                className="bottom-sheet-item"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bottom-sheet-icon">
                  <MinusIcon />
                </div>
                <div className="bottom-sheet-text">
                  <span className="bottom-sheet-title">Sell</span>
                  <span className="bottom-sheet-subtitle">Sell crypto for cash</span>
                </div>
                <ChevronIcon />
              </button>
              <button
                type="button"
                className="bottom-sheet-item"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bottom-sheet-icon">
                  <ConvertIcon />
                </div>
                <div className="bottom-sheet-text">
                  <span className="bottom-sheet-title">Convert</span>
                  <span className="bottom-sheet-subtitle">Exchange one asset for another</span>
                </div>
                <ChevronIcon />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Confirmed state screen */}
      {confirmedScreenOpen && selectedCoin && (
        <>
          <div className="confirmed-screen-backdrop" aria-hidden />
          <div className="confirmed-screen" role="dialog" aria-label="Purchase confirmed">
            <div className="confirmed-screen-header">
              <div className="confirmed-screen-grabber" />
            </div>
            <div className="confirmed-screen-body">
              <img
                src={successImage}
                alt=""
                className="confirmed-hero-image"
                width={200}
                height={200}
              />
              <p className="confirmed-title">
                You bought {formatPrice(orderUsd)} worth of {selectedCoin.ticker}
              </p>
              {borrowedAmount > 0 && (
                <p className="confirmed-subtitle">
                  Borrowed at 10% APR · {formatPrice(interestDaily)} / day interest
                </p>
              )}
              <div className="confirmed-card">
                <div className="confirmed-card-icon" aria-hidden>🛡</div>
                <div className="confirmed-card-text">
                  <p className="confirmed-card-title">Set take-profit or stop-loss</p>
                  <p className="confirmed-card-sub">
                    Lock in your gains or limit your losses.
                  </p>
                </div>
              </div>
            </div>
            <div className="confirmed-screen-footer">
              <button
                type="button"
                className="confirmed-button confirmed-button--primary"
                onClick={closeConfirmedScreen}
              >
                Done
              </button>
              <button
                type="button"
                className="confirmed-button confirmed-button--secondary"
                onClick={closeConfirmedScreen}
              >
                View order
              </button>
            </div>
          </div>
        </>
      )}
      {/* Pay with overlay (funding source selector) */}
      {(payWithSheetOpen || payWithClosing) && (
        <>
          <div
            className={`pay-with-overlay-backdrop ${payWithClosing ? 'pay-with-overlay-backdrop--closing' : ''}`}
            onClick={closePayWith}
            aria-hidden
          />
          <div
            className={`pay-with-overlay ${payWithClosing ? 'pay-with-overlay--closing' : ''}`}
            role="dialog"
            aria-label="Pay with"
          >
            <div className="pay-with-header">
              <div className="pay-with-header-grabber" />
              <h2 className="pay-with-title">Pay with</h2>
            </div>

            <div className="pay-with-content">
              <section className="pay-with-section">
                <h3 className="pay-with-section-label">Kraken Credit</h3>
                <div
                  className={`pay-with-row ${selectedPayMethod.id === 'credit' ? 'pay-with-row--selected' : ''}`}
                  onClick={() => handleSelectPayMethod(getPayMethodConfig('credit'))}
                >
                  <div className="pay-with-row-left">
                    <div className="pay-with-row-icon pay-with-row-icon--credit" aria-hidden>⚡</div>
                    <div className="pay-with-row-text">
                      <span className="pay-with-row-title">Credit line</span>
                      <span className="pay-with-row-sub">10% APR · Against your portfolio</span>
                    </div>
                  </div>
                  <div className="pay-with-row-right">
                    <span className="pay-with-row-amount">$5,000</span>
                    <span className="pay-with-row-meta">Available</span>
                  </div>
                </div>
              </section>

              <section className="pay-with-section">
                <h3 className="pay-with-section-label">Cash</h3>
                <div
                  className={`pay-with-row ${selectedPayMethod.id === 'cash' ? 'pay-with-row--selected' : ''}`}
                  onClick={() => handleSelectPayMethod(getPayMethodConfig('cash'))}
                >
                  <div className="pay-with-row-left">
                    <div className="pay-with-row-icon pay-with-row-icon--cash" aria-hidden>$</div>
                    <div className="pay-with-row-text">
                      <span className="pay-with-row-title">Cash (USD)</span>
                      <span className="pay-with-row-sub">USD</span>
                    </div>
                  </div>
                  <div className="pay-with-row-right">
                    <span className="pay-with-row-amount">$2,000</span>
                    <span className="pay-with-row-meta">Available</span>
                  </div>
                </div>
                <div
                  className={`pay-with-row ${selectedPayMethod.id === 'apple' ? 'pay-with-row--selected' : ''}`}
                  onClick={() => handleSelectPayMethod(getPayMethodConfig('apple'))}
                >
                  <div className="pay-with-row-left">
                    <div className="pay-with-card-icon" aria-hidden>
                      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="11" viewBox="0 0 26 11" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M3.3462 1.93296C3.81624 1.97261 4.28628 1.69506 4.58006 1.34316C4.86894 0.981348 5.05989 0.49563 5.01093 0C4.59475 0.0198252 4.08064 0.277553 3.78686 0.639363C3.51757 0.95161 3.28745 1.45715 3.3462 1.93296ZM8.93774 8.31668V0.589812H11.8021C13.2807 0.589812 14.3138 1.62072 14.3138 3.12744C14.3138 4.63415 13.2611 5.67497 11.7629 5.67497H10.1226V8.31668H8.93774ZM5.006 2.02714C4.5919 2.00301 4.21406 2.1532 3.90886 2.27451C3.71246 2.35257 3.54614 2.41868 3.41961 2.41868C3.27762 2.41868 3.10444 2.34904 2.90999 2.27085C2.65521 2.16839 2.36392 2.05125 2.05845 2.05687C1.35829 2.06679 0.707086 2.46825 0.349659 3.10761C-0.38478 4.38633 0.158705 6.27964 0.868662 7.32046C1.2163 7.83592 1.63248 8.40094 2.18086 8.38111C2.42211 8.37189 2.59566 8.29735 2.77526 8.22021C2.98203 8.13139 3.19683 8.03913 3.53223 8.03913C3.85599 8.03913 4.0614 8.12899 4.25858 8.21525C4.44606 8.29726 4.62611 8.37603 4.89339 8.3712C5.46135 8.36128 5.81878 7.85574 6.16642 7.34029C6.54157 6.78706 6.70643 6.24715 6.73145 6.16521L6.73438 6.15573C6.73378 6.15513 6.72915 6.15298 6.72097 6.14919C6.59556 6.09107 5.63702 5.64687 5.62783 4.45572C5.6186 3.45593 6.38811 2.94937 6.50925 2.86963L6.50926 2.86962C6.51663 2.86477 6.5216 2.8615 6.52384 2.85979C6.03422 2.12626 5.2704 2.04696 5.006 2.02714ZM16.478 8.37612C17.2223 8.37612 17.9126 7.99448 18.226 7.38981H18.2505V8.31664H19.3472V4.47055C19.3472 3.35539 18.4659 2.63672 17.1096 2.63672C15.8513 2.63672 14.921 3.3653 14.8867 4.36647H15.9541C16.0423 3.89067 16.478 3.57842 17.0754 3.57842C17.8 3.57842 18.2064 3.9204 18.2064 4.54985V4.9761L16.7277 5.06531C15.3519 5.14957 14.6077 5.71954 14.6077 6.7108C14.6077 7.71197 15.3764 8.37612 16.478 8.37612ZM16.7962 7.45924C16.1646 7.45924 15.7631 7.15195 15.7631 6.6811C15.7631 6.19538 16.1499 5.91288 16.8893 5.86827L18.2063 5.78401V6.22017C18.2063 6.94378 17.5992 7.45924 16.7962 7.45924ZM22.9851 8.61899C22.5102 9.97206 21.9667 10.4181 20.8112 10.4181C20.7231 10.4181 20.4293 10.4082 20.3607 10.3884V9.46156C20.4342 9.47147 20.6153 9.48138 20.7084 9.48138C21.2323 9.48138 21.526 9.25835 21.7072 8.67846L21.8149 8.33648L19.8075 2.71108H21.0462L22.4416 7.27583H22.4661L23.8616 2.71108H25.066L22.9851 8.61899ZM10.1225 1.60087H11.4886C12.5168 1.60087 13.1044 2.15598 13.1044 3.13237C13.1044 4.10876 12.5168 4.66882 11.4837 4.66882H10.1225V1.60087Z" fill="black"/>
                      </svg>
                    </div>
                    <div className="pay-with-row-text">
                      <span className="pay-with-row-title">Apple Pay</span>
                    </div>
                  </div>
                  <div className="pay-with-row-right">
                    <span className="pay-with-row-amount">$5,000</span>
                    <span className="pay-with-row-meta">Limit</span>
                  </div>
                </div>
                <div
                  className={`pay-with-row ${selectedPayMethod.id === 'visa' ? 'pay-with-row--selected' : ''}`}
                  onClick={() => handleSelectPayMethod(getPayMethodConfig('visa'))}
                >
                  <div className="pay-with-row-left">
                    <div className="pay-with-card-icon" aria-hidden>
                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="8" viewBox="0 0 25 8" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M6.12526 7.75825H4.00494L2.41495 1.69237C2.33949 1.41334 2.17925 1.16667 1.94354 1.0504C1.35531 0.75823 0.707118 0.525705 0 0.408431V0.174895H3.41567C3.88708 0.174895 4.24064 0.525705 4.29957 0.933129L5.12454 5.30865L7.24383 0.174895H9.30522L6.12526 7.75825ZM10.4838 7.75825H8.48129L10.1302 0.174895H12.1327L10.4838 7.75825ZM14.7234 2.27571C14.7823 1.86728 15.1359 1.63374 15.5483 1.63374C16.1965 1.57511 16.9026 1.69238 17.4919 1.98354L17.8454 0.35081C17.2562 0.117274 16.608 0 16.0198 0C14.0762 0 12.662 1.05041 12.662 2.50824C12.662 3.61728 13.6637 4.19961 14.3708 4.55042C15.1359 4.90021 15.4305 5.13375 15.3716 5.48355C15.3716 6.00825 14.7823 6.24178 14.1941 6.24178C13.4869 6.24178 12.7798 6.06688 12.1327 5.77471L11.7791 7.40845C12.4862 7.69962 13.2512 7.81689 13.9584 7.81689C16.1376 7.87451 17.4919 6.82512 17.4919 5.25001C17.4919 3.26647 14.7234 3.15021 14.7234 2.27571V2.27571ZM24.5 7.75825L22.91 0.174895H21.2022C20.8486 0.174895 20.4951 0.408431 20.3772 0.75823L17.4329 7.75825H19.4943L19.9058 6.65021H22.4386L22.6743 7.75825H24.5ZM21.4968 2.21708L22.085 5.07512H20.4361L21.4968 2.21708Z" fill="#172B85"/>
                      </svg>
                    </div>
                    <div className="pay-with-row-text">
                      <span className="pay-with-row-title">Visa</span>
                      <span className="pay-with-row-sub">Debit ···· 4242</span>
                    </div>
                  </div>
                  <div className="pay-with-row-right">
                    <span className="pay-with-row-amount">$5,000</span>
                    <span className="pay-with-row-meta">Limit</span>
                  </div>
                </div>
              </section>

              <section className="pay-with-section">
                <h3 className="pay-with-section-label">Crypto</h3>
                <div
                  className={`pay-with-row ${selectedPayMethod.id === 'bitcoin' ? 'pay-with-row--selected' : ''}`}
                  onClick={() => handleSelectPayMethod(getPayMethodConfig('bitcoin'))}
                >
                  <div className="pay-with-row-left">
                    {coinsById.bitcoin?.image ? (
                      <img src={coinsById.bitcoin.image} alt="" className="pay-with-row-icon pay-with-row-icon--img" width={40} height={40} />
                    ) : (
                      <div className="pay-with-row-icon pay-with-row-icon--btc" aria-hidden>₿</div>
                    )}
                    <div className="pay-with-row-text">
                      <span className="pay-with-row-title">Bitcoin</span>
                      <span className="pay-with-row-sub">BTC</span>
                    </div>
                  </div>
                  <div className="pay-with-row-right">
                    <span className="pay-with-row-amount">$4,165</span>
                    <span className="pay-with-row-meta">0.0599 BTC</span>
                  </div>
                </div>
                <div
                  className={`pay-with-row ${selectedPayMethod.id === 'ethereum' ? 'pay-with-row--selected' : ''}`}
                  onClick={() => handleSelectPayMethod(getPayMethodConfig('ethereum'))}
                >
                  <div className="pay-with-row-left">
                    {coinsById.ethereum?.image ? (
                      <img src={coinsById.ethereum.image} alt="" className="pay-with-row-icon pay-with-row-icon--img" width={40} height={40} />
                    ) : (
                      <div className="pay-with-row-icon pay-with-row-icon--eth" aria-hidden>Ξ</div>
                    )}
                    <div className="pay-with-row-text">
                      <span className="pay-with-row-title">Ethereum</span>
                      <span className="pay-with-row-sub">ETH</span>
                    </div>
                  </div>
                  <div className="pay-with-row-right">
                    <span className="pay-with-row-amount">$3,012</span>
                    <span className="pay-with-row-meta">1.4600 ETH</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </>
      )}

      {/* Kraken Credit details sheet */}
      {(creditDetailsSheetOpen || creditSheetClosing) && (
        <>
          <div
            className={`credit-sheet-overlay-backdrop ${
              creditSheetClosing ? 'credit-sheet-overlay-backdrop--closing' : ''
            }`}
            onClick={() => closeCreditSheet()}
            aria-hidden
          />
          <div
            className={`credit-sheet ${creditSheetClosing ? 'credit-sheet--closing' : ''}`}
            role="dialog"
            aria-label="Buying with Kraken Credit"
          >
            <div className="credit-sheet-header">
              <div className="credit-sheet-grabber" />
              <h2 className="credit-sheet-title">Buying with Kraken Credit</h2>
            </div>
            <div className="credit-sheet-content">
              <section className="credit-sheet-section">
                <div className="credit-sheet-row">
                  <div className="credit-sheet-icon credit-sheet-icon--limit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21.22 12C21.7178 11.4524 21.9956 10.7401 22 10C22 9.20435 21.6839 8.44129 21.1213 7.87868C20.5587 7.31607 19.7956 7 19 7H13.82C13.9797 6.54818 14.0289 6.06466 13.9634 5.58993C13.8979 5.11519 13.7196 4.66306 13.4435 4.27138C13.1674 3.8797 12.8014 3.55988 12.3763 3.33868C11.9512 3.11748 11.4792 3.00135 11 3H5C4.20435 3 3.44129 3.31607 2.87868 3.87868C2.31607 4.44129 2 5.20435 2 6C2.00441 6.74005 2.28221 7.45236 2.78 8C2.28805 8.55002 2.01607 9.26207 2.01607 10C2.01607 10.7379 2.28805 11.45 2.78 12C2.28805 12.55 2.01607 13.2621 2.01607 14C2.01607 14.7379 2.28805 15.45 2.78 16C2.28221 16.5476 2.00441 17.2599 2 18C2 18.7956 2.31607 19.5587 2.87868 20.1213C3.44129 20.6839 4.20435 21 5 21H19C19.5778 20.9969 20.1423 20.8271 20.6259 20.5108C21.1094 20.1946 21.4914 19.7455 21.7259 19.2174C21.9603 18.6894 22.0373 18.1049 21.9476 17.5341C21.8578 16.9633 21.6052 16.4306 21.22 16C21.712 15.45 21.9839 14.7379 21.9839 14C21.9839 13.2621 21.712 12.55 21.22 12ZM11 19H5C4.73478 19 4.48043 18.8946 4.29289 18.7071C4.10536 18.5196 4 18.2652 4 18C4 17.7348 4.10536 17.4804 4.29289 17.2929C4.48043 17.1054 4.73478 17 5 17H11C11.2652 17 11.5196 17.1054 11.7071 17.2929C11.8946 17.4804 12 17.7348 12 18C12 18.2652 11.8946 18.5196 11.7071 18.7071C11.5196 18.8946 11.2652 19 11 19ZM11 15H5C4.73478 15 4.48043 14.8946 4.29289 14.7071C4.10536 14.5196 4 14.2652 4 14C4 13.7348 4.10536 13.4804 4.29289 13.2929C4.48043 13.1054 4.73478 13 5 13H11C11.2652 13 11.5196 13.1054 11.7071 13.2929C11.8946 13.4804 12 13.7348 12 14C12 14.2652 11.8946 14.5196 11.7071 14.7071C11.5196 14.8946 11.2652 15 11 15ZM11 11H5C4.73478 11 4.48043 10.8946 4.29289 10.7071C4.10536 10.5196 4 10.2652 4 10C4 9.73478 4.10536 9.48043 4.29289 9.29289C4.48043 9.10536 4.73478 9 5 9H11C11.2652 9 11.5196 9.10536 11.7071 9.29289C11.8946 9.48043 12 9.73478 12 10C12 10.2652 11.8946 10.5196 11.7071 10.7071C11.5196 10.8946 11.2652 11 11 11ZM11 7H5C4.73478 7 4.48043 6.89464 4.29289 6.70711C4.10536 6.51957 4 6.26522 4 6C4 5.73478 4.10536 5.48043 4.29289 5.29289C4.48043 5.10536 4.73478 5 5 5H11C11.2652 5 11.5196 5.10536 11.7071 5.29289C11.8946 5.48043 12 5.73478 12 6C12 6.26522 11.8946 6.51957 11.7071 6.70711C11.5196 6.89464 11.2652 7 11 7ZM19.69 18.71C19.6014 18.8035 19.4942 18.8776 19.3755 18.9275C19.2567 18.9774 19.1288 19.0021 19 19H13.82C14.0598 18.3549 14.0598 17.6451 13.82 17H19C19.2652 17 19.5196 17.1054 19.7071 17.2929C19.8946 17.4804 20 17.7348 20 18C19.9982 18.133 19.9698 18.2643 19.9165 18.3862C19.8633 18.5082 19.7863 18.6182 19.69 18.71ZM19.69 14.71C19.6014 14.8035 19.4942 14.8776 19.3755 14.9275C19.2567 14.9774 19.1288 15.0021 19 15H13.82C14.0598 14.3549 14.0598 13.6451 13.82 13H19C19.2652 13 19.5196 13.1054 19.7071 13.2929C19.8946 13.4804 20 13.7348 20 14C19.9982 14.133 19.9698 14.2643 19.9165 14.3862C19.8633 14.5082 19.7863 14.6182 19.69 14.71ZM19.69 10.71C19.6014 10.8035 19.4942 10.8776 19.3755 10.9275C19.2567 10.9774 19.1288 11.0021 19 11H13.82C14.0598 10.3549 14.0598 9.6451 13.82 9H19C19.2652 9 19.5196 9.10536 19.7071 9.29289C19.8946 9.48043 20 9.73478 20 10C19.9982 10.133 19.9698 10.2643 19.9165 10.3862C19.8633 10.5082 19.7863 10.6182 19.69 10.71Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="credit-sheet-text">
                    <p className="credit-sheet-helper">
                      You have a $5,000 credit limit that you can draw from whenever you want to trade
                      more than your available cash.
                    </p>
                  </div>
                </div>
              </section>

              <section className="credit-sheet-section">
                <div className="credit-sheet-row">
                  <div className="credit-sheet-icon credit-sheet-icon--interest">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M7.75782 10.7578C8.35116 10.7578 8.93118 10.5818 9.42453 10.2522C9.91787 9.92255 10.3024 9.45401 10.5295 8.90583C10.7565 8.35766 10.8159 7.75446 10.7002 7.17251C10.5844 6.59057 10.2987 6.05602 9.87914 5.63646C9.45958 5.21691 8.92503 4.93118 8.34309 4.81543C7.76114 4.69967 7.15794 4.75908 6.60976 4.98615C6.06159 5.21321 5.59305 5.59773 5.26341 6.09107C4.93376 6.58442 4.75782 7.16444 4.75782 7.75778C4.75868 8.55317 5.07503 9.31572 5.63745 9.87814C6.19987 10.4406 6.96243 10.7569 7.75782 10.7578ZM7.75782 6.75778C7.9556 6.75778 8.14894 6.81643 8.31339 6.92631C8.47783 7.0362 8.60601 7.19237 8.68169 7.3751C8.75738 7.55783 8.77719 7.75889 8.7386 7.95287C8.70002 8.14686 8.60477 8.32504 8.46492 8.46489C8.32507 8.60474 8.14689 8.69998 7.95291 8.73857C7.75892 8.77715 7.55786 8.75735 7.37513 8.68166C7.19241 8.60598 7.03623 8.4778 6.92635 8.31335C6.81646 8.1489 6.75782 7.95557 6.75782 7.75778C6.75799 7.49262 6.86341 7.23837 7.0509 7.05087C7.2384 6.86337 7.49265 6.75796 7.75782 6.75778ZM16.2422 13.2422C15.6489 13.2422 15.0688 13.4181 14.5755 13.7478C14.0821 14.0774 13.6976 14.5459 13.4706 15.0941C13.2435 15.6423 13.1841 16.2455 13.2998 16.8274C13.4156 17.4094 13.7013 17.9439 14.1209 18.3635C14.5404 18.783 15.075 19.0688 15.6569 19.1845C16.2389 19.3003 16.8421 19.2409 17.3902 19.0138C17.9384 18.7867 18.407 18.4022 18.7366 17.9089C19.0662 17.4155 19.2422 16.8355 19.2422 16.2422C19.2413 15.4468 18.925 14.6842 18.3626 14.1218C17.8001 13.5594 17.0376 13.243 16.2422 13.2422ZM16.2422 17.2422C16.0444 17.2422 15.8511 17.1835 15.6866 17.0736C15.5222 16.9638 15.394 16.8076 15.3183 16.6248C15.2426 16.4421 15.2228 16.2411 15.2614 16.0471C15.3 15.8531 15.3952 15.6749 15.5351 15.5351C15.6749 15.3952 15.8531 15.3 16.0471 15.2614C16.2411 15.2228 16.4422 15.2426 16.6249 15.3183C16.8076 15.394 16.9638 15.5221 17.0737 15.6866C17.1835 15.851 17.2422 16.0444 17.2422 16.2422C17.242 16.5073 17.1366 16.7616 16.9491 16.9491C16.7616 17.1366 16.5074 17.242 16.2422 17.2422ZM19.707 4.29297C19.6142 4.20009 19.504 4.12641 19.3826 4.07614C19.2613 4.02587 19.1313 4 19 4C18.8687 4 18.7386 4.02587 18.6173 4.07614C18.496 4.12641 18.3858 4.20009 18.2929 4.29297L4.29295 18.293C4.19914 18.3856 4.12458 18.4959 4.07356 18.6174C4.02253 18.739 3.99605 18.8695 3.99564 19.0013C3.99523 19.1331 4.02089 19.2638 4.07116 19.3856C4.12142 19.5075 4.19529 19.6182 4.28851 19.7115C4.38174 19.8047 4.49248 19.8786 4.61436 19.9288C4.73624 19.9791 4.86686 20.0047 4.99869 20.0043C5.13053 20.0039 5.26098 19.9774 5.38254 19.9264C5.5041 19.8753 5.61437 19.8008 5.707 19.707L19.707 5.70697C19.7999 5.61414 19.8735 5.50393 19.9238 5.38262C19.9741 5.26131 20 5.13128 20 4.99997C20 4.86866 19.9741 4.73864 19.9238 4.61733C19.8735 4.49602 19.7999 4.3858 19.707 4.29297Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="credit-sheet-text">
                    <p className="credit-sheet-helper">
                      Interest accrues daily at 10% APR. No fixed repayment date. Pay it back when you sell or
                      deposit funds.
                    </p>
                  </div>
                </div>
              </section>

              <section className="credit-sheet-section">
                <div className="credit-sheet-row">
                  <div className="credit-sheet-icon credit-sheet-icon--risk">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 14C11.7528 14 11.5111 14.0733 11.3055 14.2107C11.1 14.348 10.9398 14.5432 10.8452 14.7716C10.7505 15.0001 10.7258 15.2514 10.774 15.4939C10.8223 15.7363 10.9413 15.9591 11.1161 16.1339C11.2909 16.3087 11.5137 16.4277 11.7561 16.476C11.9986 16.5242 12.25 16.4995 12.4784 16.4049C12.7068 16.3102 12.902 16.15 13.0393 15.9445C13.1767 15.7389 13.25 15.4972 13.25 15.25C13.25 14.9185 13.1183 14.6005 12.8839 14.3661C12.6495 14.1317 12.3315 14 12 14ZM12 12.5C12.2652 12.5 12.5196 12.3946 12.7071 12.2071C12.8946 12.0196 13 11.7652 13 11.5V8.5C13 8.23478 12.8946 7.98043 12.7071 7.79289C12.5196 7.60536 12.2652 7.5 12 7.5C11.7348 7.5 11.4804 7.60536 11.2929 7.79289C11.1054 7.98043 11 8.23478 11 8.5V11.5C11 11.7652 11.1054 12.0196 11.2929 12.2071C11.4804 12.3946 11.7348 12.5 12 12.5ZM12 2C10.0222 2 8.08879 2.58649 6.4443 3.6853C4.79981 4.78412 3.51809 6.3459 2.76121 8.17317C2.00433 10.0004 1.8063 12.0111 2.19215 13.9509C2.578 15.8907 3.53041 17.6725 4.92894 19.0711C6.32746 20.4696 8.10929 21.422 10.0491 21.8079C11.9889 22.1937 13.9996 21.9957 15.8268 21.2388C17.6541 20.4819 19.2159 19.2002 20.3147 17.5557C21.4135 15.9112 22 13.9778 22 12C21.9971 9.34874 20.9425 6.80691 19.0678 4.93219C17.1931 3.05746 14.6513 2.00295 12 2ZM12 20C10.4178 20 8.87104 19.5308 7.55544 18.6518C6.23985 17.7727 5.21447 16.5233 4.60897 15.0615C4.00347 13.5997 3.84504 11.9911 4.15372 10.4393C4.4624 8.88743 5.22433 7.46197 6.34315 6.34315C7.46197 5.22433 8.88743 4.4624 10.4393 4.15372C11.9911 3.84504 13.5997 4.00346 15.0615 4.60896C16.5233 5.21447 17.7727 6.23984 18.6518 7.55544C19.5308 8.87103 20 10.4177 20 12C19.9976 14.121 19.1539 16.1544 17.6542 17.6542C16.1544 19.1539 14.121 19.9976 12 20Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="credit-sheet-text">
                    <p className="credit-sheet-helper">
                      If BTC drops too far, we&apos;ll automatically sell your position to repay the loan. You&apos;ll see your
                      exact liquidation price before you confirm.
                    </p>
                  </div>
                </div>
              </section>

            </div>
            <div className="credit-sheet-footer">
              <button
                type="button"
                className="credit-sheet-button credit-sheet-button--primary"
                onClick={() => closeCreditSheet()}
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

function MoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function PortfolioNavIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function MoreNavIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ConvertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function BackChevronIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default Portfolio;

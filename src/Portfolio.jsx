import './Portfolio.css';

function Portfolio() {
  return (
    <div className="portfolio-screen">
      {/* Status bar */}
      <header className="status-bar">
        <span className="status-time">11:06</span>
        <span className="status-right">
          <span className="status-battery">49%</span>
        </span>
      </header>

      {/* Main header */}
      <section className="portfolio-header">
        <div className="header-left">
          <div className="avatar">PS</div>
          <div className="header-text">
            <h1 className="portfolio-title">Portfolio</h1>
            <p className="portfolio-balance">$0.00</p>
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
              <div className="asset-icon asset-btc">₿</div>
              <div className="asset-info">
                <span className="asset-name">Bitcoin</span>
                <span className="asset-amount">0.0599 BTC</span>
              </div>
              <span className="asset-value">$4,165</span>
            </li>
            <li className="balance-row">
              <div className="asset-icon asset-eth">Ξ</div>
              <div className="asset-info">
                <span className="asset-name">Ethereum</span>
                <span className="asset-amount">1.4600 ETH</span>
              </div>
              <span className="asset-value">$3,012</span>
            </li>
          </ul>
        </div>

        <div className="balances-card balances-card-empty" />
      </section>

      {/* Action buttons */}
      <div className="action-buttons">
        <button type="button" className="btn btn-secondary">Withdraw</button>
        <button type="button" className="btn btn-primary">Trade</button>
      </div>

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

export default Portfolio;

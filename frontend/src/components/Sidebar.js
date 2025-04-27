import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// 아이콘
import { FaHome, FaRegStar, FaTimes } from 'react-icons/fa';

const Sidebar = ({ popularStocks, setSelectedStock, closeSidebar, sidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleStockClick = (symbol) => {
    setSelectedStock(symbol);
    navigate(`/stock/${symbol}`);
    closeSidebar();
  };

  return (
    <aside className={`sidebar right-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <button className="sidebar-close" onClick={closeSidebar}>
        <FaTimes />
      </button>

      <div className="sidebar-section">
        <h3 className="sidebar-title">메뉴</h3>
        <ul className="sidebar-items">
          <li 
            className={`sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => {
              navigate('/dashboard');
              closeSidebar();
            }}
          >
            <FaHome /> 대시보드
          </li>
          <li 
            className={`sidebar-item ${location.pathname === '/watchlist' ? 'active' : ''}`}
            onClick={() => {
              navigate('/watchlist');
              closeSidebar();
            }}
          >
            <FaRegStar /> 관심종목
          </li>
        </ul>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">인기 주식</h3>
        <div className="sidebar-stocks-container">
          <ul className="sidebar-items">
            {popularStocks.map((stock) => (
              <li 
                key={stock.symbol} 
                className={`sidebar-item ${location.pathname === `/stock/${stock.symbol}` ? 'active' : ''}`}
                onClick={() => handleStockClick(stock.symbol)}
              >
                <div className="stock-item-content">
                  <div className="symbol">{stock.symbol}</div>
                  <div className="korean-name">{stock.koreanName}</div>
                  <div className="sector">{stock.koreanSector || stock.sector}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
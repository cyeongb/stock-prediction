//Watchlist.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 개별 주식 컴포넌트
import StockCard from '../components/StockCard';

const Watchlist = ({ setSelectedStock }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistData, setWatchlistData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 로컬 스토리지에서 관심종목 불러오기
  useEffect(() => {
    const loadWatchlist = () => {
      const savedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
      setWatchlist(savedWatchlist);
    };

    loadWatchlist();
  }, []);

  // 관심종목 데이터 가져오기
  useEffect(() => {
    const fetchWatchlistData = async () => {
      if (watchlist.length === 0) {
        setWatchlistData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // 각 관심종목의 정보 가져오기 symbol: 종목
        const stockPromises = watchlist.map(symbol => 
          axios.get(`/stocks/info/${symbol}`)
        );
        
        //Promise.all : 모든 api 요청 실행
        const stockResponses = await Promise.all(stockPromises);
        console.log("stockResponses =>>> ",stockResponses);
        const stocksData = stockResponses.map(response => response.data);
        
        setWatchlistData(stocksData);
      } catch (error) {
        console.error('관심종목 데이터를 불러오는 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlistData();
  }, [watchlist]);

  // 관심종목에서 제거
  const removeFromWatchlist = (symbol) => {
    const updatedWatchlist = watchlist.filter(item => item !== symbol);
    setWatchlist(updatedWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
  };

  // 주식 카드 클릭 처리
  const handleStockClick = (symbol) => {
    setSelectedStock(symbol);
    navigate(`/stock/${symbol}`);
  };

  // 관심종목 비어있을 때 처리
  if (!isLoading && watchlist.length === 0) {
    return (
      <div className="watchlist-empty">
        <h1 className="page-title">관심종목</h1>
        <div className="empty-message">
          <h2>관심종목이 없습니다</h2>
          <p>주식 페이지에서 별표(⭐) 아이콘을 클릭하여 관심종목에 추가하세요.</p>
          <button 
            className="btn primary"
            onClick={() => navigate('/dashboard')}
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist">
      <h1 className="page-title">관심종목</h1>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>관심종목을 불러오는 중...</p>
        </div>
      ) : (
        <div className="watchlist-grid">
          {watchlistData.map((stock) => (
            <StockCard 
              key={stock.symbol} 
              stock={stock} 
              onClick={() => handleStockClick(stock.symbol)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
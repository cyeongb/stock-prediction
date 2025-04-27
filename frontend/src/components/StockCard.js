import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

// 아이콘
import { FaStar, FaRegStar } from 'react-icons/fa';

const StockCard = ({ stock, onClick, koreanStockNames, koreanSectorNames }) => {
  const [chartData, setChartData] = useState(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 관심종목 확인
    const checkWatchlist = () => {
      const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
      setIsWatchlisted(watchlist.includes(stock.symbol));
    };

    // 주식 차트 데이터 가져오기
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/stocks/history/${stock.symbol}`, {
          params: { timeframe: 'daily', period: '1mo' }
        });
        
        // 데이터 처리
        const data = response.data;
        const processedData = {
          dates: data.dates.slice(-14), // 최근 14일
          values: data.close.slice(-14)
        };
        
        setChartData(processedData);
      } catch (error) {
        console.error(`${stock.symbol} 차트 데이터를 불러오는 중 오류 발생:`, error);
        
        // 오류 시 랜덤 데이터 생성 (데모용)
        const fakeData = {
          dates: Array.from({ length: 14 }, (_, i) => 
            new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
          ),
          values: Array.from({ length: 14 }, (_, i) => 
            100 + Math.random() * 20 + i
          )
        };
        setChartData(fakeData);
      } finally {
        setIsLoading(false);
      }
    };

    checkWatchlist();
    fetchChartData();
  }, [stock.symbol]);

  // 관심종목 토글
  const toggleWatchlist = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    
    if (isWatchlisted) {
      // 제거
      const updatedWatchlist = watchlist.filter(symbol => symbol !== stock.symbol);
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    } else {
      // 추가
      watchlist.push(stock.symbol);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }
    
    setIsWatchlisted(!isWatchlisted);
  };

  // 가격 변화율 계산
  const priceChange = stock.fiftyTwoWeekHigh && stock.fiftyTwoWeekLow
    ? ((stock.market_cap / 1000000) % 10) - 5 // 임의의 변화율 (실제로는 API에서 가져온 값 사용)
    : 0;

  // 한국어 이름 가져오기
  const koreanName = koreanStockNames[stock.symbol] || stock.name;
  
  // 한국어 섹터 및 산업 가져오기
  const koreanSector = koreanSectorNames && koreanSectorNames[stock.sector] || stock.sector;
  const koreanIndustry = koreanSectorNames && koreanSectorNames[stock.industry] || stock.industry;

  return (
    <div className="card stock-card" onClick={onClick}>
      <div className="card-header">
        <div className="stock-info">
          <div className="stock-symbol">{stock.symbol}</div>
          <div className="stock-korean-name">{koreanName}</div>
        </div>
        <button 
          className="watchlist-btn" 
          onClick={toggleWatchlist}
          aria-label={isWatchlisted ? "관심종목에서 제거" : "관심종목에 추가"}
        >
          {isWatchlisted ? <FaStar className="starred" /> : <FaRegStar />}
        </button>
      </div>
      
      <div className="card-body">
        {stock.market_cap && (
          <div className="price-info">
            <div className="current-price">
              ${(stock.market_cap / 1000000000).toFixed(2)}B
            </div>
            <div className={`price-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="chart-loading">
            <div className="spinner-small"></div>
          </div>
        )}
        
        {!isLoading && chartData && (
          <div className="mini-chart">
            <Plot
              data={[
                {
                  x: chartData.dates,
                  y: chartData.values,
                  type: 'scatter',
                  mode: 'lines',
                  line: {
                    color: priceChange >= 0 ? '#46d369' : '#e50914',
                    width: 1.5
                  }
                }
              ]}
              layout={{
                autosize: true,
                height: 80,
                margin: { l: 0, r: 0, t: 0, b: 0 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                xaxis: { showgrid: false, zeroline: false, showticklabels: false },
                yaxis: { showgrid: false, zeroline: false, showticklabels: false }
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>
      
      <div className="card-footer">
        <div className="sector">{koreanSector || '해당 없음'}</div>
        <div className="industry">{koreanIndustry || '해당 없음'}</div>
      </div>
    </div>
  );
};

export default StockCard;
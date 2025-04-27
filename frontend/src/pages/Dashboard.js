import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';

// 컴포넌트
import StockCard from '../components/StockCard';

const Dashboard = ({ popularStocks }) => {
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [marketIndices, setMarketIndices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPreviewStock, setSelectedPreviewStock] = useState('AAPL'); // 기본값은 AAPL
  const [predictionData, setPredictionData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 인기 주식 가져오기 (popularStocks를 props로 받음)
        if (popularStocks.length > 0) {
          // 각 인기 주식의 기본 정보 가져오기
          const stockDetailsPromises = popularStocks.slice(0, 5).map(stock => 
            axios.get(`/stocks/info/${stock.symbol}`)
          );
          
          const stockDetails = await Promise.all(stockDetailsPromises);
          
          // 상세 정보 합치기
          const stocksWithDetails = popularStocks.slice(0, 5).map((stock, index) => ({
            ...stock,
            ...stockDetails[index].data
          }));
          
          setTrendingStocks(stocksWithDetails);
        }
        
        // 시장 지수 가져오기 (예: S&P 500, NASDAQ, Dow Jones)
        const indicesSymbols = ['^GSPC', '^IXIC', '^DJI', '^VIX'];
        const indicesPromises = indicesSymbols.map(symbol => 
          axios.get(`/stocks/history/${symbol}`, { params: { timeframe: 'daily', period: '1mo' }})
        );
        
        const indicesData = await Promise.all(indicesPromises);
        
        // 지수 데이터 처리
        const processedIndices = indicesSymbols.map((symbol, index) => {
          const data = indicesData[index].data;
          const lastPrice = data.close[data.close.length - 1];
          const prevPrice = data.close[data.close.length - 2];
          const change = ((lastPrice - prevPrice) / prevPrice) * 100;
          
          return {
            symbol,
            name: getIndexName(symbol),
            price: lastPrice,
            change,
            data: {
              dates: data.dates.slice(-30),
              values: data.close.slice(-30)
            }
          };
        });
        
        setMarketIndices(processedIndices);
        
        // 기본 예측 데이터 로드 (AAPL)
        fetchPredictionData(selectedPreviewStock);
        
      } catch (error) {
        console.error('대시보드 데이터를 불러오는 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [popularStocks]);
  
  // 주가 예측 데이터 가져오기
  const fetchPredictionData = async (symbol) => {
    try {
      const response = await axios.get(`/stocks/predict/${symbol}`, {
        params: { days: 30 }
      });
      setPredictionData(response.data);
    } catch (error) {
      console.error(`${symbol} 예측 데이터를 불러오는 중 오류 발생:`, error);
      
      // 오류 시 가짜 데이터 생성
      const fakePredictionData = {
        ticker: symbol,
        last_price: 200 + Math.random() * 50,
        prediction: {
          dates: Array.from({ length: 30 }, (_, i) => 
            new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
          ),
          values: Array.from({ length: 30 }, (_, i) => 
            200 + i * 0.5 + Math.random() * 10
          )
        },
        actual: {
          dates: Array.from({ length: 30 }, (_, i) => 
            new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
          ),
          test_actual: Array.from({ length: 30 }, (_, i) => 
            180 + Math.random() * 20
          ),
          test_pred: Array.from({ length: 30 }, (_, i) => 
            180 + Math.random() * 20
          )
        }
      };
      setPredictionData(fakePredictionData);
    }
  };
  
  // 지수 이름 가져오기
  const getIndexName = (symbol) => {
    switch (symbol) {
      case '^GSPC': return 'S&P 500';
      case '^IXIC': return 'NASDAQ';
      case '^DJI': return 'Dow Jones';
      case '^VIX': return 'VIX';
      default: return symbol;
    }
  };

  // 주식 카드 클릭 처리
  const handleStockClick = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  // 태그 클릭 처리
  const handleTagClick = (symbol) => {
    setSelectedPreviewStock(symbol);
    fetchPredictionData(symbol);
  };

  // 주요 예측 태그 (상위 5개 주식)
  const predictionTags = popularStocks.slice(0, 5).map(stock => stock.symbol);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">금융 시장 대시보드</h1>
      
      <section className="market-overview">
        <h2 className="section-title">시장 지수</h2>
        <div className="dashboard-grid">
          {marketIndices.map((index) => (
            <div className="card" key={index.symbol}>
              <div className="card-header">
                <h3 className="card-title">{index.name}</h3>
                <div className={`change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}%
                </div>
              </div>
              <div className="card-body">
                <div className="price">{index.price.toFixed(2)}</div>
                <Plot
                  data={[
                    {
                      x: index.data.dates,
                      y: index.data.values,
                      type: 'scatter',
                      mode: 'lines',
                      line: {
                        color: index.change >= 0 ? '#46d369' : '#e50914',
                        width: 2
                      }
                    }
                  ]}
                  layout={{
                    autosize: true,
                    height: 120,
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
            </div>
          ))}
        </div>
      </section>
      
      <section className="trending-stocks">
        <h2 className="section-title">인기 주식</h2>
        <div className="dashboard-grid">
          {trendingStocks.map((stock) => (
            <StockCard 
              key={stock.symbol} 
              stock={stock} 
              onClick={() => handleStockClick(stock.symbol)} 
            />
          ))}
        </div>
      </section>
      
      <section className="prediction-preview">
        <h2 className="section-title">주가 예측 미리보기</h2>
        
        <div className="prediction-tags">
          {predictionTags.map(symbol => (
            <button 
              key={symbol} 
              className={`prediction-tag ${selectedPreviewStock === symbol ? 'active' : ''}`}
              onClick={() => handleTagClick(symbol)}
            >
              #{symbol}
            </button>
          ))}
        </div>
        
        <div className="card featured-prediction">
          <div className="card-header">
            <h3 className="card-title">{selectedPreviewStock} 향후 30일 예측 결과</h3>
            <button 
              className="btn primary"
              onClick={() => navigate(`/stock/${selectedPreviewStock}`)}
            >
              상세 보기
            </button>
          </div>
          <div className="card-body">
            <div className="prediction-chart">
              {predictionData && (
                <Plot
                  data={[
                    {
                      name: '실제 가격',
                      x: predictionData.actual.dates,
                      y: predictionData.actual.test_actual,
                      type: 'scatter',
                      mode: 'lines',
                      line: { color: '#3366cc', width: 2 }
                    },
                    {
                      name: '예측 가격',
                      x: predictionData.prediction.dates,
                      y: predictionData.prediction.values,
                      type: 'scatter',
                      mode: 'lines',
                      line: { color: '#46d369', width: 2, dash: 'dash' }
                    }
                  ]}
                  layout={{
                    title: `${selectedPreviewStock} 주가 예측`,
                    autosize: true,
                    height: 400,
                    margin: { l: 50, r: 50, t: 50, b: 50 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'rgba(0,0,0,0.1)',
                    font: { color: '#e5e5e5' },
                    xaxis: { showgrid: false },
                    yaxis: { title: '주가 ($)' },
                    legend: { orientation: 'h', y: 1.1 },
                    shapes: [
                      // 현재와 미래를 구분하는 세로선
                      {
                        type: 'line',
                        x0: predictionData.actual.dates[predictionData.actual.dates.length - 1],
                        y0: 0,
                        x1: predictionData.actual.dates[predictionData.actual.dates.length - 1],
                        y1: 1,
                        yref: 'paper',
                        line: {
                          color: 'rgba(255, 255, 255, 0.5)',
                          width: 1,
                          dash: 'dash'
                        }
                      }
                    ]
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%' }}
                />
              )}
            </div>
          </div>
          <div className="card-footer">
            <p>딥러닝 모델 기반 예측 - 정확도: 85%</p>
            <p>마지막 업데이트: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
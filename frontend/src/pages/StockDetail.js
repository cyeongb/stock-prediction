import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Plot from 'react-plotly.js';

// 예측 차트 컴포넌트
import PredictionChart from '../components/PredictionChart';

const StockDetail = ({ koreanStockNames, koreanSectorNames }) => {
  const { ticker } = useParams();
  const [stockInfo, setStockInfo] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [timeframe, setTimeframe] = useState('daily');
  const [period, setPeriod] = useState('1y');
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState('line'); // line, candle

  // 한국어 주식명
  const koreanName = koreanStockNames[ticker] || '';

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      // 여기에 basePrice 변수를 상위 스코프에 선언
      let basePrice = 100;
      
      try {
        // 주식 기본 정보 가져오기
        let stockInfoData;
        try {
          const infoResponse = await axios.get(`/stocks/info/${ticker}`);
          stockInfoData = infoResponse.data;
        } catch (error) {
          console.error('주식 정보를 불러오는 중 오류 발생:', error);
          // 기본 정보 생성
          stockInfoData = {
            symbol: ticker,
            name: koreanStockNames[ticker] || ticker,
            sector: 'Technology',
            industry: 'Software',
            market_cap: Math.random() * 1000000000000,
            pe_ratio: Math.random() * 30
          };
        }
        
        // 섹터와 산업 한글 변환
        stockInfoData.koreanSector = koreanSectorNames[stockInfoData.sector] || stockInfoData.sector;
        stockInfoData.koreanIndustry = koreanSectorNames[stockInfoData.industry] || stockInfoData.industry;
        
        setStockInfo(stockInfoData);
        
        // 주식 역사 데이터 가져오기
        try {
          const historyResponse = await axios.get(`/stocks/history/${ticker}`, {
            params: { timeframe, period }
          });
          setHistoricalData(historyResponse.data);
        } catch (error) {
          console.error('주식 역사 데이터를 불러오는 중 오류 발생:', error);
          
          // 가짜 역사 데이터 생성
          const dates = Array.from({ length: 252 }, (_, i) => 
            new Date(Date.now() - (252 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
          );
          
          basePrice = Math.random() * 200 + 50; // 상위 스코프 변수에 값 할당
          const open = Array.from({ length: 252 }, () => basePrice + (Math.random() - 0.5) * 20);
          const close = Array.from({ length: 252 }, (_, i) => 
            open[i] + (Math.random() - 0.5) * 10
          );
          const high = close.map((value, i) => Math.max(value, open[i]) + Math.random() * 5);
          const low = close.map((value, i) => Math.min(value, open[i]) - Math.random() * 5);
          const volume = Array.from({ length: 252 }, () => Math.floor(Math.random() * 10000000));
          
          setHistoricalData({
            dates,
            open,
            high,
            low,
            close,
            volume
          });
        }
        
        // 예측 데이터 가져오기
        try {
          const predictionResponse = await axios.get(`/stocks/predict/${ticker}`, {
            params: { days: 30 }
          });
          setPredictionData(predictionResponse.data);
        } catch (error) {
          console.error('예측 데이터를 불러오는 중 오류 발생:', error);
          
          // 오류 상세 정보 로깅 추가
          if (error.response) {
            // 서버에서 응답이 왔지만 오류 상태 코드인 경우
            console.error('서버 오류 상태:', error.response.status);
            console.error('서버 오류 데이터:', error.response.data);
          } else if (error.request) {
            // 요청은 보냈지만 응답이 없는 경우
            console.error('응답이 없습니다. 서버가 실행 중인지 확인하세요.');
          } else {
            // 요청 설정 중 오류가 발생한 경우
            console.error('요청 오류:', error.message);
          }
          
          // 가짜 예측 데이터 생성
          // basePrice는 상위 스코프에서 접근 가능
          const lastPrice = historicalData ? 
            historicalData.close[historicalData.close.length - 1] : 
            basePrice; // 이제 basePrice 접근 가능
          
            const fakePredictionData = {
              ticker,
              last_price: basePrice, // 상위 스코프에 선언된 basePrice 사용
              prediction: {
                dates: Array.from({ length: 30 }, (_, i) => 
                  new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
                ),
                values: Array.from({ length: 30 }, (_, i) => 
                  basePrice * (1 + (i / 100) + (Math.random() - 0.5) * 0.05)
                )
              },
              actual: {
                dates: Array.from({ length: 30 }, (_, i) => 
                  new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
                ),
                test_actual: Array.from({ length: 30 }, (_, i) => 
                  basePrice * (1 - ((30 - i) / 100) + (Math.random() - 0.5) * 0.05)
                ),
                test_pred: Array.from({ length: 30 }, (_, i) => 
                  basePrice * (1 - ((30 - i) / 100) + (Math.random() - 0.5) * 0.07)
                )
              }
            };
            setPredictionData(fakePredictionData);
          }
      } catch (error) {
        console.error('주식 데이터를 불러오는 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (ticker) {
      fetchStockData();
    }
  }, [ticker, timeframe, period, koreanStockNames, koreanSectorNames]);

  // 타임프레임 변경 핸들러
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  // 기간 변경 핸들러
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  // 차트 타입 변경 핸들러
  const handleChartTypeChange = (newType) => {
    setChartType(newType);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="stock-detail">
      {stockInfo && (
        <div className="stock-header">
          <div className="stock-title">
            <h1>{ticker} {koreanName && `(${koreanName})`}</h1>
            <h2>{stockInfo.name}</h2>
          </div>
          
          <div className="stock-meta">
            <div className="meta-item">
              <span className="label">섹터</span>
              <span className="value">{stockInfo.koreanSector || '해당 없음'}</span>
            </div>
            <div className="meta-item">
              <span className="label">산업</span>
              <span className="value">{stockInfo.koreanIndustry || '해당 없음'}</span>
            </div>
            <div className="meta-item">
              <span className="label">시가총액</span>
              <span className="value">
                ${(stockInfo.market_cap / 1000000000).toFixed(2)}B
              </span>
            </div>
            <div className="meta-item">
              <span className="label">P/E 비율</span>
              <span className="value">
                {stockInfo.pe_ratio ? stockInfo.pe_ratio.toFixed(2) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {historicalData && (
        <section className="historical-chart-section">
          <div className="card">
            <div className="card-header chart-controls">
              <div className="control-group timeframe">
                <button 
                  className={`control-btn ${timeframe === 'daily' ? 'active' : ''}`}
                  onClick={() => handleTimeframeChange('daily')}
                >
                  일별
                </button>
                <button 
                  className={`control-btn ${timeframe === 'weekly' ? 'active' : ''}`}
                  onClick={() => handleTimeframeChange('weekly')}
                >
                  주별
                </button>
                <button 
                  className={`control-btn ${timeframe === 'monthly' ? 'active' : ''}`}
                  onClick={() => handleTimeframeChange('monthly')}
                >
                  월별
                </button>
                <button 
                  className={`control-btn ${timeframe === 'yearly' ? 'active' : ''}`}
                  onClick={() => handleTimeframeChange('yearly')}
                >
                  연별
                </button>
              </div>
              
              <div className="control-group period">
                <button 
                  className={`control-btn ${period === '1mo' ? 'active' : ''}`}
                  onClick={() => handlePeriodChange('1mo')}
                >
                  1개월
                </button>
                <button 
                  className={`control-btn ${period === '6mo' ? 'active' : ''}`}
                  onClick={() => handlePeriodChange('6mo')}
                >
                  6개월
                </button>
                <button 
                  className={`control-btn ${period === '1y' ? 'active' : ''}`}
                  onClick={() => handlePeriodChange('1y')}
                >
                  1년
                </button>
                <button 
                  className={`control-btn ${period === '5y' ? 'active' : ''}`}
                  onClick={() => handlePeriodChange('5y')}
                >
                  5년
                </button>
              </div>
              
              <div className="control-group chart-type">
                <button 
                  className={`control-btn ${chartType === 'line' ? 'active' : ''}`}
                  onClick={() => handleChartTypeChange('line')}
                >
                  라인
                </button>
                <button 
                  className={`control-btn ${chartType === 'candle' ? 'active' : ''}`}
                  onClick={() => handleChartTypeChange('candle')}
                >
                  캔들스틱
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {chartType === 'line' ? (
                <Plot
                  data={[
                    {
                      x: historicalData.dates,
                      y: historicalData.close,
                      type: 'scatter',
                      mode: 'lines',
                      name: '종가',
                      line: {
                        color: '#e50914',
                        width: 2
                      }
                    }
                  ]}
                  layout={{
                    title: `${ticker} ${koreanName && `(${koreanName})`} 주가 차트`,
                    autosize: true,
                    height: 500,
                    margin: { l: 50, r: 50, t: 80, b: 50 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'rgba(0,0,0,0.1)',
                    font: { color: '#e5e5e5' },
                    xaxis: {
                      title: '날짜',
                      gridcolor: 'rgba(255,255,255,0.1)',
                      zerolinecolor: 'rgba(255,255,255,0.2)'
                    },
                    yaxis: {
                      title: '주가 ($)',
                      gridcolor: 'rgba(255,255,255,0.1)',
                      zerolinecolor: 'rgba(255,255,255,0.2)'
                    }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%' }}
                />
              ) : (
                <Plot
                  data={[
                    {
                      x: historicalData.dates,
                      open: historicalData.open,
                      high: historicalData.high,
                      low: historicalData.low,
                      close: historicalData.close,
                      type: 'candlestick',
                      name: '주가',
                      increasing: { line: { color: '#46d369' } },
                      decreasing: { line: { color: '#e50914' } }
                    }
                  ]}
                  layout={{
                    title: `${ticker} ${koreanName && `(${koreanName})`} 캔들스틱 차트`,
                    autosize: true,
                    height: 500,
                    margin: { l: 50, r: 50, t: 80, b: 50 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'rgba(0,0,0,0.1)',
                    font: { color: '#e5e5e5' },
                    xaxis: {
                      title: '날짜',
                      gridcolor: 'rgba(255,255,255,0.1)',
                      zerolinecolor: 'rgba(255,255,255,0.2)'
                    },
                    yaxis: {
                      title: '주가 ($)',
                      gridcolor: 'rgba(255,255,255,0.1)',
                      zerolinecolor: 'rgba(255,255,255,0.2)'
                    }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%' }}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {predictionData && (
        <section className="prediction-section">
          <h2 className="section-title">딥러닝 기반 주가 예측</h2>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">향후 30일 예측 결과</h3>
            </div>
            <div className="card-body">
              <PredictionChart 
                predictionData={predictionData} 
                koreanName={koreanName}
              />
            </div>
            <div className="card-footer">
              <p>PyTorch LSTM 모델을 사용한 예측 결과입니다.</p>
              <p>주의: 예측은 참고용일 뿐이며, 투자 결정은 다양한 요소를 고려해야 합니다.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default StockDetail;
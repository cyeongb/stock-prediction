import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// 컴포넌트
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';

// 스타일
import './App.css';

// API 기본 설정
const API_BASE_URL = 'http://localhost:3000/api';
axios.defaults.baseURL = API_BASE_URL;

// 한국어 주식명 매핑
const koreanStockNames = {
  'AAPL': '애플',
  'MSFT': '마이크로소프트',
  'GOOGL': '알파벳',
  'AMZN': '아마존',
  'TSLA': '테슬라',
  'META': '메타플랫폼스',
  'NVDA': '엔비디아',
  'JPM': 'JP모건체이스',
  'V': '비자',
  'WMT': '월마트',
  'NFLX': '넷플릭스',
  'ADBE': '어도비',
  'CRM': '세일즈포스',
  'CSCO': '시스코',
  'PEP': '펩시코',
  'INTC': '인텔',
  'AMD': 'AMD',
  'PYPL': '페이팔',
  'CMCSA': '컴캐스트',
  'COST': '코스트코',
  'DIS': '디즈니',
  'TMUS': 'T-모바일',
  'IBM': 'IBM',
  'GS': '골드만삭스',
  'BA': '보잉',
  'UNH': '유나이티드헬스',
  'HD': '홈디포',
  'PG': '프록터앤갬블',
  'JNJ': '존슨앤존슨',
  'KO': '코카콜라'
};

// 섹터 한글명 매핑
const koreanSectorNames = {
  'Technology': '기술',
  'Consumer Cyclical': '소비재',
  'Communication Services': '통신 서비스',
  'Financial Services': '금융 서비스',
  'Consumer Defensive': '필수 소비재',
  'Healthcare': '헬스케어',
  'Industrials': '산업재',
  'Software - Infrastructure': '소프트웨어 - 인프라',
  'Internet Content & Information': '인터넷 콘텐츠 및 정보',
  'Internet Retail': '인터넷 소매',
  'Auto Manufacturers': '자동차 제조',
  'Semiconductors': '반도체',
  'Banks - Diversified': '은행 - 다각화',
  'Credit Services': '신용 서비스',
  'Discount Stores': '할인점',
  'Beverages - Non-Alcoholic': '음료 - 비알콜',
  'Electronic Components': '전자 부품',
  'Software - Application': '소프트웨어 - 애플리케이션',
  'Telecom Services': '통신 서비스',
  'Specialty Retail': '전문 소매',
  'Medical Devices': '의료 기기',
  'Pharmaceutical Retailers': '제약 소매',
  'Insurance - Diversified': '보험 - 다각화',
  'Restaurants': '레스토랑',
  'Aerospace & Defense': '항공우주 및 방위',
  'Entertainment': '엔터테인먼트',
  'Drug Manufacturers': '제약 제조',
  'Biotechnology': '생명공학',
  'Computer Hardware': '컴퓨터 하드웨어'
};

function App() {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [popularStocks, setPopularStocks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 인기 주식 가져오기 (20개로 확장)
  useEffect(() => {
    const fetchPopularStocks = async () => {
      try {
        // 실제 API 호출
        const response = await axios.get('/stocks/popular');
        
        // 20개로 확장된 목록 (API가 부족한 경우 추가 데이터 생성)
        let expandedStocks = [...response.data];
        
        // 기존 데이터가 20개 미만이면 추가 데이터 생성
        if (expandedStocks.length < 20) {
          const extraStocks = [
            {symbol: 'NFLX', name: 'Netflix, Inc.', sector: 'Communication Services'},
            {symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology'},
            {symbol: 'CRM', name: 'Salesforce, Inc.', sector: 'Technology'},
            {symbol: 'CSCO', name: 'Cisco Systems, Inc.', sector: 'Technology'},
            {symbol: 'PEP', name: 'PepsiCo, Inc.', sector: 'Consumer Defensive'},
            {symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology'},
            {symbol: 'AMD', name: 'Advanced Micro Devices, Inc.', sector: 'Technology'},
            {symbol: 'PYPL', name: 'PayPal Holdings, Inc.', sector: 'Financial Services'},
            {symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Communication Services'},
            {symbol: 'COST', name: 'Costco Wholesale Corporation', sector: 'Consumer Defensive'},
            {symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Communication Services'},
            {symbol: 'TMUS', name: 'T-Mobile US, Inc.', sector: 'Communication Services'},
            {symbol: 'IBM', name: 'International Business Machines', sector: 'Technology'},
            {symbol: 'GS', name: 'Goldman Sachs Group, Inc.', sector: 'Financial Services'},
            {symbol: 'BA', name: 'Boeing Company', sector: 'Industrials'},
            {symbol: 'UNH', name: 'UnitedHealth Group Incorporated', sector: 'Healthcare'},
            {symbol: 'HD', name: 'Home Depot, Inc.', sector: 'Consumer Cyclical'},
            {symbol: 'PG', name: 'Procter & Gamble Company', sector: 'Consumer Defensive'},
            {symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare'},
            {symbol: 'KO', name: 'Coca-Cola Company', sector: 'Consumer Defensive'}
          ];
          
          // 필요한 만큼만 추가
          const neededCount = 20 - expandedStocks.length;
          expandedStocks = [...expandedStocks, ...extraStocks.slice(0, neededCount)];
        }
        
        // 한국어 이름 및 섹터 추가
        const stocksWithKoreanNames = expandedStocks.map(stock => ({
          ...stock,
          koreanName: koreanStockNames[stock.symbol] || stock.name,
          koreanSector: koreanSectorNames[stock.sector] || stock.sector,
          koreanIndustry: koreanSectorNames[stock.industry] || stock.industry
        }));
        
        setPopularStocks(stocksWithKoreanNames);
      } catch (error) {
        console.error('인기 주식을 불러오는데 실패했습니다:', error);
        
        // API 오류 시 폴백 데이터
        const fallbackStocks = [
          {symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology'},
          {symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology'},
          {symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology'},
          {symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical'},
          {symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Consumer Cyclical'},
          {symbol: 'META', name: 'Meta Platforms, Inc.', sector: 'Communication Services'},
          {symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology'},
          {symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services'},
          {symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services'},
          {symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive'},
          {symbol: 'NFLX', name: 'Netflix, Inc.', sector: 'Communication Services'},
          {symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology'},
          {symbol: 'CRM', name: 'Salesforce, Inc.', sector: 'Technology'},
          {symbol: 'CSCO', name: 'Cisco Systems, Inc.', sector: 'Technology'},
          {symbol: 'PEP', name: 'PepsiCo, Inc.', sector: 'Consumer Defensive'},
          {symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology'},
          {symbol: 'AMD', name: 'Advanced Micro Devices, Inc.', sector: 'Technology'},
          {symbol: 'PYPL', name: 'PayPal Holdings, Inc.', sector: 'Financial Services'},
          {symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Communication Services'},
          {symbol: 'COST', name: 'Costco Wholesale Corporation', sector: 'Consumer Defensive'}
        ].map(stock => ({
          ...stock,
          koreanName: koreanStockNames[stock.symbol] || stock.name,
          koreanSector: koreanSectorNames[stock.sector] || stock.sector,
          koreanIndustry: koreanSectorNames[stock.industry] || stock.industry
        }));
        
        setPopularStocks(fallbackStocks);
      }
    };

    fetchPopularStocks();
  }, []);

  // 사이드바 토글
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className={`app-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Navbar 
          toggleSidebar={toggleSidebar}
        />
        
        <div className="content-container">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard popularStocks={popularStocks} koreanStockNames={koreanStockNames} koreanSectorNames={koreanSectorNames} />} />
              <Route path="/stock/:ticker" element={<StockDetail koreanStockNames={koreanStockNames} koreanSectorNames={koreanSectorNames} />} />
              <Route path="/search" element={<Search setSelectedStock={setSelectedStock} koreanStockNames={koreanStockNames} koreanSectorNames={koreanSectorNames} />} />
              <Route path="/watchlist" element={<Watchlist setSelectedStock={setSelectedStock} koreanStockNames={koreanStockNames} koreanSectorNames={koreanSectorNames} />} />
            </Routes>
          </main>
          
          {sidebarOpen && (
            <Sidebar 
              popularStocks={popularStocks} 
              setSelectedStock={setSelectedStock} 
              closeSidebar={() => setSidebarOpen(false)}
              koreanStockNames={koreanStockNames}
              koreanSectorNames={koreanSectorNames}
              sidebarOpen={sidebarOpen}
            />
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
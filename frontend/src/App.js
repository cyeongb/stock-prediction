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
import Footer from './components/Footer';

// 스타일
import './App.css';

// API 기본 설정
const API_BASE_URL = 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;

function App() {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [popularStocks, setPopularStocks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // 기본 다크모드
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
        
        setPopularStocks(expandedStocks);
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
        ];
        
        setPopularStocks(fallbackStocks);
      }
    };

    fetchPopularStocks();
  }, []);

  // 반응형 처리
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 다크모드 토글
  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  // 사이드바 토글
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar 
          toggleSidebar={toggleSidebar} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          hideSearch={true} // 검색 숨김 설정 추가
        />
        
        <div className="content-wrapper">
          {sidebarOpen && (
            <Sidebar 
              popularStocks={popularStocks} 
              setSelectedStock={setSelectedStock} 
              isMobile={isMobile}
              closeSidebar={() => setSidebarOpen(false)}
              sidebarOpen={sidebarOpen}
            />
          )}
          
          <main className={`main-content ${sidebarOpen && isMobile ? 'blur' : ''}`}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard popularStocks={popularStocks} />} />
              <Route path="/stock/:ticker" element={<StockDetail />} />
              <Route path="/search" element={<Search setSelectedStock={setSelectedStock} />} />
              <Route path="/watchlist" element={<Watchlist setSelectedStock={setSelectedStock} />} />
            </Routes>
          </main>
        </div>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
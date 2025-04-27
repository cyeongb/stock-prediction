import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Search = ({ setSelectedStock }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL에서 검색어 추출
  const query = new URLSearchParams(location.search).get('q') || '';
  
  // 검색어가 변경될 때 검색 실행
  useEffect(() => {
    if (query) {
      searchStocks(query);
    } else {
      setSearchResults([]);
    }
  }, [query]);
  
  // 검색 API 호출
  const searchStocks = async (searchQuery) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/stocks/search`, {
        params: { q: searchQuery }
      });
      
      setSearchResults(response.data);
    } catch (error) {
      console.error('주식 검색 중 오류 발생:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 검색 결과 클릭 처리
  const handleResultClick = (symbol) => {
    setSelectedStock(symbol);
    navigate(`/stock/${symbol}`);
  };
  
  // 직접 검색 양식 제출 처리
  const [directQuery, setDirectQuery] = useState(query);
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (directQuery.trim()) {
      navigate(`/search?q=${directQuery}`);
    }
  };
  
  return (
    <div className="search-page">
      <h1 className="page-title">주식 검색</h1>
      
      <div className="search-form-container">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={directQuery}
            onChange={(e) => setDirectQuery(e.target.value)}
            placeholder="심볼 또는 회사명으로 검색 (예: AAPL, Apple)"
            className="search-input"
          />
          <button type="submit" className="search-button">검색</button>
        </form>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>검색 중...</p>
        </div>
      ) : (
        <div className="search-results">
          {query && searchResults.length === 0 ? (
            <div className="no-results">
              <p>"{query}"에 대한 검색 결과가 없습니다.</p>
              <p>정확한 주식 심볼이나 회사명을 입력해주세요.</p>
              
              {/* 인기 종목 제안 */}
              <div className="popular-suggestions">
                <h3>인기 종목 확인하기</h3>
                <div className="suggestion-buttons">
                  <button onClick={() => navigate('/dashboard')}>대시보드로 이동</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {query && searchResults.length > 0 && (
                <h2 className="results-heading">"{query}" 검색 결과</h2>
              )}
              
              <div className="results-grid">
                {searchResults.map((stock) => (
                  <div 
                    key={stock.symbol} 
                    className="result-card"
                    onClick={() => handleResultClick(stock.symbol)}
                  >
                    <div className="symbol">{stock.symbol}</div>
                    <div className="name">{stock.name}</div>
                    {stock.sector && <div className="sector">{stock.sector}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
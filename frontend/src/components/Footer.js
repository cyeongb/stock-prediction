import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">StockFlix</h3>
          <p className="footer-description">
            딥러닝 기반 주식 예측 및 시각화 플랫폼
          </p>
        </div>
        
        <div className="footer-section">
          <h3 className="footer-title">주의사항</h3>
          <p className="footer-disclaimer">
            본 서비스는 투자 자문이 아닙니다. 예측 결과는 참고용일 뿐이며, 
            모든 투자 결정에 대한 책임은 본인에게 있습니다.
          </p>
        </div>
        
        <div className="footer-section">
          <h3 className="footer-title">기술 스택</h3>
          <ul className="footer-list">
            <li>PyTorch</li>
            <li>Flask</li>
            <li>React</li>
            <li>Plotly</li>
            <li>yfinance</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 StockFlix. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
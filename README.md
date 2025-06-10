
# 📈 Stock Market Prediction & Data Visualization Dashboard 📉
- Notion : https://www.notion.so/cyeongb/5-_-1e3aa4605a0b80a08ed7f9e38e367c0b?pvs=4

- "The StockFlix" is an Application Stock Market Prediction & Data Visualization Dashboard with using machine learning model. 
- Netflix theme UI + User friendly(UX)
- Responsible UI for Mobile user.


 # 🎯Key Featurs

- **Real-time Stock Price Data Visualization**: Daily/Weekly/Monthly/Yearly stock price charts
- **Linear Regression Machine Learning Model**: Predicting US stock prices using linear regression
- **Diverse Chart Types**: Line charts, Candlestick charts
- **Watchlist Management**: Save and manage your favorite stocks
- **Responsive Design**: Optimized UI for both mobile and desktop devices


# 🖼️ BACK-END
- **Python**: Language for main server메인 서버 개발 언어
- **scikit-learn**: machine learning library - linear_model (선형회귀)
- **yfinance**: Yahoo Finance data crawling
- **pandas**: Data Handling and Analysis
- **Flask**: REST API server
- **Flask-CORS**: Process Cross-Origin request

# 🎨 FRONT-END
- **React.js**: SPA
- **React Router**: client side routing
- **Plotly.js**: Data Visualization
- **Axios**: Process HTTP request
- **CSS3**: UI Netflix style


# ❤️ Domain
1. Check Market Indices on the Dashboard.
2. Check the Top 10 Popular Stocks on the Dashboard.
3. Check Predicted Stock Prices for the Top 10 Popular Stocks from the Dashboard.
4. 종목 상세 페이지에서 주가 차트 및 예측 결과 확인.
5. 관심 종목 목록에 추가하여 조회 가능.

<img width="934" alt="image" src="https://github.com/user-attachments/assets/6e0982c7-0288-45f3-ae74-97a98bd35998" />

----
<img width="934" alt="image" src="https://github.com/user-attachments/assets/a9c23ae0-0b19-442f-832a-eadadce59aba" />

----
<img width="935" alt="image" src="https://github.com/user-attachments/assets/9e3932a7-735e-4dc6-b478-42a665db3c3d" />

----
# ⭐ 프로젝트 구조

```
stock-prediction-app/
├── backend/
│   ├── model.py          # 선형회귀 모델 기반 주가 예측 모델
│   ├── app.py            # Flask API 서버
│   ├── requirements.txt  # 백엔드 의존성
│   └── cache/            # 데이터 캐싱 디렉토리
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # 재사용 가능한 UI 컴포넌트
|   |           ├──  Navbar.js  # 네비게이션 바
|   |           ├──  PredictionChart.js  # 주식 예측 차트
|   |           ├──  Sidebar.js  #사이드바
|   |           └──  StockCard.js  # 주식카드
|   |            
│   │   ├── pages/        # 페이지 컴포넌트
|   |         ├──  Dashboard.js  # 메인화면
|   |         ├──  StockDetail.js  # 주식 디테일
|   |         └──  Watchlist.js  #  관심종목
│   │   ├── App.js        # 메인 앱 컴포넌트
│   │   ├── App.css       # 넷플릭스 스타일 CSS
│   │   └── index.js      # 앱 진입점
│   ├── package.json      # 프론트엔드 의존성
└── README.md             # 프로젝트 설명

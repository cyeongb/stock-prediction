# StockFlix - 딥러닝 기반 주가 예측 & 시각화 대시보드

- StockFlix는 딥러닝 모델을 활용한 주가 예측 및 시각화 대시보드 애플리케이션. 
- 넷플릭스 스타일 + 사용자친화적
- UI 모바일에서도 쉽게 이용 가능한 반응형 SPA.


## 주요 기능

- **실시간 주가 데이터 시각화**: 일별/주별/월별/연별 주가 차트
- **선형회귀 머신러닝 모델**: 선형회귀를 사용한 미 주가 예측
- **다양한 차트 유형**: 선형 차트, 캔들스틱 차트
- **관심종목 관리**: 즐겨찾는 주식 저장 및 관리
- **반응형 디자인**: 모바일 및 데스크톱에서 모두 최적화된 UI

## 기술 스택

### 백엔드
- **Python**: 메인 서버 개발 언어
- **PyTorch**: 딥러닝 모델 구현
- **yfinance**: Yahoo Finance 데이터 크롤링
- **pandas**: 데이터 처리 및 분석
- **Flask**: REST API 서버
- **Flask-CORS**: 크로스 오리진 요청 처리

### 프론트엔드
- **React.js**: SPA 구현
- **React Router**: 클라이언트 사이드 라우팅
- **Plotly.js**: 데이터 시각화
- **axios**: HTTP 요청 처리
- **CSS3**: 넷플릭스 스타일 UI 


## 기능
1. 대시보드에서 시장지수 조회.
2. 대시보드에서 인기 주식 top 10 조회.
3. 대시보드에서 top 10 인기주식의 예측 주가 확인. 
4. 종목 상세 페이지에서 주가 차트 및 예측 결과 확인.
5. 관심 종목 목록에 추가하여 조회 가능.

<img width="934" alt="image" src="https://github.com/user-attachments/assets/6e0982c7-0288-45f3-ae74-97a98bd35998" />

----
<img width="934" alt="image" src="https://github.com/user-attachments/assets/a9c23ae0-0b19-442f-832a-eadadce59aba" />

----
<img width="935" alt="image" src="https://github.com/user-attachments/assets/9e3932a7-735e-4dc6-b478-42a665db3c3d" />

----
## 프로젝트 구조

```
stock-prediction-app/
├── backend/
│   ├── model.py          # PyTorch 기반 주가 예측 모델
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
│   └── README.md
└── README.md             # 프로젝트 설명

-----



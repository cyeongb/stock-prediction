# model.py
import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
import os
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LinearRegression
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 모델 디렉토리 생성
# MODELS_DIR: 학습된 모델을 저장할 디렉토리 경로
MODELS_DIR = 'models'
os.makedirs(MODELS_DIR, exist_ok=True)

# 주가 예측 함수
#ticker : 주식 ticker symbol ('AAPL')
# start_date : 데이터 시작 날짜, 기본값은 6개월 전
# end_date : 데이터 종료 날짜, 기본값은 현재
# prediction_days : 예측할 미래 일수, 기본값은 30일
def get_stock_prediction(ticker, start_date=None, end_date=None, prediction_days=30):
    """
    주가 예측 결과를 생성하는 함수.
    """
    logger.info(f"주가 예측 시작: {ticker}, 예측 기간: {prediction_days}일")
    
    try:
        # 날짜 설정
        if end_date is None:
            end_date = datetime.now()
        if start_date is None:
            # 6개월 데이터만 사용
            start_date = end_date - timedelta(days=180)
        
        # 주가 데이터 다운로드
        logger.info(f"{ticker} 주가 데이터 다운로드 시작: {start_date} ~ {end_date}")
        stock_data = yf.download(ticker, start=start_date, end=end_date)
        
        if stock_data.empty:
            logger.error(f"{ticker} 데이터를 찾을 수 없습니다.")
            return {
                'error': '데이터 없음',
                'message': f'{ticker} 주식 데이터를 찾을 수 없습니다.'
            }
        
        # 종가 데이터
        close_prices = stock_data['Close'].values
        
        #30일 미만 데이터는 예측 x
        if len(close_prices) < 30:
            logger.error(f"{ticker} 충분한 데이터가 없습니다. 데이터 길이: {len(close_prices)}")
            return {
                'error': '데이터 부족',
                'message': f'{ticker} 주식의 충분한 과거 데이터가 없습니다.'
            }
        
        # 선형 회귀 모델
        return predict_with_linear_regression(ticker, stock_data, prediction_days)
        
    except Exception as e:
        logger.error(f"{ticker} 예측 중 오류 발생: {str(e)}")
        return {
            'error': '예측 생성 오류',
            'message': f'요청에 실패했습니다. 오류: {str(e)}'
        }
        
#ticker (str): 주식 티커 심볼
#stock_data (pd.DataFrame): yfinance로 가져온 주가 데이터
#prediction_days (int): 예측할 미래 일수
def predict_with_linear_regression(ticker, stock_data, prediction_days=30):
    """
    선형 회귀를 사용한 주가 예측 함수
    """
    # 원본 수정 방지를 위해 복사본 사용
    df = stock_data.copy()
    df['Date'] = df.index
    
    # 특성 생성
    # - MA5: 5일 이동평균
    # - MA20: 20일 이동평균
    # - Return: 일일 수익률 (종가의 퍼센트 변화)
    # - Volatility: 20일 수익률의 표준편차 (변동성)
    df['MA5'] = df['Close'].rolling(window=5).mean()
    df['MA20'] = df['Close'].rolling(window=20).mean()
    df['Return'] = df['Close'].pct_change()
    df['Volatility'] = df['Return'].rolling(window=20).std()
    
    # NaN 값 제거
    df.dropna(inplace=True)
    
    # 학습용 데이터 (가장 최근 30일)
    test_data = df.iloc[-30:].copy()
    
    # 학습 데이터 (테스트 데이터 이전 데이터)
    train_data = df.iloc[:-30].copy()
    
    # 날짜를 숫자 특성으로 변환
    from sklearn.preprocessing import MinMaxScaler
    
    # 일별 인덱스 생성
    train_data['Day'] = range(len(train_data))
    test_data['Day'] = range(len(train_data), len(train_data) + len(test_data))
    
    # 특성 및 타겟 정의
    features = ['Day', 'MA5', 'MA20', 'Volatility']
    X_train = train_data[features]
    y_train = train_data['Close']
    
    X_test = test_data[features]
    y_test = test_data['Close']
    
    # 선형 회귀 모델 학습
    model = LinearRegression()
    # fit() 모델을 데이터에 맞춰 학습시키는 함수
    model.fit(X_train, y_train)
    
    # 테스트 데이터 예측
    y_pred = model.predict(X_test)
    
    # 미래 데이터 특성 생성
    last_day = test_data['Day'].iloc[-1]
    
    # 기초 특성값
    last_ma5 = test_data['MA5'].iloc[-1]
    last_ma20 = test_data['MA20'].iloc[-1]
    last_volatility = test_data['Volatility'].iloc[-1]
    
    # 미래 예측을 위한 특성 생성
    future_features = []
    
    for i in range(prediction_days):
        day = last_day + i + 1
        
        #  선형 증가/감소 트렌드 적용
        ma5_change = (last_ma5 - test_data['MA5'].iloc[-5]) / 5
        ma20_change = (last_ma20 - test_data['MA20'].iloc[-20]) / 20
        
        ma5 = last_ma5 + ma5_change * (i + 1)
        ma20 = last_ma20 + ma20_change * (i + 1)
        
        # 약간의 랜덤 변동성 추가
        volatility = last_volatility * (0.9 + 0.2 * np.random.random())
        
        future_features.append([day, ma5, ma20, volatility])
    
    # 미래 데이터 프레임
    future_df = pd.DataFrame(future_features, columns=features)
    
    # 미래 가격 예측
    future_prices = model.predict(future_df)
    
    # 결과 데이터 가공
    last_date = stock_data.index[-1]
    
    # 과거 날짜 및 실제 가격
    actual_dates = stock_data.index[-30:]
    actual_prices = stock_data['Close'].iloc[-30:].values
    
    # 미래 날짜 생성
    future_dates = [(last_date + timedelta(days=i+1)) for i in range(prediction_days)]
    
    # 주간, 월간, 연간 데이터 생성
    daily_data = stock_data['Close']
    weekly_data = stock_data['Close'].resample('W').last()
    monthly_data = stock_data['Close'].resample('M').last()
    yearly_data = stock_data['Close'].resample('Y').last()
    
    # 결과 포맷팅
    results = {
        'ticker': ticker,
        'last_price': float(stock_data['Close'].iloc[-1]),
        'prediction': {
            'dates': [d.strftime('%Y-%m-%d') for d in future_dates],
            'values': [float(price) for price in future_prices]
        },
        'actual': {
            'dates': [d.strftime('%Y-%m-%d') for d in actual_dates],
            'test_actual': [float(price) for price in actual_prices],
            'test_pred': [float(price) for price in y_pred]
        },
        'historical': {
            'daily': {
                'dates': [d.strftime('%Y-%m-%d') for d in daily_data.index],
                'values': [float(price) for price in daily_data.values]
            },
            'weekly': {
                'dates': [d.strftime('%Y-%m-%d') for d in weekly_data.index],
                'values': [float(price) for price in weekly_data.values]
            },
            'monthly': {
                'dates': [d.strftime('%Y-%m-%d') for d in monthly_data.index],
                'values': [float(price) for price in monthly_data.values]
            },
            'yearly': {
                'dates': [d.strftime('%Y-%m-%d') for d in yearly_data.index],
                'values': [float(price) for price in yearly_data.values]
            }
        }
    }
    
    return results

if __name__ == "__main__":
    # 예시: AAPL 주식 예측
    results = get_stock_prediction('AAPL')
    print(f"현재 가격: ${results['last_price']:.2f}")
    print(f"30일 후 예측 가격: ${results['prediction']['values'][-1]:.2f}")
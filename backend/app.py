# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
import os
import json
import logging

# 모델 임포트
from model import get_stock_prediction

app = Flask(__name__)
CORS(app)  # 크로스 오리진 요청 허용

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 캐시 디렉토리
CACHE_DIR = 'cache'
os.makedirs(CACHE_DIR, exist_ok=True)

# 캐시 파일 경로 생성
def get_cache_path(ticker, timeframe='daily'):
    return os.path.join(CACHE_DIR, f"{ticker}_{timeframe}.json")

# 캐시 데이터 로드
def load_cache(ticker, timeframe='daily'):
    cache_path = get_cache_path(ticker, timeframe)
    if os.path.exists(cache_path):
        try:
            with open(cache_path, 'r') as f:
                data = json.load(f)
                # 캐시가 24시간 이내인지 확인
                cache_time = datetime.strptime(data.get('timestamp', '2000-01-01'), '%Y-%m-%d %H:%M:%S')
                if datetime.now() - cache_time < timedelta(hours=24):
                    logger.info(f"캐시 데이터 사용: {ticker}, {timeframe}")
                    return data
        except (json.JSONDecodeError, KeyError) as e:
            logger.error(f"캐시 파일 로드 오류: {cache_path}, {str(e)}")
            # 손상된 캐시 파일 삭제
            os.remove(cache_path)
    return None

# 캐시 데이터 저장
def save_cache(ticker, data, timeframe='daily'):
    cache_path = get_cache_path(ticker, timeframe)
    data['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    with open(cache_path, 'w') as f:
        json.dump(data, f)
    logger.info(f"캐시 데이터 저장: {ticker}, {timeframe}")

# 프론트엔드와 API 경로 일치를 위한 라우트 추가 (추가)
@app.route('/stocks/info/<ticker>', methods=['GET'])
def frontend_stock_info(ticker):
    return get_stock_info(ticker)

@app.route('/api/stocks/info/<ticker>', methods=['GET'])
def get_stock_info(ticker):
    try:
        # 캐시 확인
        cache_key = f"{ticker}_info"
        cached_data = load_cache(ticker, cache_key)
        if cached_data:
            return jsonify(cached_data)
        
        logger.info(f"주식 정보 요청: {ticker}")
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # 필요한 정보만 추출
        basic_info = {
            'symbol': ticker,
            'name': info.get('shortName', ''),
            'sector': info.get('sector', ''),
            'industry': info.get('industry', ''),
            'logo': info.get('logo_url', ''),
            'website': info.get('website', ''),
            'description': info.get('longBusinessSummary', ''),
            'market_cap': info.get('marketCap', 0),
            'pe_ratio': info.get('trailingPE', 0),
            'dividend_yield': info.get('dividendYield', 0),
            'fifty_two_week_high': info.get('fiftyTwoWeekHigh', 0),
            'fifty_two_week_low': info.get('fiftyTwoWeekLow', 0)
        }
        
        # 캐시 저장
        save_cache(ticker, basic_info, cache_key)
        
        return jsonify(basic_info)
    except Exception as e:
        logger.error(f"주식 정보 요청 오류: {ticker}, {str(e)}")
        return jsonify({'error': str(e)}), 400

# 프론트엔드와 API 경로 일치를 위한 라우트 추가 (추가)
@app.route('/stocks/history/<ticker>', methods=['GET'])
def frontend_stock_history(ticker):
    return get_stock_history(ticker)

@app.route('/api/stocks/history/<ticker>', methods=['GET'])
def get_stock_history(ticker):
    timeframe = request.args.get('timeframe', 'daily')  # daily, weekly, monthly, yearly
    period = request.args.get('period', '5y')  # 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    
    # 캐시 확인
    cache_key = f"{ticker}_{timeframe}_{period}"
    cached_data = load_cache(ticker, cache_key)
    if cached_data:
        return jsonify(cached_data)
    
    try:
        logger.info(f"주가 이력 요청: {ticker}, {timeframe}, {period}")
        # yfinance에서 데이터 가져오기
        stock = yf.Ticker(ticker)
        
        # 데이터 다운로드
        hist = stock.history(period=period)
        
        if hist.empty:
            logger.warning(f"주가 이력 없음: {ticker}")
            return jsonify({'error': '데이터 없음'}), 404
        
        # 타임프레임에 따라 리샘플링
        if timeframe == 'weekly':
            hist = hist.resample('W').last()
        elif timeframe == 'monthly':
            hist = hist.resample('M').last()
        elif timeframe == 'yearly':
            hist = hist.resample('Y').last()
        
        # 결과 포맷팅
        result = {
            'dates': [d.strftime('%Y-%m-%d') for d in hist.index],
            'open': hist['Open'].tolist(),
            'high': hist['High'].tolist(),
            'low': hist['Low'].tolist(),
            'close': hist['Close'].tolist(),
            'volume': hist['Volume'].tolist()
        }
        
        # 캐시 저장
        save_cache(ticker, result, cache_key)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"주가 이력 요청 오류: {ticker}, {str(e)}")
        return jsonify({'error': str(e)}), 400

# 프론트엔드와 API 경로 일치를 위한 라우트 추가 (추가)
@app.route('/stocks/predict/<ticker>', methods=['GET'])
def frontend_predict_stock(ticker):
    return predict_stock(ticker)

@app.route('/api/stocks/predict/<ticker>', methods=['GET'])
def predict_stock(ticker):
    days = int(request.args.get('days', 30))
    
    # 캐시 확인
    cache_key = f"{ticker}_prediction_{days}"
    cached_data = load_cache(ticker, cache_key)
    if cached_data:
        logger.info(f"예측 캐시 사용: {ticker}, {days}일")
        return jsonify(cached_data)
    
    try:
        logger.info(f"주가 예측 요청: {ticker}, {days}일")
        # 예측 모델 실행
        results = get_stock_prediction(ticker, prediction_days=days)
        
        # 오류 처리
        if 'error' in results:
            logger.error(f"예측 오류: {ticker}, {results['error']}")
            return jsonify(results), 500
        
        # 캐시 저장
        save_cache(ticker, results, cache_key)
        
        return jsonify(results)
    except Exception as e:
        # 자세한 오류 로깅
        logger.error(f"주가 예측 처리 예외: {ticker}, {str(e)}")
        
        # 클라이언트에게 상세 오류 메시지 대신 간단한 오류 응답
        return jsonify({
            'error': '예측 생성 오류',
            'message': '요청에 실패했습니다. 나중에 다시 시도해주세요.'
        }), 500

# 프론트엔드와 API 경로 일치를 위한 라우트 추가 (추가)
@app.route('/stocks/popular', methods=['GET'])
def frontend_popular_stocks():
    return get_popular_stocks()

@app.route('/api/stocks/popular', methods=['GET'])
def get_popular_stocks():
    # 인기 주식 목록 (하드코딩)
    popular_stocks = [
        {'symbol': 'AAPL', 'name': 'Apple Inc.', 'sector': 'Technology'},
        {'symbol': 'MSFT', 'name': 'Microsoft Corporation', 'sector': 'Technology'},
        {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'sector': 'Technology'},
        {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'sector': 'Consumer Cyclical'},
        {'symbol': 'TSLA', 'name': 'Tesla, Inc.', 'sector': 'Consumer Cyclical'},
        {'symbol': 'META', 'name': 'Meta Platforms, Inc.', 'sector': 'Communication Services'},
        {'symbol': 'NVDA', 'name': 'NVIDIA Corporation', 'sector': 'Technology'},
        {'symbol': 'JPM', 'name': 'JPMorgan Chase & Co.', 'sector': 'Financial Services'},
        {'symbol': 'V', 'name': 'Visa Inc.', 'sector': 'Financial Services'},
        {'symbol': 'WMT', 'name': 'Walmart Inc.', 'sector': 'Consumer Defensive'}
    ]
    return jsonify(popular_stocks)

# 프론트엔드와 API 경로 일치를 위한 라우트 추가 (추가)
@app.route('/stocks/search', methods=['GET'])
def frontend_search_stocks():
    return search_stocks()

@app.route('/api/stocks/search', methods=['GET'])
def search_stocks():
    query = request.args.get('q', '').upper()
    if not query:
        return jsonify([])
    
    try:
        logger.info(f"주식 검색 요청: {query}")
        # yfinance에서 검색 (간단한 구현)
        tickers = yf.Tickers(query)
        results = []
        
        # 실제 구현에서는 더 많은 검색 로직 필요
        for ticker in tickers.tickers:
            try:
                info = ticker.info
                results.append({
                    'symbol': ticker.ticker,
                    'name': info.get('shortName', ''),
                    'sector': info.get('sector', '')
                })
            except Exception as e:
                logger.warning(f"검색 결과 처리 오류: {ticker.ticker}, {str(e)}")
                continue
        
        return jsonify(results)
    except Exception as e:
        logger.error(f"검색 요청 처리 오류: {query}, {str(e)}")
        return jsonify([])

# 서버 상태 확인 엔드포인트
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'version': '1.0.0'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
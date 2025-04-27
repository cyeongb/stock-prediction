import numpy as np
import pandas as pd
import yfinance as yf
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import plotly.graph_objects as go
from datetime import datetime, timedelta
import os

# LSTM 모델 정의
class StockLSTM(nn.Module):
    def __init__(self, input_dim=1, hidden_dim=64, num_layers=2, output_dim=1, dropout=0.2):
        super(StockLSTM, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, 
                           batch_first=True, dropout=dropout)
        self.fc = nn.Linear(hidden_dim, output_dim)
        
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

# 주식 데이터셋 클래스 정의
class StockDataset(Dataset):
    def __init__(self, X, y):
        self.X = X
        self.y = y
        
    def __len__(self):
        return len(self.X)
    
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

# 데이터 전처리 함수
def prepare_data(stock_data, seq_length=60):
    # 주가 데이터만 사용
    data = stock_data['Close'].values.reshape(-1, 1)
    
    # 데이터 정규화
    scaler = MinMaxScaler(feature_range=(0, 1))
    data_scaled = scaler.fit_transform(data)
    
    # 시퀀스 데이터 생성
    X, y = [], []
    for i in range(len(data_scaled) - seq_length):
        X.append(data_scaled[i:i + seq_length])
        y.append(data_scaled[i + seq_length])
    
    X, y = np.array(X), np.array(y)
    
    # 학습/테스트 분할
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    
    # PyTorch 텐서로 변환
    X_train = torch.FloatTensor(X_train)
    X_test = torch.FloatTensor(X_test)
    y_train = torch.FloatTensor(y_train)
    y_test = torch.FloatTensor(y_test)
    
    return X_train, X_test, y_train, y_test, scaler

# 모델 학습 함수
def train_model(model, X_train, y_train, epochs=100, batch_size=32, learning_rate=0.001):
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    train_dataset = StockDataset(X_train, y_train)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    
    model.train()
    for epoch in range(epochs):
        total_loss = 0
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            y_pred = model(X_batch)
            loss = criterion(y_pred, y_batch)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        
        if (epoch + 1) % 10 == 0:
            print(f'Epoch [{epoch+1}/{epochs}], Loss: {total_loss/len(train_loader):.4f}')
    
    return model

# 예측 함수
def predict(model, X_test, scaler):
    model.eval()
    with torch.no_grad():
        predictions = model(X_test)
    
    # 정규화 해제
    predictions = scaler.inverse_transform(predictions.numpy())
    return predictions

# 주가 예측 결과 생성 함수
def get_stock_prediction(ticker, start_date=None, end_date=None, prediction_days=30):
    # 날짜 설정
    if end_date is None:
        end_date = datetime.now()
    if start_date is None:
        start_date = end_date - timedelta(days=365*5)  # 5년치 데이터
    
    # 주가 데이터 다운로드
    stock_data = yf.download(ticker, start=start_date, end=end_date)
    
    # 학습 데이터 준비
    seq_length = 60  # 60일 시퀀스로 예측
    X_train, X_test, y_train, y_test, scaler = prepare_data(stock_data, seq_length)
    
    # 모델 초기화 및 학습
    model = StockLSTM(input_dim=1, hidden_dim=64, num_layers=2, output_dim=1)
    model = train_model(model, X_train, y_train, epochs=100)
    
    # 테스트 데이터 예측
    y_pred = predict(model, X_test, scaler)
    y_test_actual = scaler.inverse_transform(y_test.numpy())
    
    # 미래 예측 데이터 생성
    last_sequence = X_test[-1].numpy()
    future_predictions = []
    
    current_sequence = last_sequence.copy()
    for _ in range(prediction_days):
        # 현재 시퀀스로 다음 날 예측
        with torch.no_grad():
            next_pred = model(torch.FloatTensor(current_sequence).unsqueeze(0))
        
        # 예측 결과 저장
        future_predictions.append(next_pred.item())
        
        # 시퀀스 업데이트 (오래된 값 제거하고 새 예측 추가)
        current_sequence = np.roll(current_sequence, -1, axis=0)
        current_sequence[-1] = next_pred.item()
    
    # 정규화 해제
    future_predictions = scaler.inverse_transform(np.array(future_predictions).reshape(-1, 1))
    
    # 결과 데이터 생성
    actual_dates = stock_data.index[-len(y_test_actual):]
    future_dates = [stock_data.index[-1] + timedelta(days=i+1) for i in range(prediction_days)]
    
    # 주간, 월간, 연간 데이터 생성
    daily_data = stock_data['Close']
    weekly_data = stock_data['Close'].resample('W').last()
    monthly_data = stock_data['Close'].resample('M').last()
    yearly_data = stock_data['Close'].resample('Y').last()
    
    results = {
        'ticker': ticker,
        'last_price': stock_data['Close'].iloc[-1],
        'prediction': {
            'dates': [d.strftime('%Y-%m-%d') for d in future_dates],
            'values': future_predictions.flatten().tolist()
        },
        'actual': {
            'dates': [d.strftime('%Y-%m-%d') for d in actual_dates],
            'test_actual': y_test_actual.flatten().tolist(),
            'test_pred': y_pred.flatten().tolist()
        },
        'historical': {
            'daily': {
                'dates': [d.strftime('%Y-%m-%d') for d in daily_data.index],
                'values': daily_data.values.tolist()
            },
            'weekly': {
                'dates': [d.strftime('%Y-%m-%d') for d in weekly_data.index],
                'values': weekly_data.values.tolist()
            },
            'monthly': {
                'dates': [d.strftime('%Y-%m-%d') for d in monthly_data.index],
                'values': monthly_data.values.tolist()
            },
            'yearly': {
                'dates': [d.strftime('%Y-%m-%d') for d in yearly_data.index],
                'values': yearly_data.values.tolist()
            }
        }
    }
    
    return results

# 모델 저장/로드 함수
def save_model(model, filepath):
    torch.save(model.state_dict(), filepath)
    
def load_model(filepath):
    model = StockLSTM()
    model.load_state_dict(torch.load(filepath))
    model.eval()
    return model

if __name__ == "__main__":
    # 예시: AAPL 주식 예측
    results = get_stock_prediction('AAPL')
    print(f"현재 가격: ${results['last_price']:.2f}")
    print(f"30일 후 예측 가격: ${results['prediction']['values'][-1]:.2f}")
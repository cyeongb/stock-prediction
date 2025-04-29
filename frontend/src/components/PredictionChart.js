//PredictionChart.js
import React from 'react';
import Plot from 'react-plotly.js';

const PredictionChart = ({ predictionData, koreanName }) => {
  if (!predictionData) return null;

  // 테스트 데이터와 예측 데이터를 구성
  const testDates = predictionData.actual.dates;
  const testActualValues = predictionData.actual.test_actual;
  const testPredValues = predictionData.actual.test_pred;
  
  const futureDates = predictionData.prediction.dates;
  const futurePredValues = predictionData.prediction.values;
  
  // 실제 최종 가격과 첫 예측 가격 사이의 차이를 계산하여 색상 결정
  const lastActualPrice = testActualValues[testActualValues.length - 1];
  const lastPredictedPrice = futurePredValues[futurePredValues.length - 1];
  const priceChange = lastPredictedPrice - lastActualPrice;
  const predictionColor = priceChange >= 0 ? '#46d369' : '#e50914';

  // 주식 심볼과 한국어 이름 결합
  const stockTitle = predictionData.ticker + (koreanName ? ` (${koreanName})` : '');

  return (
    <div className="prediction-chart">
      <Plot
        data={[
          // 테스트 셋의 실제 가격
          {
            x: testDates,
            y: testActualValues,
            type: 'scatter',
            mode: 'lines',
            name: '실제 가격 (테스트)',
            line: {
              color: '#3366cc',
              width: 2
            }
          },
          // 테스트 셋의 예측 가격
          {
            x: testDates,
            y: testPredValues,
            type: 'scatter',
            mode: 'lines',
            name: '예측 가격 (테스트)',
            line: {
              color: '#cccccc',
              width: 2,
              dash: 'dot'
            }
          },
          // 미래 예측 가격
          {
            x: futureDates,
            y: futurePredValues,
            type: 'scatter',
            mode: 'lines',
            name: '예측 가격 (미래)',
            line: {
              color: predictionColor,
              width: 3
            }
          }
        ]}
        layout={{
          title: `${stockTitle} 딥러닝 모델 주가 예측 결과`,
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
          },
          shapes: [
            // 현재와 미래를 구분하는 세로선
            {
              type: 'line',
              x0: testDates[testDates.length - 1],
              y0: 0,
              x1: testDates[testDates.length - 1],
              y1: 1,
              yref: 'paper',
              line: {
                color: 'rgba(255, 255, 255, 0.5)',
                width: 2,
                dash: 'dash'
              }
            }
          ],
          annotations: [
            // 현재 시점 레이블
            {
              x: testDates[testDates.length - 1],
              y: 1.05,
              xref: 'x',
              yref: 'paper',
              text: '현재',
              showarrow: true,
              arrowhead: 2,
              arrowsize: 1,
              arrowwidth: 1,
              arrowcolor: 'rgba(255, 255, 255, 0.5)',
              ax: 0,
              ay: -40
            },
            // 예측 결과 레이블
            {
              x: futureDates[futureDates.length - 1],
              y: futurePredValues[futurePredValues.length - 1],
              xref: 'x',
              yref: 'y',
              text: `30일 후 예측: $${futurePredValues[futurePredValues.length - 1].toFixed(2)} (${priceChange >= 0 ? '+' : ''}${((priceChange / lastActualPrice) * 100).toFixed(2)}%)`,
              showarrow: true,
              arrowhead: 2,
              arrowsize: 1,
              arrowwidth: 1,
              arrowcolor: predictionColor,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              bordercolor: predictionColor,
              borderwidth: 2,
              borderpad: 4,
              font: { size: 12, color: '#e5e5e5' },
              ax: -40,
              ay: -40
            }
          ]
        }}
        config={{ responsive: true }}
        style={{ width: '100%' }}
      />
      
      <div className="prediction-stats">
        <div className="stat-item">
          <span className="label">현재 가격:</span>
          <span className="value">${lastActualPrice.toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="label">30일 후 예측:</span>
          <span className={`value ${priceChange >= 0 ? 'positive' : 'negative'}`}>
            ${lastPredictedPrice.toFixed(2)} 
            ({priceChange >= 0 ? '+' : ''}{((priceChange / lastActualPrice) * 100).toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;
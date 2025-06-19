import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { safeT } from '../../utils/i18nUtils';
import Chart from 'chart.js/auto';

/**
 * PieChart-Komponente für die Darstellung der Token-Verteilung
 * 
 * @param {Object} props - Komponenten-Props
 * @param {Array} props.data - Die Daten für das Diagramm [{label: string, value: number, color: string}]
 * @param {string} props.title - Der Titel des Diagramms
 * @param {Object} props.options - Optionen für das Diagramm (optional)
 * @returns {React.ReactElement}
 */
const PieChart = ({ data = [], title = '', options = {} }) => {
  const { i18n } = useTranslation();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const chartId = `pie-chart-${Math.random().toString(36).substr(2, 9)}`;

  // Standardfarben für das Diagramm mit verbesserten Kontrasten
  const defaultColors = [
    '#00a2ff', // Primärfarbe
    '#0077ff',
    '#36b9ff',
    '#5cc6ff',
    '#7fd2ff',
    '#a1dfff',
    '#c4ebff',
    '#e6f7ff'
  ];

  useEffect(() => {
    // Wenn keine Daten vorhanden sind, nichts tun
    if (!data || data.length === 0) return;

    // Canvas-Element abrufen
    const ctx = chartRef.current.getContext('2d');

    // Wenn bereits ein Chart existiert, diesen zerstören
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Labels und Werte aus den Daten extrahieren
    const labels = data.map(item => item.label);
    const values = data.map(item => item.value);
    const colors = data.map(item => item.color || defaultColors[Math.floor(Math.random() * defaultColors.length)]);

    // Neues Chart erstellen
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: 'rgba(20, 20, 30, 0.8)',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(20, 20, 30, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#00a2ff',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${value}%`;
              }
            }
          },
          title: {
            display: title ? true : false,
            text: title || '',
            color: '#fff',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });

    // Cleanup-Funktion
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, title]);

  // Erstelle eine textuelle Zusammenfassung für Screenreader
  const getAccessibleSummary = () => {
    if (!data || data.length === 0) return '';
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const summaryItems = data.map(item => {
      const percentage = Math.round((item.value / total) * 100);
      const label = safeT(item.label, item.label.split('.').pop());
      return `${label}: ${percentage}%`;
    });
    
    return `${title}: ${summaryItems.join(', ')}`;
  };

  // Legende für das Diagramm
  const renderLegend = () => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4" aria-hidden="true">
        {data.map((item, index) => {
          const itemColor = item.color || defaultColors[index % defaultColors.length];
          const percentage = Math.round((item.value / data.reduce((sum, i) => sum + i.value, 0)) * 100);
          const label = safeT(item.label, item.label.split('.').pop());
          
          return (
            <div key={index} className="flex items-center" role="presentation">
              <div 
                className="w-4 h-4 mr-2" 
                style={{ backgroundColor: itemColor }}
                aria-hidden="true"
              ></div>
              <span className="text-sm text-white">
                {label} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div 
      className="flex flex-col items-center" 
      role="figure" 
      aria-labelledby={`${chartId}-title`}
      aria-describedby={`${chartId}-description`}
    >
      <h3 id={`${chartId}-title`} className="text-xl font-bold mb-4">{title}</h3>
      <div className="relative h-64">
        <canvas ref={chartRef}></canvas>
      </div>
      <div id={`${chartId}-description`} className="sr-only">
        {getAccessibleSummary()}
      </div>
      {renderLegend()}
    </div>
  );
};

export default PieChart; 
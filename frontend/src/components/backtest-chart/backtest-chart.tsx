'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HistoricalDataPoint } from '@/types/backtest';
import { formatCurrency, formatDate } from '@/utils/formatters';
import styles from './backtest-chart.module.css';

interface BacktestChartProps {
  data: HistoricalDataPoint[];
}

export function BacktestChart({ data }: BacktestChartProps) {
  const chartData = data.map((point) => ({
    date: formatDate(point.date),
    value: Number(point.value.toFixed(2)),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{payload[0].payload.date}</p>
          <p className={styles.tooltipValue}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            stroke="#666"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#666"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4a90e2"
            strokeWidth={2}
            dot={false}
            name="Valor do Investimento"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import { BacktestResponse } from '@/types/backtest';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { BacktestChart } from '../backtest-chart/backtest-chart';
import styles from './backtest-results.module.css';

interface BacktestResultsProps {
  results: BacktestResponse;
}

export function BacktestResults({ results }: BacktestResultsProps) {
  const isProfit = results.profitOrLoss >= 0;

  return (
    <div className={styles.results}>
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Investimento Inicial</div>
          <div className={styles.summaryValue}>
            {formatCurrency(results.initialInvestment)}
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Valor Final</div>
          <div className={styles.summaryValue}>
            {formatCurrency(results.finalValue)}
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Lucro/Prejuízo</div>
          <div
            className={`${styles.summaryValue} ${
              isProfit ? styles.profit : styles.loss
            }`}
          >
            {formatCurrency(results.profitOrLoss)}
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Rentabilidade</div>
          <div
            className={`${styles.summaryValue} ${
              isProfit ? styles.profit : styles.loss
            }`}
          >
            {formatPercentage(results.returnPercentage)}
          </div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Evolução do Investimento</h2>
        <BacktestChart data={results.historicalData} />
      </div>

      {results.assetResults.length > 1 && (
        <div className={styles.assetsBreakdown}>
          <h2 className={styles.breakdownTitle}>Resultado por Ativo</h2>
          <div className={styles.assetsList}>
            {results.assetResults.map((assetResult, index) => {
              const isAssetProfit = assetResult.profitOrLoss >= 0;
              return (
                <div key={index} className={styles.assetCard}>
                  <div className={styles.assetHeader}>
                    <span className={styles.assetSymbol}>
                      {assetResult.asset.symbol}
                    </span>
                    <span className={styles.assetName}>
                      {assetResult.asset.name}
                    </span>
                  </div>
                  <div className={styles.assetDetails}>
                    <div className={styles.assetDetail}>
                      <span className={styles.detailLabel}>Investido:</span>
                      <span className={styles.detailValue}>
                        {formatCurrency(assetResult.initialInvestment)}
                      </span>
                    </div>
                    <div className={styles.assetDetail}>
                      <span className={styles.detailLabel}>Valor Final:</span>
                      <span className={styles.detailValue}>
                        {formatCurrency(assetResult.finalValue)}
                      </span>
                    </div>
                    <div className={styles.assetDetail}>
                      <span className={styles.detailLabel}>Resultado:</span>
                      <span
                        className={`${styles.detailValue} ${
                          isAssetProfit ? styles.profit : styles.loss
                        }`}
                      >
                        {formatCurrency(assetResult.profitOrLoss)} (
                        {formatPercentage(assetResult.returnPercentage)})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

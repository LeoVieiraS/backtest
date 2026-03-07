'use client';

import { useState, useRef, useEffect } from 'react';
import { BacktestForm } from '@/components/backtest-form/backtest-form';
import { BacktestResults } from '@/components/backtest-results/backtest-results';
import { BacktestRequest, BacktestResponse } from '@/types/backtest';
import { apiService } from '@/services/api.service';
import styles from './page.module.css';

export default function Home() {
  const [results, setResults] = useState<BacktestResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (data: BacktestRequest) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiService.executeBacktest(data);
      setResults(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao executar backtest. Tente novamente.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (results && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [results]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Backtest de Investimentos</h1>
        <p className={styles.subtitle}>
          Analise o desempenho histórico de seus investimentos
        </p>
      </header>

      <main className={styles.main}>
        <BacktestForm onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {results && (
          <div ref={resultsRef}>
            <BacktestResults results={results} />
          </div>
        )}
      </main>
    </div>
  );
}

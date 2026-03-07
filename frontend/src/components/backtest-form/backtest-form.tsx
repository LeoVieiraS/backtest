'use client';

import { useState, useEffect, useRef } from 'react';
import { AssetResponse, AssetType } from '@/types/asset';
import { apiService } from '@/services/api.service';
import styles from './backtest-form.module.css';

interface BacktestFormProps {
  onSubmit: (data: {
    assets: Array<{ symbol: string; type: AssetType; investment: number }>;
    initialInvestment: number;
    startDate: string;
    endDate: string;
  }) => void;
  isLoading: boolean;
}

interface SelectedAssetWithValue {
  symbol: string;
  type: AssetType;
  name: string;
  investment: number;
}

export function BacktestForm({ onSubmit, isLoading }: BacktestFormProps) {
  const [availableAssets, setAvailableAssets] = useState<AssetResponse[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<SelectedAssetWithValue[]>([]);
  const [initialInvestment, setInitialInvestment] = useState<string>('10000');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loadingAssets, setLoadingAssets] = useState<boolean>(true);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [divideEqually, setDivideEqually] = useState<boolean>(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAssets = async () => {
      setLoadingAssets(true);
      setAssetsError(null);
      try {
        const assets = await apiService.getAvailableAssets();
        setAvailableAssets(assets);
      } catch (error) {
        console.error('Failed to load assets:', error);
        setAssetsError(
          error instanceof Error
            ? error.message
            : 'Erro ao carregar ativos. Verifique se o backend está rodando.',
        );
      } finally {
        setLoadingAssets(false);
      }
    };

    loadAssets();

    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(oneYearAgo.toISOString().split('T')[0]);
  }, []);

  const MAX_ASSETS = 10;

  const handleAssetSelect = (asset: AssetResponse) => {
    if (selectedAssets.length >= MAX_ASSETS) {
      return;
    }
    const exists = selectedAssets.some(
      (a) => a.symbol === asset.symbol && a.type === asset.type,
    );
    if (!exists) {
      const totalInvestment = parseFloat(initialInvestment) || 0;
      const investmentPerAsset = divideEqually && selectedAssets.length >= 0
        ? totalInvestment / (selectedAssets.length + 1)
        : 0;
      
      setSelectedAssets((prev) => {
        const newAssets = [
          ...prev,
          { 
            symbol: asset.symbol, 
            type: asset.type, 
            name: asset.name,
            investment: investmentPerAsset,
          },
        ];
        
        if (divideEqually) {
          return redistributeInvestments(newAssets, totalInvestment);
        }
        
        return newAssets;
      });
    }
    setSearchQuery('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    searchInputRef.current?.focus();
  };

  const redistributeInvestments = (
    assets: SelectedAssetWithValue[],
    total: number,
  ): SelectedAssetWithValue[] => {
    if (assets.length === 0) return assets;
    const perAsset = total / assets.length;
    return assets.map((asset) => ({
      ...asset,
      investment: perAsset,
    }));
  };

  useEffect(() => {
    if (divideEqually && selectedAssets.length > 0) {
      const total = parseFloat(initialInvestment) || 0;
      if (total > 0) {
        setSelectedAssets((prev) => redistributeInvestments(prev, total));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divideEqually, initialInvestment]);

  const handleInvestmentChange = (
    symbol: string,
    type: AssetType,
    value: string,
  ) => {
    const numValue = parseFloat(value) || 0;
    setSelectedAssets((prev) =>
      prev.map((asset) =>
        asset.symbol === symbol && asset.type === type
          ? { ...asset, investment: numValue }
          : asset,
      ),
    );
  };

  const handleDivideEquallyChange = (checked: boolean) => {
    setDivideEqually(checked);
    if (checked && selectedAssets.length > 0) {
      const total = parseFloat(initialInvestment) || 0;
      setSelectedAssets((prev) => redistributeInvestments(prev, total));
    }
  };

  const handleAssetRemove = (symbol: string, type: AssetType) => {
    setSelectedAssets((prev) =>
      prev.filter((a) => !(a.symbol === symbol && a.type === type)),
    );
  };

  const [searchResults, setSearchResults] = useState<AssetResponse[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    const searchAssets = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const query = searchQuery.trim().toUpperCase();

      const searchPromises: Promise<AssetResponse | null>[] = [];

      const assetTypes: AssetType[] = [
        AssetType.STOCK_BR,
        AssetType.STOCK_US,
        AssetType.FII,
        AssetType.CRYPTO,
      ];

      for (const type of assetTypes) {
        searchPromises.push(apiService.searchAsset(query, type));
      }

      try {
        const results = await Promise.all(searchPromises);
        const validResults = results.filter(
          (asset): asset is AssetResponse => asset !== null,
        );
        setSearchResults(validResults);
      } catch (error) {
        console.error('Error searching assets:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchAssets, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const filteredAssets = searchQuery.trim().length >= 2
    ? searchResults.filter((asset) => {
        const isSelected = selectedAssets.some(
          (a) => a.symbol === asset.symbol && a.type === asset.type,
        );
        return !isSelected;
      })
    : availableAssets.filter((asset) => {
        if (!searchQuery.trim()) return false;
        const query = searchQuery.toLowerCase();
        const isSelected = selectedAssets.some(
          (a) => a.symbol === asset.symbol && a.type === asset.type,
        );
        return (
          !isSelected &&
          (asset.symbol.toLowerCase().includes(query) ||
            asset.name.toLowerCase().includes(query))
        );
      });

  const totalInvested = selectedAssets.reduce(
    (sum, asset) => sum + asset.investment,
    0,
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredAssets.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredAssets.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleAssetSelect(filteredAssets[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAssets.length === 0) {
      alert('Selecione pelo menos um ativo');
      return;
    }

    if (!startDate || !endDate) {
      alert('Selecione as datas de início e fim');
      return;
    }

    const hasInvalidInvestment = selectedAssets.some(
      (asset) => asset.investment <= 0,
    );
    if (hasInvalidInvestment) {
      alert('Todos os ativos devem ter um valor de investimento maior que zero');
      return;
    }

    onSubmit({
      assets: selectedAssets.map((a) => ({ 
        symbol: a.symbol, 
        type: a.type,
        investment: a.investment,
      })),
      initialInvestment: totalInvested,
      startDate,
      endDate,
    });
  };

  const getAssetTypeLabel = (type: AssetType): string => {
    switch (type) {
      case AssetType.STOCK_BR:
        return 'Ação BR';
      case AssetType.STOCK_US:
        return 'Ação US';
      case AssetType.FII:
        return 'FII';
      case AssetType.CRYPTO:
        return 'Crypto';
      default:
        return type;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Selecione os Ativos</h2>
        
        {loadingAssets && (
          <div className={styles.loading}>Carregando ativos...</div>
        )}

        {assetsError && (
          <div className={styles.error}>
            <p>{assetsError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {!loadingAssets && !assetsError && availableAssets.length > 0 && (
          <>
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Busque por código ou nome do ativo (ex: PETR4, Apple)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                    setHighlightedIndex(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                    className={styles.clearButton}
                    aria-label="Limpar busca"
                  >
                    ×
                  </button>
                )}
              </div>

              {showSuggestions &&
                searchQuery.trim() &&
                selectedAssets.length < MAX_ASSETS && (
                  <div ref={suggestionsRef} className={styles.suggestions}>
                    {isSearching ? (
                      <div className={styles.loading}>
                        Buscando ativos...
                      </div>
                    ) : filteredAssets.length === 0 ? (
                      <div className={styles.noResults}>
                        {searchQuery.trim().length >= 2
                          ? `Nenhum ativo encontrado para "${searchQuery}"`
                          : 'Digite pelo menos 2 caracteres para buscar'}
                      </div>
                    ) : (
                      filteredAssets.map((asset, index) => (
                        <div
                          key={`${asset.symbol}-${asset.type}`}
                          className={`${styles.suggestionItem} ${
                            index === highlightedIndex
                              ? styles.highlighted
                              : ''
                          }`}
                          onClick={() => handleAssetSelect(asset)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                        >
                          <div className={styles.suggestionContent}>
                            <span className={styles.suggestionSymbol}>
                              {asset.symbol}
                            </span>
                            <span className={styles.suggestionName}>
                              {asset.name}
                            </span>
                          </div>
                          <span className={styles.suggestionType}>
                            {getAssetTypeLabel(asset.type)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              {selectedAssets.length >= MAX_ASSETS && searchQuery.trim() && (
                <div className={styles.limitMessage}>
                  Limite de {MAX_ASSETS} ativos atingido. Remova um ativo para adicionar outro.
                </div>
              )}
            </div>
          </>
        )}

        {!loadingAssets && !assetsError && availableAssets.length === 0 && (
          <div className={styles.emptyState}>
            Nenhum ativo disponível no momento.
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Parâmetros do Backtest</h2>
        <div className={styles.inputsGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="investment" className={styles.label}>
              Valor do Investimento (R$)
            </label>
            <input
              id="investment"
              type="number"
              min="0.01"
              step="0.01"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="startDate" className={styles.label}>
              Data de Início
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="endDate" className={styles.label}>
              Data de Fim
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.input}
              required
            />
          </div>
        </div>
      </div>

      {selectedAssets.length > 0 && (
        <div className={styles.section}>
          <div className={styles.selectedAssets}>
            <div className={styles.selectedHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Ativos Selecionados</h2>
                <span className={styles.selectedCount}>
                  {selectedAssets.length} de {MAX_ASSETS} ativo(s) selecionado(s)
                </span>
                {selectedAssets.length >= MAX_ASSETS && (
                  <span className={styles.limitReached}>
                    {' '}• Limite máximo atingido
                  </span>
                )}
              </div>
              <label className={styles.divideEquallyLabel}>
                <input
                  type="checkbox"
                  checked={divideEqually}
                  onChange={(e) => handleDivideEquallyChange(e.target.checked)}
                  className={styles.divideEquallyCheckbox}
                />
                <span>Dividir valor igualmente</span>
              </label>
            </div>
            <div className={styles.assetsTableWrapper}>
              <table className={styles.assetsTable}>
                <thead>
                  <tr>
                    <th>Ativo</th>
                    <th>Tipo</th>
                    <th>Valor Investido (R$)</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAssets.map((asset) => (
                    <tr key={`${asset.symbol}-${asset.type}`}>
                      <td>
                        <div className={styles.assetCell}>
                          <span className={styles.tableSymbol}>{asset.symbol}</span>
                          <span className={styles.tableName}>{asset.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.tableType}>
                          {getAssetTypeLabel(asset.type)}
                        </span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={asset.investment.toFixed(2)}
                          onChange={(e) =>
                            handleInvestmentChange(
                              asset.symbol,
                              asset.type,
                              e.target.value,
                            )
                          }
                          disabled={divideEqually}
                          className={styles.investmentInput}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            handleAssetRemove(asset.symbol, asset.type)
                          }
                          className={styles.removeTableButton}
                          aria-label={`Remover ${asset.symbol}`}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className={styles.totalLabel}>
                      <strong>Total Investido:</strong>
                    </td>
                    <td className={styles.totalValue}>
                      <strong>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(totalInvested)}
                      </strong>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? 'Calculando...' : 'Executar Backtest'}
      </button>
    </form>
  );
}

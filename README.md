# Backtest de Investimentos

Aplicação web completa para análise de backtest de investimentos, desenvolvida seguindo **Clean Architecture** e **Domain-Driven Design (DDD)**.

## 🏗️ Arquitetura

A aplicação está organizada em camadas bem definidas, seguindo os princípios de Clean Architecture:

### Backend (NestJS)

```
backend/
├── src/
│   ├── domain/              # Camada de Domínio (Core)
│   │   ├── entities/        # Entidades de negócio
│   │   ├── value-objects/   # Value Objects
│   │   └── repositories/    # Interfaces de repositórios
│   ├── application/          # Camada de Aplicação
│   │   ├── use-cases/       # Casos de uso
│   │   └── dto/             # Data Transfer Objects
│   ├── infrastructure/      # Camada de Infraestrutura
│   │   ├── repositories/    # Implementações concretas
│   │   └── mappers/         # Mappers DTO <-> Domain
│   └── interface/           # Camada de Interface
│       ├── controllers/     # Controllers REST
│       ├── dto/             # DTOs de entrada
│       └── filters/         # Exception filters
```

### Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # Componentes React
│   ├── services/           # Serviços de API
│   ├── types/              # TypeScript types
│   └── utils/              # Utilitários
```

## 📋 Funcionalidades

- ✅ Seleção de múltiplos ativos (Ações BR/US, FIIs, Criptomoedas)
- ✅ Cálculo de backtest com aporte único
- ✅ Exibição de resultados detalhados:
  - Valor inicial e final
  - Lucro/Prejuízo absoluto
  - Rentabilidade percentual
- ✅ Gráfico evolutivo do investimento
- ✅ Breakdown por ativo (quando múltiplos ativos)
- ✅ Interface moderna e responsiva

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Backend

```bash
cd backend
npm install
npm run start:dev
```

O backend estará disponível em `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

### Variáveis de Ambiente

No frontend, você pode configurar a URL da API através da variável de ambiente:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🧪 Testes

### Backend

```bash
cd backend
npm test
npm run test:cov
```

## 📊 Estrutura de Domínio

### Entidades

- **Asset**: Representa um ativo financeiro (ação, FII, crypto)
- **Backtest**: Representa uma solicitação de backtest
- **BacktestResult**: Representa o resultado de um backtest

### Value Objects

- **AssetType**: Tipo de ativo (STOCK_BR, STOCK_US, FII, CRYPTO)
- **Money**: Valores monetários com validação
- **Percentage**: Percentuais com validação
- **DateRange**: Intervalo de datas com validação

### Use Cases

- **ExecuteBacktestUseCase**: Executa o cálculo do backtest
- **GetAvailableAssetsUseCase**: Retorna lista de ativos disponíveis

## 🔌 API Endpoints

### GET `/backtest/assets`
Retorna lista de ativos disponíveis para backtest.

**Response:**
```json
[
  {
    "symbol": "PETR4",
    "type": "STOCK_BR",
    "name": "Petrobras PN"
  }
]
```

### POST `/backtest`
Executa um backtest.

**Request:**
```json
{
  "assets": [
    {
      "symbol": "PETR4",
      "type": "STOCK_BR"
    }
  ],
  "initialInvestment": 10000,
  "startDate": "2023-01-01",
  "endDate": "2024-01-01"
}
```

**Response:**
```json
{
  "initialInvestment": 10000,
  "finalValue": 12500,
  "profitOrLoss": 2500,
  "returnPercentage": 25.0,
  "historicalData": [
    {
      "date": "2023-01-01T00:00:00.000Z",
      "value": 10000
    }
  ],
  "assetResults": [
    {
      "asset": {
        "symbol": "PETR4",
        "type": "STOCK_BR",
        "name": "PETR4"
      },
      "initialInvestment": 10000,
      "finalValue": 12500,
      "profitOrLoss": 2500,
      "returnPercentage": 25.0
    }
  ]
}
```

### GET `/backtest/test`
Endpoint de smoke test.

## 🎨 Decisões Arquiteturais

### Clean Architecture

- **Domínio isolado**: A camada de domínio não depende de frameworks ou bibliotecas externas
- **Inversão de dependências**: Interfaces definidas no domínio, implementações na infraestrutura
- **Separação de responsabilidades**: Cada camada tem uma responsabilidade clara

### DDD

- **Entidades ricas**: Entidades contêm lógica de negócio
- **Value Objects**: Validação e encapsulamento de valores primitivos
- **Use Cases**: Orquestram a lógica de negócio
- **Repositórios**: Abstração para acesso a dados

### TypeScript

- Tipagem forte em todo o código
- Uso de interfaces para contratos
- Evitar uso de `any`
- Validação com class-validator

## 🔄 Integração com APIs de Mercado

Atualmente, a aplicação utiliza um repositório mock (`MockAssetPriceRepository`) que simula dados de mercado. Para produção, você pode:

1. Implementar um novo repositório que implementa `IAssetPriceRepository`
2. Conectar a APIs reais como:
   - Alpha Vantage
   - Yahoo Finance
   - B3 (para ações brasileiras)
   - CoinGecko (para criptomoedas)

Exemplo de implementação:

```typescript
@Injectable()
export class RealMarketDataRepository implements IAssetPriceRepository {
  async getHistoricalPrices(asset: Asset, dateRange: DateRange): Promise<PriceDataPoint[]> {
    // Implementar chamada à API real
  }
}
```

## 📝 Regras de Negócio

1. **Aporte único**: O investimento é feito uma única vez no início do período
2. **Divisão igual**: Quando múltiplos ativos são selecionados, o investimento é dividido igualmente
3. **Cálculo de rentabilidade**: Baseado na variação percentual do preço do ativo
4. **Dados históricos**: Série temporal para visualização em gráfico

## 🛠️ Tecnologias

### Backend
- NestJS
- TypeScript
- class-validator
- date-fns

### Frontend
- Next.js 14
- React 18
- TypeScript
- Recharts
- CSS Modules

## 📚 Próximos Passos

- [ ] Implementar integração com APIs reais de mercado
- [ ] Adicionar mais testes unitários e de integração
- [ ] Implementar cache para dados de mercado
- [ ] Adicionar suporte a DCA (Dollar Cost Averaging)
- [ ] Implementar comparação entre diferentes estratégias
- [ ] Adicionar exportação de resultados (PDF/Excel)

## 📄 Licença

MIT

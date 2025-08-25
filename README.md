# Slack Command Pair

Um comando de barra (slash command) do Slack desenvolvido em Google Apps Script para consultar e exibir sessões de pair programming armazenadas em uma planilha do Google Sheets.

## 🎯 Funcionalidades

- 📊 Consulta sessões de pair programming de uma planilha Google Sheets
- 🔍 Filtros avançados por usuário, data e período
- 📖 Paginação de resultados
- 🎨 Interface rica com Slack Blocks
- ⚡ Respostas rápidas e eficientes
- 📈 **Modo de soma/resumo** com estatísticas detalhadas

## 🚀 Como Usar no Slack

O comando `/pair` permite consultar as sessões de pair programming com diversos filtros e opções.

### Sintaxe Básica

```
/pair [filtros]
```

### 📋 Exemplos de Uso

#### 1. Listar todas as sessões (paginado)

```
/pair
```

Retorna as primeiras 10 sessões de pair programming.

#### 2. Filtrar por usuário

```
/pair @joao
```

```
/pair user:UN3WD25RQ4F
```

```
/pair <@UN3WD25RQ4F>
```

Mostra apenas sessões que incluem o usuário especificado. Aceita:

- Menção direta (`@usuario`)
- ID do Slack (`user:U123456`)
- Formato de menção (`<@U123456>`)

#### 3. Filtrar por período

```
/pair from:2025-01-01
```

```
/pair to:2025-01-31
```

```
/pair from:2025-01-01 to:2025-01-31
```

Filtra sessões por data. Aceita diversos formatos:

- ISO: `2025-01-15`
- Português: `15 de janeiro de 2025`
- Relativo: `ontem`, `hoje`

#### 4. Combinando filtros

```
/pair @maria from:2025-01-01 to:2025-01-31
```

```
/pair user:UN3WD25RQ4F from:dezembro to:hoje
```

Combina múltiplos filtros para resultados mais específicos.

#### 5. Paginação

```
/pair page:2
```

```
/pair pagesize:20
```

```
/pair @joao page:3 pagesize:5
```

Controla a paginação dos resultados:

- `page:N` - navega para a página N
- `pagesize:N` - define quantos itens por página (máximo 40)

#### 6. Modo Suma/Resumo

```
/pair sum
```

```
/pair soma
```

```
/pair total
```

Exibe um resumo estatístico das sessões de pair programming. **Por padrão, considera o período da última segunda-feira até hoje** quando não são especificadas datas.

```
/pair sum @joao
```

```
/pair suma from:2025-08-01 to:2025-08-31
```

```
/pair total @maria from:agosto
```

O modo suma retorna:

- Total de sessões realizadas
- Tempo total investido em pair programming
- Número de participantes únicos
- Estatísticas detalhadas por participante (sessões e tempo)

#### 7. Exemplos Avançados

```
/pair @developer1 @developer2 from:01/08/2025 to:15/08/2025 page:2 pagesize:15
```

```
/pair user:UN3WD25RQ4F from:agosto to:setembro
```

```
/pair from:ontem pagesize:20
```

### 📊 Formato da Resposta

#### Modo Lista (padrão)

O comando retorna uma resposta formatada com:

```
📋 Pair Programming — Registros
user: `UN3WD25RQ4F`   from: `2025-01-01`   to: `2025-01-31`

• João Silva × Maria Santos
12 de agosto de 2025
12 de agosto de 2025 às 9h BRT → 12 de agosto de 2025 às 11h30 BRT
Implementar cache de PokéAPI para melhorar performance
02h30min (150 min)

page 1/3 • total 25
filters: "@joao from:2025-01-01 to:2025-01-31"
```

#### Modo Resumo/Suma

O comando `/pair sum` retorna estatísticas consolidadas:

```
📊 Resumo de Pair Programming
📅 Período: 19/08/2025 até 25/08/2025

🎯 Total de sessões: 8
⏱️ Tempo total: 12h30min (750 min)
👥 Participantes únicos: 4

👤 Por participante:
• João Silva: 6 sessões • 9h15min
• Maria Santos: 5 sessões • 7h45min
• Pedro Costa: 3 sessões • 4h30min
• Ana Oliveira: 2 sessões • 3h00min

resumo: "sum @joao"
```

## 📈 Modo Soma/Resumo

O modo suma é uma funcionalidade especial que permite obter estatísticas consolidadas das sessões de pair programming em vez de uma lista detalhada.

### Como Usar

Use as palavras-chave `sum`, `soma` ou `total` em qualquer lugar do comando:

```bash
/pair sum                    # Resumo da semana atual (segunda a hoje)
/pair soma @usuario          # Resumo do usuário na semana atual
/pair total from:agosto      # Resumo do mês de agosto
/pair sum from:2025-01-01 to:2025-01-31  # Resumo de janeiro
```

### Período Padrão

**Quando não são especificadas datas, o modo suma automaticamente considera:**

- **Data inicial:** Última segunda-feira (início da semana atual)
- **Data final:** Hoje

Isso facilita consultas rápidas do progresso semanal da equipe.

### O que o Resumo Inclui

- 📊 **Total de sessões** realizadas no período
- ⏱️ **Tempo total** investido em pair programming
- 👥 **Número de participantes únicos**
- 📋 **Ranking de participantes** ordenado por tempo investido
- 📅 **Período analisado** (datas de início e fim)

### Compatibilidade com Filtros

O modo suma funciona com todos os filtros disponíveis:

```bash
/pair sum @joao              # Soma apenas sessões do João
/pair suma from:ontem        # Soma de ontem até hoje
/pair total user:U123456 from:agosto  # Soma do usuário em agosto
```

## ⚙️ Configuração e Deploy

### Pré-requisitos

- Node.js 18+
- pnpm
- Conta Google Apps Script
- Planilha Google Sheets configurada

### Instalação

1. Clone o repositório:

```bash
git clone <repository-url>
cd slack-command-pair
```

2. Instale as dependências:

```bash
pnpm install
```

3. Configure as variáveis de ambiente:

```bash
# .env ou diretamente no Google Apps Script
export GAS_DEPLOYMENT_ID_PROD="your-deployment-id"
export GAS_DEPLOYMENT_ID_STAGING="your-staging-deployment-id"
```

### Build e Deploy

1. Build do projeto:

```bash
pnpm run build
```

2. Deploy para Google Apps Script:

```bash
pnpm run deploy
```

3. Obter URL do endpoint:

```bash
pnpm run endpoint:prod
```

### Configuração no Slack

1. Crie um novo Slack App em [api.slack.com](https://api.slack.com/apps)
2. Configure um Slash Command:
   - **Command**: `/pair`
   - **Request URL**: URL obtida do `endpoint:prod`
   - **Short Description**: "Consultar sessões de pair programming"
3. Instale o app no seu workspace

## 🏗️ Arquitetura

O projeto foi desenvolvido seguindo os princípios SOLID:

```
src/
├── config/         # Constantes de configuração
├── interfaces/     # Interfaces TypeScript
├── models/         # Modelos de dados
├── presenters/     # Lógica de apresentação
├── services/       # Lógica de negócio e acesso a dados
└── utils/          # Funções utilitárias
```

### Princípios SOLID Aplicados

#### Single Responsibility Principle (SRP)

Cada classe tem uma única responsabilidade:

- `SheetRepository`: Acesso aos dados do Google Sheets
- `FilterService`: Filtragem das sessões
- `PaginationService`: Paginação dos resultados
- `CommandParser`: Análise dos comandos de entrada
- `SlackResponseFormatter`: Formatação para o Slack
- `SummaryService`: Cálculo de estatísticas e resumos

#### Open/Closed Principle (OCP)

Extensível sem modificação:

- Novos formatters implementando `ResponseFormatter`
- Novas fontes de dados implementando `DataRepository`

#### Liskov Substitution Principle (LSP)

Interfaces garantem substituibilidade:

- Qualquer implementação de `DataRepository` pode substituir `SheetRepository`
- Qualquer implementação de `ResponseFormatter` pode substituir `SlackResponseFormatter`

#### Interface Segregation Principle (ISP)

Interfaces pequenas e focadas:

- `DataRepository` requer apenas `getAll()`
- `ResponseFormatter` requer apenas `formatResponse()`

#### Dependency Inversion Principle (DIP)

Dependências em abstrações:

- `PairProgrammingService` depende de interfaces, não implementações
- Injeção de dependências via constructor

## 🛠️ Scripts Disponíveis

```bash
# Build do projeto
pnpm run build

# Push para Google Apps Script
pnpm run push

# Deploy com nova versão
pnpm run deploy

# Abrir no Google Apps Script
pnpm run open

# URLs dos endpoints
pnpm run endpoint:prod
pnpm run endpoint:staging
```

## 📝 Estrutura dos Dados

### Sessão de Pair Programming

As sessões de pair programming contêm:

```typescript
interface PairRow {
  date: string; // "12 de agosto de 2025"
  start: string; // "12 de agosto de 2025 às 9h BRT"
  end: string; // "12 de agosto de 2025 às 11h30 BRT"
  participants: string[]; // ["João", "Maria"]
  goal: string; // "Implementar feature X..."
  duration: {
    // { "02h30min", 150 }
    text: string;
    minutes: number;
  };
  slackIds: string[]; // ["UN3WD25RQ4F", "U5ZR37E3P3E"]
}
```

### Resultado do Resumo

O modo suma retorna uma estrutura consolidada:

```typescript
interface SummaryResult {
  totalSessions: number; // Total de sessões
  totalMinutes: number; // Total em minutos
  totalHours: string; // Total formatado (ex: "12h30min")
  uniqueParticipants: string[]; // Lista de participantes únicos
  participantStats: Array<{
    // Estatísticas por participante
    name: string;
    sessions: number;
    minutes: number;
    hours: string;
  }>;
  dateRange: {
    // Período analisado
    from: Date;
    to: Date;
  };
}
```

## 🔧 Estendendo o Projeto

Para adicionar novas funcionalidades:

1. Defina novas interfaces em `/interfaces`
2. Implemente novos serviços em `/services`
3. Atualize a aplicação principal em `index.ts`

## 📄 Licença

Este projeto está licenciado sob a licença ISC.

# Slack Command Pair

A Google Apps Script application that serves as a Slack slash command for displaying pair programming sessions from a Google Sheet.

## Project Structure

The project has been refactored according to SOLID principles:

```
src/
├── config/         # Configuration constants
├── interfaces/     # TypeScript interfaces
├── models/         # Data models
├── presenters/     # Presentation logic
├── services/       # Business logic and data access
└── utils/          # Utility functions
```

## SOLID Principles Applied

### Single Responsibility Principle (SRP)

Each class has only one responsibility:

- `SheetRepository`: Handling data access to Google Sheets
- `FilterService`: Filtering pair programming sessions
- `PaginationService`: Handling pagination of results
- `CommandParser`: Parsing command inputs
- `SlackResponseFormatter`: Formatting responses for Slack

### Open/Closed Principle (OCP)

The application is designed to be extensible without modification:

- New formatters can be added by implementing the `ResponseFormatter` interface
- New data sources can be added by implementing the `DataRepository` interface

### Liskov Substitution Principle (LSP)

Interfaces are used to ensure that implementations can be substituted:

- Any class implementing `DataRepository` can replace `SheetRepository`
- Any class implementing `ResponseFormatter` can replace `SlackResponseFormatter`

### Interface Segregation Principle (ISP)

Interfaces are kept small and focused:

- `DataRepository` only requires a `getAll()` method
- `ResponseFormatter` only requires a `formatResponse()` method

### Dependency Inversion Principle (DIP)

The application depends on abstractions rather than concrete implementations:

- `PairProgrammingService` depends on interfaces (`DataRepository`, `ResponseFormatter`) rather than concrete implementations
- Dependencies are injected into services via constructor

## How to Use

1. Build the project:

```
pnpm run build
```

2. Deploy to Google Apps Script:

```
pnpm run deploy
```

3. Access the deployed endpoint:

```
pnpm run endpoint:prod
```

## Extending the Project

To add new features:

1. Define new interfaces in the `/interfaces` directory if needed
2. Implement new services in the `/services` directory
3. Update the main application in `index.ts` to use the new services

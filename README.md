# SME ERP Frontend

A modern React+TypeScript frontend for the SME ERP system.

## Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## Features

### Authentication

- JWT token-based authentication
- Automatic token refresh
- Protected routes

### Role-Based Access Control

- **VIEWER**: Read-only dashboard and reports
- **STAFF**: Dashboard, inventory management, transaction viewing
- **ADMIN**: Full access except user management
- **SUPER_ADMIN**: Complete system access

### Pages & Routes

| Page         | Route           | Role Requirements |
| ------------ | --------------- | ----------------- |
| Login        | `/login`        | None              |
| Dashboard    | `/`             | All authenticated |
| Items        | `/items`        | STAFF+            |
| Locations    | `/locations`    | STAFF+            |
| Transactions | `/transactions` | STAFF+            |
| Reports      | `/reports`      | All authenticated |
| Users        | `/users`        | SUPER_ADMIN       |
| Settings     | `/settings`     | ADMIN+            |

## API Integration

The frontend communicates with the backend through:

- Base URL: `http://localhost:8000`
- Authentication: Bearer token (JWT)
- Auto-retry on 401 errors
- Standardized error handling

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run tsc
```

## Technology Stack

- React 19.2.3
- TypeScript 5.9.3
- Vite 7.3.0
- React Router 7.11.0
- Custom CSS utilities (Tailwind-inspired)

## Project Structure

```
src/
├── api/              # API client and interfaces
├── components/       # Reusable UI components
├── contexts/         # React contexts (auth, etc.)
├── pages/           # Route components
└── App.tsx          # Main app component
```

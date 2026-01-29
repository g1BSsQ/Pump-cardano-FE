# Pump Cardano FE

A Next.js application for Cardano token trading and portfolio management.

## Architecture

This project follows a **feature-based architecture** for better maintainability and scalability:

### Directory Structure

```
src/
├── app/                    # Next.js App Router (routing layer)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── create/           # Create token page
│   ├── docs/             # Documentation page
│   ├── portfolio/        # Portfolio page
│   └── token/[id]/       # Dynamic token page
├── features/              # Business logic (feature-based)
│   ├── create/           # Token creation feature
│   ├── dashboard/        # Dashboard feature
│   ├── docs/             # Documentation feature
│   ├── portfolio/        # Portfolio feature
│   └── token/            # Token detail feature
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── common/           # Common components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   └── utils/            # Utility functions
└── services/              # API services and external integrations
```

### Key Principles

- **Feature-based**: Each feature is self-contained with its own components, logic, and types
- **Separation of Concerns**: Clear separation between routing (app/), business logic (features/), and UI (components/)
- **Reusability**: Shared components in `components/`, utilities in `lib/`, services in `services/`
- **Next.js Conventions**: App Router for routing, no confusion with `page.tsx` files in features

### Features

- **Token Creation**: Create new tokens on Cardano
- **Token Trading**: Swap tokens with bonding curve mechanics
- **Portfolio Management**: Track and manage token holdings
- **Dashboard**: Overview of market data and trending tokens
- **Documentation**: Project documentation and guides

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (shadcn/ui)
- **Blockchain**: Mesh SDK for Cardano integration
- **File Storage**: Pinata for IPFS uploads
- **State Management**: TanStack Query for data fetching
- **Animations**: Framer Motion

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Add your environment variables here
```

## Contributing

1. Follow the established architecture patterns
2. Keep features self-contained
3. Use TypeScript for type safety
4. Follow Next.js and React best practices

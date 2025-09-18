# PT Exercise Tracker

A React application built with Vite and TypeScript for tracking physical therapy exercises.

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Navigate to the src directory:
   ```bash
   cd src
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
src/
├── public/          # Static assets
├── src/             # Source code
│   ├── App.tsx      # Main App component
│   ├── App.css      # App styles
│   ├── index.css    # Global styles
│   ├── main.tsx     # Application entry point
│   └── vite-env.d.ts # Vite type declarations
├── index.html       # HTML template
├── package.json     # Dependencies and scripts
├── tsconfig.json    # TypeScript configuration
├── tsconfig.node.json # Node TypeScript configuration
└── vite.config.ts   # Vite configuration
```

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **ESLint** - Code linting

## Development

This project uses Vite for fast development and building. The development server supports:
- Hot Module Replacement (HMR)
- TypeScript compilation
- ESLint integration

Start building your PT Exercise Tracker features!

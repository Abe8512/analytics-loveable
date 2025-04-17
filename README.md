
# Future Sentiment Analytics

A powerful call analytics platform for sales teams that transcribes, analyzes, and provides insights from call recordings. This application helps sales managers track team performance, identify coaching opportunities, and improve sales outcomes through data-driven insights.

## Features

- **Call Analytics**
  - Transcription analysis
  - Sentiment tracking
  - Performance metrics
  - Real-time insights

- **Team Management**
  - Team member organization
  - Performance tracking
  - Call assignment

- **Data Visualization**
  - Interactive charts
  - Performance trends
  - Historical analysis
  - Team comparisons

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn UI
- **Data Visualization**: Recharts
- **State Management**: TanStack Query, Zustand
- **Backend Integration**: Supabase

## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/your-username/future-sentiment-analytics.git
cd future-sentiment-analytics
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:8080` to see the application.

## Troubleshooting Build Issues

If you encounter the "vite not found" error:

1. Try reinstalling dependencies:
```bash
rm -rf node_modules
npm install
```

2. Install Vite globally (not recommended for production, but helpful for debugging):
```bash
npm install -g vite
```

3. Check your Node.js version:
```bash
node -v
```
This project works best with Node.js version 16 or higher.

4. Run with npx:
```bash
npx vite
```

## Directory Structure

```
src/
├── components/        # Reusable UI components
├── contexts/         # React context providers
├── features/         # Feature-specific components
├── hooks/           # Custom React hooks
├── services/        # Business logic & data services
├── store/           # State management
├── types/           # TypeScript definitions
└── utils/           # Utility functions
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

[MIT License](LICENSE)

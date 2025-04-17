
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
git clone <your-repo-url>
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

## Key Dependencies

- `@tanstack/react-query`: Data fetching & caching
- `@supabase/supabase-js`: Backend integration
- `recharts`: Data visualization
- `shadcn/ui`: UI components
- `zustand`: State management
- `natural`: Natural language processing
- `framer-motion`: Animations
- `lucide-react`: Icons

## Development Guidelines

1. **Code Style**
   - Use TypeScript for all new code
   - Follow the existing component patterns
   - Keep components focused and small
   - Use proper TypeScript types

2. **Data Management**
   - Use TanStack Query for data fetching
   - Implement proper error handling
   - Use appropriate loading states
   - Cache data when possible

3. **Components**
   - Create reusable components
   - Implement responsive design
   - Use Tailwind for styling
   - Follow accessibility guidelines

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[MIT License](LICENSE)


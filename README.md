# Bonus App

A gamified experience where users spin a wheel to randomly win a reward. The outcome is controlled via JSON configuration to determine the chance and visual representation of each section.

## Features

- Interactive, visually appealing roulette-style game
- Each URL represents a unique, single-playable game instance
- Configurable wheel sections and probabilities through JSON
- Mobile-first responsive design
- SQLite database for game state persistence
- Smooth animations and visual effects

## Tech Stack

- **Frontend**: Next.js 15.4.5 with TypeScript
- **Styling**: TailwindCSS
- **Database**: SQLite with connection pooling
- **Deployment**: Ready for Vercel, Docker, or other platforms

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/bonus-app.git
   cd bonus-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### Wheel Configuration

The wheel is configured via a JSON file located at `config/wheel.json`. Each segment has the following properties:

- `label`: Text displayed on the segment
- `image`: Path to the image for the segment
- `chance`: Probability of landing on this segment (all chances should sum to 1)

Example configuration:

```json
[
  {
    "label": "Bonus 10%",
    "image": "/images/bonus10.svg",
    "chance": 0.1
  },
  {
    "label": "Bonus 20%",
    "image": "/images/bonus20.svg",
    "chance": 0.05
  },
  {
    "label": "Bonus 5%",
    "image": "/images/bonus5.svg",
    "chance": 0.15
  },
  {
    "label": "Free Spin",
    "image": "/images/freespin.svg",
    "chance": 0.1
  },
  {
    "label": "No Bonus",
    "image": "/images/nobonus.svg",
    "chance": 0.6
  }
]
```

## Database

The application uses SQLite to store game data. The database file is located at `database.sql` and is created automatically when the application starts.

### Schema

```sql
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  played BOOLEAN DEFAULT 0,
  result_label TEXT,
  result_image TEXT
);
```

## API Endpoints

### POST /api/games/create
Creates a new game and returns a unique game URL.

**Response:**
```json
{
  "gameId": "uuid-string",
  "url": "/game/uuid-string"
}
```

### GET /api/games/[id]
Retrieves game state by ID.

**Response:**
```json
{
  "id": "uuid-string",
  "created_at": "2024-01-01T00:00:00.000Z",
  "played": false,
  "result_label": null,
  "result_image": null
}
```

### PUT /api/games/[id]
Updates game result after spinning.

**Request Body:**
```json
{
  "result_label": "Bonus 10%",
  "result_image": "/images/bonus10.svg"
}
```

### GET /api/wheel-config
Returns the current wheel configuration.

## Project Structure

```
bonus-app/
├── config/
│   └── wheel.json          # Wheel configuration
├── lib/
│   ├── db.ts              # Database utilities
│   ├── gameLogic.ts       # Game logic and random selection
│   └── wheelConfig.ts     # Wheel configuration loader
├── public/
│   └── images/            # Wheel segment images
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── game/          # Game page
│   │   └── page.tsx       # Home page
│   └── components/        # React components
│       ├── Wheel.tsx      # Wheel component
│       └── ErrorMessage.tsx # Error display component
└── database.sql           # SQLite database file
```

## Deployment

### Vercel (Recommended)

The easiest way to deploy the application is using Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Deploy

**Note**: For SQLite persistence on Vercel, you'll need to use a custom solution like Vercel Postgres or another database service.

### Docker

Alternatively, you can deploy using Docker:

```bash
# Build the Docker image
docker build -t bonus-app .

# Run the container
docker run -p 3000:3000 -v $(pwd)/database.sql:/app/database.sql bonus-app
```

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env.local` file for local development:

```env
# Database configuration
DATABASE_PATH=./database.sql

# Application configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Performance Optimizations

- React.memo and useCallback for wheel component optimization
- Database connection pooling
- Image loading optimizations with priority and blur placeholders
- Next.js performance optimizations

## Error Handling

The application includes comprehensive error handling:

- Database connection errors
- Invalid wheel configuration
- Game state validation
- User-friendly error messages with retry options

## Mobile Responsiveness

The application is designed with mobile-first principles:

- Touch-friendly wheel interactions
- Responsive design for all screen sizes
- Optimized for both portrait and landscape orientations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

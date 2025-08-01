# Bonus Mobile App

A gamified mobile app with spin-the-wheel mechanics, built with React Native.

## Features

- Interactive spinning wheel with customizable sections
- Unique URL generation for each game instance
- Single-play enforcement per URL
- SQLite database for persistent game data
- Offline functionality
- Administrator interface for game management

## Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai.bonus
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies (iOS only):
```bash
cd ios && pod install && cd ..
```

## Running the App

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Start Metro bundler
```bash
npm start
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── services/       # Business logic and API services
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── assets/         # Images, fonts, and other assets
```

## Configuration

The wheel configuration is managed through `src/assets/config.json`. This file contains:
- Wheel sections with their chances
- Associated images for each section
- Game configuration parameters

## Development

- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run clean` - Clean build files

# 🏋️‍♀️ FYSIO - Your Personal Exercise Tracker

A modern React application built with Vite and TypeScript for tracking physical therapy exercises and maintaining workout consistency.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.2.0-purple)

## ✨ Features

- 🔐 **User Authentication** - Secure login/signup system
- 📋 **Exercise Tracking** - Mark exercises as complete with progress tracking
- 📝 **Note Taking** - Add personal notes for each exercise
- 🏗️ **Custom Routines** - Build personalized exercise routines
- 📊 **Progress Analytics** - Track streaks, adherence rates, and completion statistics
- 📤 **Progress Reports** - Generate and share progress with your PT
- 💾 **Local Storage** - Data persistence across sessions
- 📱 **Responsive Design** - Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Fysio.git
   cd Fysio
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

## 📁 Project Structure

```
src/
├── public/                 # Static assets
│   ├── react.svg
│   └── vite.svg
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── AuthForm.tsx    # Login/signup form
│   │   ├── ExerciseCard.tsx # Individual exercise component
│   │   ├── PTExerciseTracker.tsx # Main app logic
│   │   └── RoutineBuilder.tsx # Custom routine creator
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state management
│   ├── App.tsx            # Main App component
│   ├── App.css            # App styles
│   ├── index.css          # Global styles
│   ├── main.tsx           # Application entry point
│   └── vite-env.d.ts      # Vite type declarations
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # Node TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## 🛠️ Technologies Used

- **React 18** - Modern UI library with hooks
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and formatting
- **CSS3** - Modern styling with gradients and animations

## 🎯 Core Components

### AuthContext
Manages user authentication state and provides login/logout functionality.

### ExerciseCard
Reusable component for displaying individual exercises with completion tracking and note-taking capabilities.

### RoutineBuilder
Interactive interface for creating custom exercise routines with categorized exercise selection.

### PTExerciseTracker
Main application component that orchestrates the entire user experience.

## 📊 Features in Detail

### Exercise Tracking
- Mark exercises as complete/incomplete
- Visual progress bars
- Completion statistics

### Note System
- Add dated notes for each exercise
- Track how exercises feel over time
- View historical notes

### Progress Analytics
- Daily streak tracking
- Weekly and overall adherence rates
- Letter grade system (A+ to F)
- Workout history with completion percentages

### Custom Routines
- Select from categorized exercises
- Set difficulty levels
- Save and reuse routines

## 🚀 Development

This project uses Vite for fast development and building. The development server supports:
- ⚡ Hot Module Replacement (HMR)
- 🔍 TypeScript compilation
- 🧹 ESLint integration
- 📦 Optimized production builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and TypeScript for modern web development
- Designed for physical therapy patients and healthcare providers
- Inspired by the need for consistent exercise tracking and progress monitoring

---

**Start your fitness journey with FYSIO today!** 💪

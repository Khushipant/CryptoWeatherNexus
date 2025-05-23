# CryptoWeather 🌦️💰

CryptoWeather is a web application built using **Next.js** and **TypeScript** that combines cryptocurrency tracking with weather updates. It's designed to offer a clean UI and deliver real-time information using external APIs.

## 🚀 Features

- 🌤 Real-time weather updates based on your location
- 💹 Cryptocurrency price tracking
- 📱 Responsive and modern UI
- 🔒 Environment variables managed securely
- 📦 Fast build and optimized performance using Next.js

## 🛠 Tech Stack

- **Next.js** (React Framework)
- **TypeScript**
- **Tailwind CSS**
- **API Integration** for weather and crypto data
- **ESLint** and **Prettier** for code formatting

## 📁 Project Structure

```bash
CryptoWeather/
├── .env.local             # Environment variables
├── .gitignore
├── package.json           # Project metadata and dependencies
├── tsconfig.json          # TypeScript config
├── postcss.config.mjs     # PostCSS setup
├── eslint.config.mjs      # Linting rules
├── public/                # Static assets
├── pages/                 # Next.js pages
├── components/            # Reusable UI components
├── styles/                # Global styles
```

## 🔧 Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd CryptoWeather
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file and add:

   ```
   WEATHER_API_KEY=your_weather_api_key
   CRYPTO_API_KEY=your_crypto_api_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

- `npm run dev` - Run in development mode
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npm run lint` - Lint code

## 📄 License

This project is licensed under the [MIT License](LICENSE).

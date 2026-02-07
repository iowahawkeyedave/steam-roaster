# 🔥 Steam Library Roaster

[![Vercel](https://img.shields.io/badge/Vercel-Live-success?logo=vercel)](https://steam-roaster-rho.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)

> **Your Steam library has secrets. We're here to expose them.**

Enter your Steam ID and let AI roast your gaming habits. Share the burns with friends!

![Steam Library Roaster Screenshot](./screenshot.png)

## ✨ Features

- 🔗 **Steam Integration** — Fetches your complete game library via Steam Web API
- 🤖 **AI-Powered Roasts** — Analyzes your gaming personality and generates personalized burns
  - **Light** — Gentle teasing, friendly fun
  - **Medium** — Witty sarcasm, good-natured roasting
  - **Brutal** — No mercy, hilariously savage
- 📊 **Library Personality Detection** — Identifies your gaming archetype:
  - 🎯 **Hyperfocus** — Spends 50%+ time in one game
  - 📚 **Collector** — Huge backlog, sale addict
  - 🦋 **Butterfly** — Short attention span, never commits
  - 🏆 **Completionist** — Actually plays their games (rare!)
  - 😊 **Casual** — Balanced, normal gamer
- 🖼️ **Share Functionality** — Export and share your roast:
  - PNG download with beautiful card design
  - Copy text to clipboard
  - Share to X/Twitter, Reddit, Facebook
- 📈 **Analytics** — Track usage with Vercel Analytics
- 🎨 **Spotify Wrapped Aesthetic** — Dark mode, gradients, glow effects

## 🚀 Live Demo

**Try it now:** [steam-roaster-rho.vercel.app](https://steam-roaster-rho.vercel.app/)

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI:** [OpenRouter](https://openrouter.ai/) (Multi-model fallback)
- **APIs:** Steam Web API
- **Analytics:** [Vercel Analytics](https://vercel.com/analytics)
- **Deployment:** [Vercel](https://vercel.com/)

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Steam API Key ([get one here](https://steamcommunity.com/dev/apikey))
- OpenRouter API Key ([get one here](https://openrouter.ai/keys))

### Local Setup

```bash
# Clone the repository
git clone https://github.com/iowahawkeyedave/steam-roaster.git
cd steam-roaster

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

Create `.env.local`:

```env
# Required
STEAM_API_KEY=your_steam_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## 🎮 Usage

1. **Find your Steam ID**
   - Go to [steamid.io](https://steamid.io)
   - Enter your Steam profile URL
   - Copy your SteamID64 (starts with 765611...)

2. **Get Roasted**
   - Enter your Steam ID on the homepage
   - Choose your roast intensity (Light/Medium/Brutal)
   - Click "Roast My Library"
   - Wait for AI to analyze your gaming sins

3. **Share the Pain**
   - Download the PNG card
   - Copy the roast text
   - Share to social media
   - Tag your friends

## 🏗️ Project Structure

```
steam-roaster/
├── app/
│   ├── api/
│   │   ├── roast/           # AI roast generation endpoint
│   │   └── steam/           # Steam API proxy endpoint
│   ├── components/          # React components
│   ├── services/
│   │   └── openrouter.ts    # AI integration service
│   ├── globals.css
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main page
├── public/                  # Static assets
├── .env.local              # Environment variables
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🧠 How It Works

1. **Steam API Fetch** — Your Steam ID is sent to our secure API route, which fetches your public game library
2. **Library Analysis** — We calculate:
   - Total games owned
   - Games actually played
   - Total playtime
   - Most played games
   - Your gaming personality type
3. **AI Roast Generation** — Your library data is sent to OpenRouter AI with a carefully crafted prompt
4. **Multi-Model Fallback** — If the primary AI model fails, we automatically try backup models
5. **Shareable Card** — The roast is displayed in a beautiful, shareable card with your stats

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com/new)
3. Add environment variables in Project Settings
4. Deploy!

### Environment Variables on Vercel

```bash
STEAM_API_KEY=your_steam_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- [ ] Add more gaming personality types
- [ ] Improve roast prompts for better variety
- [ ] Add game genre analysis
- [ ] Support for Steam friends comparison
- [ ] Add more share options (Discord, etc.)
- [ ] Create an OG image for social sharing
- [ ] Add user accounts to save roasts

### Development

```bash
# Create a branch
git checkout -b feature/amazing-feature

# Make changes
# ...

# Commit
git commit -m "Add amazing feature"

# Push
git push origin feature/amazing-feature

# Open a Pull Request
```

## 📝 License

MIT License — feel free to use, modify, and distribute!

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- AI powered by [OpenRouter](https://openrouter.ai/)
- Data from [Steam Web API](https://developer.valvesoftware.com/wiki/Steam_Web_API)
- Deployed on [Vercel](https://vercel.com/)

---

**Made with ❤️ and 🔥 by [David](https://github.com/iowahawkeyedave)**

*Got roasted? Share it!* 🎮

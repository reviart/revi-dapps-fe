# Revi DApps – Secure Solana Wallet Interface

<p align="center">
  <img src="public/git_preview_1.png" alt="App Preview" width="400" />
</p>

## Product Overview

Revi DApps is a modern web application that enables users to securely connect, authenticate, and interact with their Solana wallets. Built for seamless onboarding, it leverages Privy Auth for authentication and supports both email and wallet-based login. Users can view wallet balances, sign messages, and manage their Solana accounts—all in a sleek, user-friendly interface with modern animations and transitions.

### Key Features
- **Solana Wallet Integration:** Connect and manage Solana wallets with Privy Auth.
- **Multi-Method Login:** Authenticate using email or wallet for flexible onboarding.
- **Balance Display:** Instantly view your SOL balance after connecting.
- **Message Signing:** Sign custom messages with your Solana wallet for dApp interactions or verification.
- **Modern UI:** Responsive design with smooth animations and transitions.
- **Multi-Page Layout:** Separate landing and dashboard pages for better organization.
- **Interactive Elements:** Animated buttons, modals, and form elements.

## Tech Stack
- **React 18** for UI
- **Vite** for fast development and build
- **Tailwind CSS** for styling and animations
- **Heroicons** for consistent iconography
- **React Router** for page routing
- **Privy Auth** (`@privy-io/react-auth`) for authentication
- **Solana Web3.js** for blockchain interactions
- **Alchemy** (optional) for enhanced Solana RPC endpoints

## Getting Started

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd revi-dapps-fe
```

### 2. Install dependencies
```sh
npm install
```

### 3. Configure environment variables
Copy the example environment file and fill in your credentials:
```sh
cp .env.example .env
```
- Get your Privy App ID from the [Privy Console](https://docs.privy.io/guide/console/api-keys) and set it in `.env`.
- Optionally, set your Alchemy API key for Solana RPC.

### 4. Run the app locally
```sh
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) to use the app.

## Project Structure & Key Files
- `src/pages/`: Contains page components
  - `LandingPage.jsx`: Initial user interface with login
  - `DashboardPage.jsx`: Main application dashboard
- `src/index.jsx`: App entry point, PrivyProvider setup, Solana config
- `src/App.jsx`: Router setup and page organization
- `src/index.css`: Tailwind CSS configuration and custom animations
- `.env.example`: Reference for required environment variables

## UI Features
- Smooth page transitions
- Interactive button animations
- Loading states and animations
- Responsive modals with backdrop blur
- Modern flat design with hover effects
- Consistent icon usage with Heroicons

## Extending & Contributing
- Add new pages by creating components in `src/pages/`
- Style with Tailwind CSS utility classes
- Use Heroicons for consistent iconography
- For authentication or wallet logic, see Privy and Solana Web3.js docs

## Resources
- [Initial Repository - PrivyIO](https://github.com/privy-io/create-react-app)
- [Privy Documentation](https://docs.privy.io/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Vite Documentation](https://vitejs.dev/)

---

*This project is for demonstration and rapid prototyping. For production, review security and best practices for wallet management and authentication.*

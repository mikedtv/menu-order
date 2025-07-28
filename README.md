# Menu Order

A React-based menu ordering application that allows customers to browse menus, customize orders, and manage their cart seamlessly.

## Features

- **Interactive Menu Display** - Browse through categorized menu items with detailed descriptions and pricing
- **Cart Management** - Add, remove, and modify items in your order cart
- **Order Customization** - Customize menu items with options, sizes, and special instructions

## Tech Stack

### Frontend

- **React** - Frontend framework
- **Vite** - Build tool and development server
- **JavaScript/ES6+** - Programming language
- **ESLint** - Code linting and formatting
- **CSS3** - Styling and responsive design

### Backend

- **Fastify** - High-performance web framework
- **SQLite** - Database
- **Pino** - Logging with pretty printing

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (version 20.16 or higher)
- npm package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/mikedtv/menu-order.git
cd menu-order
```

2. Install dependencies for both frontend and backend:

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

## Running the Application

#### Development Mode

1. Start the backend server:

```bash
cd server
npm run dev
```

The API server will run on [http://localhost:3000](http://localhost:3000) with auto-reload enabled.

2. In a new terminal, start the frontend:

```bash
cd client
npm run dev
```

The React app will run on [http://localhost:5173](http://localhost:5173). Vite is configured with a proxy to forward API requests to the backend server, so all requests to `/api/*` will be automatically routed to `http://localhost:3000` to avoid issues with CORS.

#### Production Mode

1. Build the frontend:

```bash
cd client
npm run build
```

2. Start the production server:

```bash
cd server
npm start
```

## Available Scripts

### Frontend (client/)

- `npm run dev` - Runs the React app in development mode using Vite
- `npm run build` - Builds the app for production
- `npm run preview` - Preview the production build locally
- `npm run format` - Format code using Prettier
- `npm run lint` - Run ESLint for code analysis
- `npm test` - Run tests (not yet implemented)

### Backend (server/)

- `npm run dev` - Runs the API server in development mode with auto-reload
- `npm start` - Runs the API server in production mode

#!/bin/bash

# Spindle MVP - Setup Script
# This script installs all necessary dependencies for the project

set -e  # Exit on any error

echo "🕸️  Setting up Spindle MVP..."
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js v16 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Error: Node.js version $NODE_VERSION is too old. Please install v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "📦 Initializing npm project..."
    npm init -y > /dev/null
else
    echo "📦 Using existing package.json"
fi

# Install core React dependencies
echo "⚛️  Installing React dependencies..."
npm install react react-dom --silent

# Install build tools
echo "🛠️  Installing build tools (Vite)..."
npm install --save-dev vite @vitejs/plugin-react --silent

# Install Monaco Editor
echo "🔧 Installing Monaco Editor..."
npm install @monaco-editor/react --silent

# Install tailwindcss with a specific version
echo "🎨 Installing Tailwind CSS..."
npm install -D tailwindcss@3.3.0 postcss autoprefixer

# Create the config files if they don't exist
if [ ! -f "tailwind.config.js" ]; then
    echo "📝 Creating Tailwind configuration..."
    npx tailwindcss init
fi

if [ ! -f "postcss.config.js" ]; then
    echo "📝 Creating PostCSS configuration..."
    npx tailwindcss init -p
fi

# Install Lucide React for icons
echo "🎯 Installing Lucide React icons..."
npm install lucide-react --silent

echo ""
echo "✅ Setup complete! Dependencies installed:"
echo "   • React & ReactDOM"
echo "   • Vite (build tool)"
echo "   • Monaco Editor"
echo "   • Tailwind CSS"
echo "   • Lucide React Icons"
echo ""
echo "📋 Next steps:"
echo "   1. Run 'npm run dev' to start development server"
echo "   2. Visit http://localhost:3000 in your browser"
echo ""
echo "🚀 Ready to build Spindle!"

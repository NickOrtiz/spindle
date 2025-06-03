# Spindle MVP - Web-Based Layout Builder

A revolutionary layout builder with syntax called **Threads**.

## Quick Start

```bash
# Make scripts executable
chmod +x setup.sh scaffold.sh

# Run setup (installs dependencies)
./setup.sh

# Run scaffold (creates project structure)  
./scaffold.sh

# Start development server
npm run dev
```

## Project Structure

```
/src
  /components    # React components
  /parser        # Threads DSL parser (future)
  /renderer      # Layout renderer (future) 
  /storage       # Local storage utilities (future)
  /export        # Export functionality (future)
  App.jsx        # Main application
  main.jsx       # React entry point
  index.css      # Global styles
```

## Core Features

- **Loom Editor** - Monaco-based code editor
- **Threads DSL** - Pug-inspired layout syntax  
- **Warp Preview** - Real-time layout preview
- **Fiber Library** - Reusable component library
- **Bobbin Projects** - Project management

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Next Steps

1. Implement Threads DSL parser
2. Build layout renderer
3. Add component library
4. Create export functionality
5. Add project management

Built with React, Vite, Tailwind CSS, and Monaco Editor.

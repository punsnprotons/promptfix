#!/bin/bash

# System Prompt Analysis & Auto-Repair Tool Setup Script
# This script sets up the development environment for the System Prompt Tool

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_VERSION="18.0.0"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
        else
            print_error "Node.js version $NODE_VERSION is not compatible. Required: >= $REQUIRED_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Function to check if PostgreSQL is running
check_postgres() {
    if command_exists psql; then
        if pg_isready -q; then
            print_success "PostgreSQL is running"
        else
            print_warning "PostgreSQL is not running. Please start PostgreSQL before continuing."
            print_status "On macOS with Homebrew: brew services start postgresql"
            print_status "On Ubuntu: sudo systemctl start postgresql"
            print_status "On Windows: Start PostgreSQL service from Services"
        fi
    else
        print_warning "PostgreSQL is not installed. Please install PostgreSQL 14+"
        print_status "On macOS: brew install postgresql"
        print_status "On Ubuntu: sudo apt-get install postgresql postgresql-contrib"
        print_status "On Windows: Download from https://www.postgresql.org/download/windows/"
    fi
}

# Function to check if Redis is running
check_redis() {
    if command_exists redis-cli; then
        if redis-cli ping >/dev/null 2>&1; then
            print_success "Redis is running"
        else
            print_warning "Redis is not running. Please start Redis before continuing."
            print_status "On macOS with Homebrew: brew services start redis"
            print_status "On Ubuntu: sudo systemctl start redis"
            print_status "On Windows: Start Redis service from Services"
        fi
    else
        print_warning "Redis is not installed. Please install Redis"
        print_status "On macOS: brew install redis"
        print_status "On Ubuntu: sudo apt-get install redis-server"
        print_status "On Windows: Download from https://github.com/microsoftarchive/redis/releases"
    fi
}

# Function to create database
create_database() {
    print_status "Creating database..."
    
    # Check if database exists
    if psql -lqt | cut -d \| -f 1 | grep -qw system_prompt_tool; then
        print_warning "Database 'system_prompt_tool' already exists"
    else
        createdb system_prompt_tool
        print_success "Database 'system_prompt_tool' created"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -f package.json ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    npm install
    print_success "Dependencies installed"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env.local ]; then
        if [ -f env.example ]; then
            cp env.example .env.local
            print_success "Environment file created from template"
            print_warning "Please edit .env.local with your actual configuration values"
        else
            print_error "env.example not found"
            exit 1
        fi
    else
        print_warning "Environment file already exists"
    fi
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    cd packages/database
    
    # Generate Prisma client
    npx prisma generate
    print_success "Prisma client generated"
    
    # Push database schema
    npx prisma db push
    print_success "Database schema pushed"
    
    # Seed database
    npx prisma db seed
    print_success "Database seeded with demo data"
    
    cd ../..
}

# Function to build packages
build_packages() {
    print_status "Building packages..."
    
    # Build shared package
    cd packages/shared
    npm run build
    print_success "Shared package built"
    cd ../..
    
    # Build providers package
    cd packages/providers
    npm run build
    print_success "Providers package built"
    cd ../..
    
    # Build CLI package
    cd packages/cli
    npm run build
    print_success "CLI package built"
    cd ../..
    
    # Build web app
    cd apps/web
    npm run build
    print_success "Web app built"
    cd ../..
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Type checking
    npm run type-check
    print_success "Type checking passed"
    
    # Linting
    npm run lint
    print_success "Linting passed"
}

# Function to start development servers
start_dev() {
    print_status "Starting development servers..."
    
    print_success "Setup complete! Starting development environment..."
    print_status "Web app will be available at: http://localhost:3000"
    print_status "API will be available at: http://localhost:3001"
    
    # Start development servers in background
    npm run dev &
    
    print_success "Development servers started"
    print_status "Press Ctrl+C to stop all servers"
    
    # Wait for user to stop
    wait
}

# Main setup function
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║        System Prompt Analysis & Auto-Repair Tool           ║"
    echo "║                    Setup Script                             ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    print_status "Starting setup process..."
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_node_version
    check_postgres
    check_redis
    
    # Create database
    create_database
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_environment
    
    # Setup database
    setup_database
    
    # Build packages
    build_packages
    
    # Run tests
    run_tests
    
    print_success "Setup completed successfully!"
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    Setup Complete!                           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Edit .env.local with your API keys and configuration"
    echo "2. Run 'npm run dev' to start development servers"
    echo "3. Open http://localhost:3000 in your browser"
    echo "4. Try the CLI: npx @system-prompt-tool/cli --help"
    
    echo -e "${BLUE}Available commands:${NC}"
    echo "- npm run dev          # Start development servers"
    echo "- npm run build        # Build all packages"
    echo "- npm run lint         # Run linting"
    echo "- npm run type-check   # Run type checking"
    echo "- npm run db:studio    # Open Prisma Studio"
    echo "- npm run db:seed      # Re-seed database"
    
    echo -e "${BLUE}CLI commands:${NC}"
    echo "- spt init             # Initialize new project"
    echo "- spt generate-scenarios # Generate test scenarios"
    echo "- spt run-eval         # Run evaluation"
    echo "- spt run-redteam      # Run security scan"
    echo "- spt check-gates      # Check CI/CD thresholds"
    
    # Ask if user wants to start development servers
    echo ""
    read -p "Would you like to start the development servers now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_dev
    else
        print_status "You can start development servers later with: npm run dev"
    fi
}

# Run main function
main "$@"

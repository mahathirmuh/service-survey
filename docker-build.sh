#!/bin/bash

# Docker build script for Service Survey Application
# Usage: ./docker-build.sh [production|development|clean]

set -e

PROJECT_NAME="service-survey"
IMAGE_NAME="service-survey-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
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

build_production() {
    print_info "Building production Docker image..."
    docker build -t ${IMAGE_NAME}:latest -t ${IMAGE_NAME}:prod .
    print_success "Production image built successfully!"
    
    print_info "Image details:"
    docker images ${IMAGE_NAME}
}

build_development() {
    print_info "Building development Docker image..."
    docker build -f Dockerfile.dev -t ${IMAGE_NAME}:dev .
    print_success "Development image built successfully!"
    
    print_info "Image details:"
    docker images ${IMAGE_NAME}
}

run_production() {
    print_info "Starting production container..."
    docker-compose up -d
    print_success "Production container started!"
    print_info "Application available at: http://localhost:3000"
}

run_development() {
    print_info "Starting development container..."
    docker-compose -f docker-compose.dev.yml up -d
    print_success "Development container started!"
    print_info "Application available at: http://localhost:8080"
}

stop_containers() {
    print_info "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    print_success "All containers stopped!"
}

clean_images() {
    print_info "Cleaning up Docker images..."
    docker rmi ${IMAGE_NAME}:latest ${IMAGE_NAME}:prod ${IMAGE_NAME}:dev 2>/dev/null || true
    docker system prune -f
    print_success "Cleanup completed!"
}

show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  production, prod    Build and run production image"
    echo "  development, dev    Build and run development image"
    echo "  build-prod         Build production image only"
    echo "  build-dev          Build development image only"
    echo "  run-prod           Run production container only"
    echo "  run-dev            Run development container only"
    echo "  stop               Stop all containers"
    echo "  clean              Clean up Docker images and containers"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 production      # Build and run production"
    echo "  $0 dev             # Build and run development"
    echo "  $0 clean           # Clean up everything"
}

case "${1:-help}" in
    "production"|"prod")
        build_production
        run_production
        ;;
    "development"|"dev")
        build_development
        run_development
        ;;
    "build-prod")
        build_production
        ;;
    "build-dev")
        build_development
        ;;
    "run-prod")
        run_production
        ;;
    "run-dev")
        run_development
        ;;
    "stop")
        stop_containers
        ;;
    "clean")
        stop_containers
        clean_images
        ;;
    "help"|*)
        show_help
        ;;
esac
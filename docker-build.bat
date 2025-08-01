@echo off
REM Docker build script for Service Survey Application (Windows)
REM Usage: docker-build.bat [production|development|clean]

setlocal enabledelayedexpansion

set PROJECT_NAME=service-survey
set IMAGE_NAME=service-survey-app

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="production" goto production
if "%1"=="prod" goto production
if "%1"=="development" goto development
if "%1"=="dev" goto development
if "%1"=="build-prod" goto build_production
if "%1"=="build-dev" goto build_development
if "%1"=="run-prod" goto run_production
if "%1"=="run-dev" goto run_development
if "%1"=="stop" goto stop_containers
if "%1"=="clean" goto clean_images
goto help

:production
echo [INFO] Building and running production...
call :build_production
call :run_production
goto end

:development
echo [INFO] Building and running development...
call :build_development
call :run_development
goto end

:build_production
echo [INFO] Building production Docker image...
docker build -t %IMAGE_NAME%:latest -t %IMAGE_NAME%:prod .
if errorlevel 1 (
    echo [ERROR] Failed to build production image!
    exit /b 1
)
echo [SUCCESS] Production image built successfully!
docker images %IMAGE_NAME%
goto :eof

:build_development
echo [INFO] Building development Docker image...
docker build -f Dockerfile.dev -t %IMAGE_NAME%:dev .
if errorlevel 1 (
    echo [ERROR] Failed to build development image!
    exit /b 1
)
echo [SUCCESS] Development image built successfully!
docker images %IMAGE_NAME%
goto :eof

:run_production
echo [INFO] Starting production container...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start production container!
    exit /b 1
)
echo [SUCCESS] Production container started!
echo [INFO] Application available at: http://localhost:3000
goto :eof

:run_development
echo [INFO] Starting development container...
docker-compose -f docker-compose.dev.yml up -d
if errorlevel 1 (
    echo [ERROR] Failed to start development container!
    exit /b 1
)
echo [SUCCESS] Development container started!
echo [INFO] Application available at: http://localhost:8080
goto :eof

:stop_containers
echo [INFO] Stopping all containers...
docker-compose down
docker-compose -f docker-compose.dev.yml down
echo [SUCCESS] All containers stopped!
goto :eof

:clean_images
echo [INFO] Cleaning up Docker images...
call :stop_containers
docker rmi %IMAGE_NAME%:latest %IMAGE_NAME%:prod %IMAGE_NAME%:dev 2>nul
docker system prune -f
echo [SUCCESS] Cleanup completed!
goto :eof

:help
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   production, prod    Build and run production image
echo   development, dev    Build and run development image
echo   build-prod         Build production image only
echo   build-dev          Build development image only
echo   run-prod           Run production container only
echo   run-dev            Run development container only
echo   stop               Stop all containers
echo   clean              Clean up Docker images and containers
echo   help               Show this help message
echo.
echo Examples:
echo   %0 production      # Build and run production
echo   %0 dev             # Build and run development
echo   %0 clean           # Clean up everything
goto end

:end
endlocal
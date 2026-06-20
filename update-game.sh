#!/bin/bash
set -e

GAME_NAME=$1
SOURCE_PATH=$2

if [ -z "$GAME_NAME" ] || [ -z "$SOURCE_PATH" ]; then
  echo "Usage: ./update-game.sh <game-folder-name> <source-project-path>"
  exit 1
fi

LAUNCHER_GAMES="/home/happydestiny/playable-games/games/$GAME_NAME"

echo "=== Updating $GAME_NAME ==="
cd "$SOURCE_PATH"

# Detect project type
if [ -f "project.godot" ]; then
  echo "Detected Godot project"
  echo "1. Exporting web build..."
  mkdir -p export/web
  godot --headless --export-release "Web" export/web/index.html 2>/dev/null || echo "Godot export failed or not installed"
  BUILD_PATH="export/web"

elif [ -f "package.json" ]; then
  echo "Detected npm/Vite project"
  echo "1. Pulling latest + building..."
  git pull origin main
  npm install
  npm run build
  BUILD_PATH="dist"

elif [ -f "prototype.html" ]; then
  echo "Detected HTML prototype project"
  echo "1. Using prototype.html as build..."
  mkdir -p build
  cp prototype.html build/index.html
  BUILD_PATH="build"

else
  echo "Unknown project type"
  exit 1
fi

echo "2. Copying build to launcher..."
rm -rf "$LAUNCHER_GAMES"/*
cp -r "$BUILD_PATH"/* "$LAUNCHER_GAMES/" 2>/dev/null || echo "No build files found"

echo "3. Committing and pushing to launcher..."
cd /home/happydestiny/playable-games
git add "games/$GAME_NAME/"
git commit -m "Update $GAME_NAME build (auto)" || echo "No changes to commit"
git push

echo "=== Done updating $GAME_NAME ==="

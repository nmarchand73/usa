@echo off
cd /d "%~dp0"
echo Demarrage du serveur...
start "" cmd /k "npx serve ."
timeout /t 3 /nobreak >nul
echo Ouverture de la carte dans le navigateur.
start "" "http://localhost:3000/usa-map.html"
echo.
echo Le serveur tourne dans l'autre fenetre. Fermez-la pour arreter.

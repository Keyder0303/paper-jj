@echo off
title Paper Puente — Actualizador de Servidor
color 09
echo ================================================
echo    ACTUALIZANDO REPOSITORIO PAPER PUENTE
echo ================================================
cd /d "%~dp0.."
git pull origin main
npm install --prefix wa-server
echo ================================================
echo    ACTUALIZACION COMPLETADA CON EXITO
echo ================================================
pause

@echo off
REM ====================================================================
REM HidupBaru POS - One-click setup for a cashier PC.
REM
REM Run by double-clicking this file. Will prompt for admin elevation.
REM
REM Prerequisite: install the Panda PRJ-80USE printer driver first
REM (run the FK80 Printer Driver Install.exe that came with the printer
REM CD or the manufacturer's website). After driver install, plug in the
REM printer via USB, then run this script.
REM ====================================================================

powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0setup_hidupbaru.ps1"
echo.
pause

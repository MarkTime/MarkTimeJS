@echo off

for /f "delims=|" %%f in ('dir /b .\') do tsc %%f
pause
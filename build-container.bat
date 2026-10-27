@echo off
setlocal EnableExtensions
pushd "%~dp0"

rem Build a container from an image folder.
rem   Drag an image folder onto this file, or run:
rem     build-container.bat "D:\galleries\people"
rem     build-container.bat people            (public\galleries\people)
rem     build-container.bat "D:\photos" myname

set "SOURCE=%~1"
set "NAME=%~2"

if "%SOURCE%"=="" (
  set /p "SOURCE=Image folder (full path, or gallery name under public\galleries): "
)
if "%SOURCE%"=="" goto :end
set "SOURCE=%SOURCE:"=%"
if not "%NAME%"=="" set "NAME=%NAME:"=%"

if exist "%SOURCE%\" (
  set "IMAGES=%SOURCE%"
) else if exist "public\galleries\%SOURCE%\" (
  set "IMAGES=public\galleries\%SOURCE%"
) else (
  echo.
  echo Folder not found: %SOURCE%
  echo Use a full path, or a gallery name under public\galleries.
  goto :end
)

if "%NAME%"=="" (
  for %%I in ("%IMAGES%") do set "NAME=%%~nxI"
)

echo.
echo Building the viewer...
call npm run build
if errorlevel 1 goto :end

echo.
echo Building container "%NAME%" from "%IMAGES%"...
call npm run container -- --images "%IMAGES%" --name "%NAME%"
if errorlevel 1 goto :end

:end
popd
echo.
if /I not "%NO_PAUSE%"=="1" pause
endlocal

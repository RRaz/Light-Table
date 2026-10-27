@echo off
setlocal EnableExtensions
pushd "%~dp0"

rem Update a downloaded container to the current viewer and reindex its images.
rem   Drag the container folder onto this file, or run:
rem     refresh-container.bat "D:\downloads\people"
rem     refresh-container.bat people          (dist\containers\people)
rem The images, their order and the existing titles are left alone.

set "CONTAINER=%~1"

if "%CONTAINER%"=="" (
  set /p "CONTAINER=Container folder (full path, or name under dist\containers): "
)
if "%CONTAINER%"=="" goto :end
set "CONTAINER=%CONTAINER:"=%"

if exist "%CONTAINER%\" (
  set "TARGET=%CONTAINER%"
) else if exist "dist\containers\%CONTAINER%\" (
  set "TARGET=dist\containers\%CONTAINER%"
) else (
  echo.
  echo Folder not found: %CONTAINER%
  echo Use a full path, or a container name under dist\containers.
  goto :end
)

rem If the dropped folder is the image subfolder, use its parent container.
if exist "%TARGET%\viewer\viewer.html" goto :build
if exist "%TARGET%\viewer.html" goto :build
for %%I in ("%TARGET%\..") do set "PARENT=%%~fI"
if exist "%PARENT%\viewer\viewer.html" set "TARGET=%PARENT%"

:build
echo.
echo Building the viewer...
call npm run build
if errorlevel 1 goto :end

echo.
echo Refreshing "%TARGET%"...
call npm run refresh -- --container "%TARGET%"
if errorlevel 1 goto :end

:end
popd
echo.
if /I not "%NO_PAUSE%"=="1" pause
endlocal

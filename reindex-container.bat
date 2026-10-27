@echo off
setlocal EnableExtensions
pushd "%~dp0"

rem Rebuild gallery.json inside a downloaded container.
rem   Drag the container folder onto this file, or run:
rem     reindex-container.bat "D:\downloads\people"
rem     reindex-container.bat people          (dist\containers\people)
rem The image subfolder is found automatically.

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
if exist "%TARGET%\viewer\" goto :run
for %%I in ("%TARGET%\..") do set "PARENT=%%~fI"
if exist "%PARENT%\viewer\" set "TARGET=%PARENT%"

:run
echo.
echo Reindexing "%TARGET%"...
call npm run reindex -- --container "%TARGET%"
if errorlevel 1 goto :end

:end
popd
echo.
if /I not "%NO_PAUSE%"=="1" pause
endlocal

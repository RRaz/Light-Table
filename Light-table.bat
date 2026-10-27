@echo off
setlocal EnableExtensions
pushd "%~dp0"

rem One entry point for gallery containers.
rem   Drop a container folder  -> update its viewer in place, then reindex.
rem   Drop an image folder      -> build a new container under dist\containers.
rem Both keep the image files and any custom titles.
rem
rem   container.bat "D:\downloads\people"
rem   container.bat "D:\galleries\people"
rem   container.bat people                  (dist\containers\people)
rem   container.bat "D:\galleries\people" myname

set "INPUT=%~1"
set "NAME=%~2"

if "%INPUT%"=="" (
  echo Drop a container folder here to update it in place,
  echo or an image folder to build a new container.
  echo.
  set /p "INPUT=Folder or container name: "
)
if "%INPUT%"=="" goto :end
set "INPUT=%INPUT:"=%"
if not "%NAME%"=="" set "NAME=%NAME:"=%"

if exist "%INPUT%\" (
  set "TARGET=%INPUT%"
) else if exist "dist\containers\%INPUT%\" (
  set "TARGET=dist\containers\%INPUT%"
) else (
  echo.
  echo Folder not found: %INPUT%
  echo Use a full path, or a container name under dist\containers.
  goto :end
)

rem A container has viewer/viewer.html (or the older viewer.html at its root).
if exist "%TARGET%\viewer\viewer.html" goto :refresh
if exist "%TARGET%\viewer.html" goto :refresh

rem Dropping the image subfolder of a container updates that container.
for %%I in ("%TARGET%\..") do set "PARENT=%%~fI"
if exist "%PARENT%\viewer\viewer.html" (
  set "TARGET=%PARENT%"
  goto :refresh
)

:build
echo.
echo Building the viewer...
call npm run build
if errorlevel 1 goto :end

echo.
echo Building a new container from "%TARGET%"...
if "%NAME%"=="" (
  call npm run container -- --images "%TARGET%"
) else (
  call npm run container -- --images "%TARGET%" --name "%NAME%"
)
if errorlevel 1 goto :end
goto :end

:refresh
echo.
echo Building the viewer...
call npm run build
if errorlevel 1 goto :end

echo.
echo Updating "%TARGET%" in place...
call npm run refresh -- --container "%TARGET%"
if errorlevel 1 goto :end

:end
popd
echo.
if /I not "%NO_PAUSE%"=="1" pause
endlocal

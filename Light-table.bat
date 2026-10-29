@echo off
setlocal EnableExtensions
pushd "%~dp0"

rem One entry point for gallery containers.
rem   Drop a container folder  -> update its viewer in place, then reindex.
rem   Drop an image folder      -> build a new container under containers\.
rem Both keep the image files and any custom titles.
rem
rem   Light-table.bat "D:\downloads\people"
rem   Light-table.bat "D:\galleries\people"
rem   Light-table.bat people                  (containers\people)
rem   Light-table.bat "D:\galleries\people" myname

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

rem Resolve to an absolute path so the dist check below is reliable.
if exist "%INPUT%\" (
  for %%I in ("%INPUT%") do set "TARGET=%%~fI"
) else if exist "containers\%INPUT%\" (
  for %%I in ("containers\%INPUT%") do set "TARGET=%%~fI"
) else (
  echo.
  echo Folder not found: %INPUT%
  echo Use a full path, or a container name under containers.
  goto :end
)

set "ACTION=build"
if exist "%TARGET%\viewer\viewer.html" set "ACTION=refresh"
if exist "%TARGET%\viewer.html" set "ACTION=refresh"
if /I "%ACTION%"=="refresh" goto :guard

rem Dropping the image subfolder of a container updates that container.
for %%I in ("%TARGET%\..") do set "PARENT=%%~fI"
if exist "%PARENT%\viewer\viewer.html" set "TARGET=%PARENT%"
if exist "%TARGET%\viewer\viewer.html" set "ACTION=refresh"
if exist "%TARGET%\viewer.html" set "ACTION=refresh"

rem A folder that already has the container shape - one subfolder holding the
rem images - but no viewer yet, is completed in place. Without this it is treated
rem as a plain image folder, finds nothing at the top level, and fails.
if /I "%ACTION%"=="refresh" goto :guard
set "HASIMAGES="
for %%E in (jpg jpeg png gif webp avif bmp svg) do if exist "%TARGET%\*.%%E" set "HASIMAGES=1"
set "SUBCOUNT=0"
for /d %%D in ("%TARGET%\*") do set /a SUBCOUNT+=1
if not defined HASIMAGES if "%SUBCOUNT%"=="1" set "ACTION=refresh"

:guard
rem npm run build empties dist\; never run on anything inside it.
set "DISTROOT=%CD%\dist"
echo "%TARGET%" | findstr /I /L /C:"%DISTROOT%" >nul
if not errorlevel 1 (
  echo.
  echo This folder is inside dist\, which npm run build empties.
  echo Move it to containers\, or anywhere outside dist\, and run again.
  goto :end
)

if /I "%ACTION%"=="refresh" goto :refresh

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

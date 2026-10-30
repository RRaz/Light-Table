@echo off
setlocal EnableExtensions
pushd "%~dp0"

rem One entry point: an image folder - images at its top level, optionally with a
rem gallery.json. It is always built as a container in containers\<name>.
rem
rem A container is never an input: drop the image folder inside it instead.
rem When the image folder is outside containers\, the new gallery.json is copied
rem back to it, so the source keeps the titles and order.
rem
rem   Light-table.bat "D:\photos\kodachrome"
rem   Light-table.bat "D:\photos\kodachrome" myname
rem   Light-table.bat containers\kodachrome\kodachrome

set "INPUT=%~1"
set "NAME=%~2"

if "%INPUT%"=="" (
  echo Drop an image folder here, or type its path.
  echo.
  set /p "INPUT=Image folder: "
)
if "%INPUT%"=="" goto :end
set "INPUT=%INPUT:"=%"
if not "%NAME%"=="" set "NAME=%NAME:"=%"

if exist "%INPUT%\" (
  for %%I in ("%INPUT%") do set "TARGET=%%~fI"
) else (
  echo.
  echo Folder not found: %INPUT%
  goto :end
)

rem --- it has to be an image folder ------------------------------------------------
set "HASIMAGES="
for %%E in (jpg jpeg png gif webp avif bmp svg) do if exist "%TARGET%\*.%%E" set "HASIMAGES=1"
if defined HASIMAGES goto :haveimages

for %%I in ("%TARGET%") do set "TNAME=%%~nxI"
echo.
echo Not an image folder: there are no images at the top level of
echo   %TARGET%
echo.
if exist "%TARGET%\light-table\index.html" goto :iscontainer
if exist "%TARGET%\viewer\viewer.html" goto :iscontainer
if exist "%TARGET%\%TNAME%\" goto :iscontainer
echo Put the image files directly in that folder. Supported types:
echo   jpg jpeg png gif webp avif bmp svg
goto :end

:iscontainer
echo That is a container. Drop the image folder inside it instead:
echo   %TARGET%\%TNAME%
goto :end

:haveimages
rem --- never run inside dist -------------------------------------------------------
set "DISTROOT=%CD%\dist"
set "CHECK=%TARGET%"
call set "CHECK=%%CHECK:%DISTROOT%\=%%"
if /I not "%CHECK%"=="%TARGET%" (
  echo.
  echo This folder is inside dist\, which npm run build empties.
  goto :end
)

for %%I in ("%TARGET%\..") do set "PARENTOF=%%~fI"
rem --- build -----------------------------------------------------------------------
echo.
echo Building the light table...
call npm run build
if errorlevel 1 goto :end

echo.
echo Building a container from "%TARGET%"...
if "%NAME%"=="" (
  call npm run container -- --images "%TARGET%" --copy-manifest "%TARGET%" --update-container "%PARENTOF%"
) else (
  call npm run container -- --images "%TARGET%" --name "%NAME%" --copy-manifest "%TARGET%" --update-container "%PARENTOF%"
)
if errorlevel 1 goto :end

:end
popd
echo.
if /I not "%NO_PAUSE%"=="1" pause
endlocal

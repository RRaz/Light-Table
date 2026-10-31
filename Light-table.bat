@echo off
setlocal EnableExtensions
pushd "%~dp0"

rem One entry point: an image folder - images at its top level, optionally with a
rem gallery.json. It is always built as a container in containers\<name>.
rem
rem A container is not an input: drop the image folder inside it instead.
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

rem Find the one subfolder that holds images, to name it in the message.
set "SUBFIRST="
set "SUBCOUNT=0"
for /d %%D in ("%TARGET%\*") do call :maybesub "%%~fD"

echo.
echo Not an image folder: there are no images at the top level of
echo   %TARGET%
echo.
if not "%SUBCOUNT%"=="1" goto :plain
echo That is a container. Drop the image folder inside it instead:
echo   %SUBFIRST%
goto :end

:plain
if exist "%TARGET%\light-table\index.html" goto :containeronly
if exist "%TARGET%\viewer\viewer.html" goto :containeronly
echo Put the image files directly in that folder. Supported types:
echo   jpg jpeg png gif webp avif bmp svg
goto :end

:containeronly
echo That is a container. Drop the image folder inside it instead.
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
goto :eof

rem Counts a subfolder only when it holds images and is not the page or the
rem forward folder.
:maybesub
for %%I in ("%~1") do set "SNAME=%%~nxI"
if /I "%SNAME%"=="light-table" goto :eof
if /I "%SNAME%"=="viewer" goto :eof
set "SUBHAS="
for %%E in (jpg jpeg png gif webp avif bmp svg) do if exist "%~1\*.%%E" set "SUBHAS=1"
if not defined SUBHAS goto :eof
set /a SUBCOUNT+=1
set "SUBFIRST=%~1"
goto :eof

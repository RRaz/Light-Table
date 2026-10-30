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

rem Dropping the image subfolder of a container updates that container.
for %%I in ("%TARGET%\..") do set "PARENT=%%~fI"
if exist "%PARENT%\light-table\index.html" set "TARGET=%PARENT%"
if exist "%PARENT%\viewer\viewer.html" set "TARGET=%PARENT%"

rem A page alone does not make a container: its image folder must carry the same
rem name. A working folder holding a page beside a differently named gallery is
rem not a container, and is handled further down.
for %%I in ("%TARGET%") do set "TNAME=%%~nxI"
set "PAGE="
if exist "%TARGET%\light-table\index.html" set "PAGE=1"
set "MATCH="
if exist "%TARGET%\%TNAME%\" set "MATCH=1"
if defined PAGE if defined MATCH set "ACTION=refresh"
if /I "%ACTION%"=="refresh" goto :guard

rem Loose images at the top level make it a plain image folder, even with a
rem viewer\ folder dropped in: that viewer is carried into the new container.
set "HASIMAGES="
for %%E in (jpg jpeg png gif webp avif bmp svg) do if exist "%TARGET%\*.%%E" set "HASIMAGES=1"

rem If those images are already in containers\<name>, building would replace that
rem very folder. Complete it in place instead.
if defined HASIMAGES if /I "%TARGET%"=="%CD%\containers\%TNAME%" set "ACTION=refresh"
if /I "%ACTION%"=="refresh" goto :guard

rem A legacy container keeps its images in a subfolder, so a viewer marker only
rem counts when nothing is loose and the image folder carries the container name.
if not defined HASIMAGES if defined MATCH if exist "%TARGET%\viewer\viewer.html" set "ACTION=refresh"
if not defined HASIMAGES if defined MATCH if exist "%TARGET%\viewer.html" set "ACTION=refresh"
if /I "%ACTION%"=="refresh" goto :guard

rem One subfolder that holds images: either the container shape (same name) or a
rem working folder holding a gallery under another name. The page and forward
rem folders are ignored when counting.
set "SUBCOUNT=0"
set "SUBFIRST="
for /d %%D in ("%TARGET%\*") do call :maybesub "%%~fD"
if not "%SUBCOUNT%"=="1" goto :guard
if not defined SUBFIRST goto :guard
for %%I in ("%SUBFIRST%") do set "SNAME=%%~nxI"
if /I "%TNAME%"=="%SNAME%" set "ACTION=refresh"
if /I "%ACTION%"=="refresh" goto :guard
if defined HASIMAGES goto :guard

rem Different names: build that gallery under its own name, carrying the forward.
set "CARRY=%TARGET%"
set "TARGET=%SUBFIRST%"
set "NAME=%SNAME%"
echo.
echo "%TNAME%" holds the gallery "%SNAME%": building containers\%SNAME%\.

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
if defined CARRY goto :buildcarry
if "%NAME%"=="" (
  call npm run container -- --images "%TARGET%"
) else (
  call npm run container -- --images "%TARGET%" --name "%NAME%"
)
goto :buildend
:buildcarry
call npm run container -- --images "%TARGET%" --name "%NAME%" --carry-viewer "%CARRY%"
:buildend
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

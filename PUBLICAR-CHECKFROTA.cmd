@echo off
setlocal
set "GIT_CHECKFROTA=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"

if not exist "%GIT_CHECKFROTA%" (
  echo Nao foi possivel localizar o Git do Codex.
  echo Abra o Codex e tente novamente.
  pause
  exit /b 1
)

echo.
echo Publicando CheckFrota no GitHub...
"%GIT_CHECKFROTA%" -C "%~dp0" push origin main

if errorlevel 1 (
  echo.
  echo A publicacao nao foi concluida. Se for solicitado, entre na sua conta do GitHub no navegador.
  pause
  exit /b 1
)

echo.
echo Publicacao enviada. O GitHub atualizara o aplicativo automaticamente em alguns minutos.
pause


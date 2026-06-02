@echo off
chcp 65001 >nul
echo.
echo ============================
echo   一键推送网站到 GitHub
echo ============================
echo.

cd /d "C:\Users\85407\Desktop\travelling-english"

set "GIT=C:\Users\85407\AppData\Local\GitHubDesktop\app-3.5.11\resources\app\git\cmd\git.exe"

if not exist "%GIT%" (
    echo [错误] 找不到 git.exe，请确认 GitHub Desktop 已安装
    pause
    exit /b 1
)

echo [1/4] 添加所有修改...
"%GIT%" add .

echo [2/4] 提交更新...
"%GIT%" commit -m "update: %date% %time%"
if %errorlevel% neq 0 (
    echo [提示] 没有新的修改需要提交，或提交失败
)

echo [3/4] 推送到 GitHub...
"%GIT%" push origin main
if %errorlevel% neq 0 (
    echo [提示] push 失败，尝试 push 到 master 分支...
    "%GIT%" push origin master
)

echo [4/4] 完成！
echo.
echo ============================
echo   网站已更新，稍等1-2分钟后刷新：
echo.
echo   学生页：
echo   https://wayland123456.github.io/english-learning/
echo.
echo   教师监测页：
echo   https://wayland123456.github.io/english-learning/teacher.html
echo ============================
echo.
pause

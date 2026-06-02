@echo off
chcp 65001 >nul
echo.
echo ============================
echo  更新网站到 GitHub
echo ============================
echo.

cd /d "C:\Users\85407\Desktop\travelling-english"

echo [1/3] 准备文件...
git add .

echo [2/3] 提交更新...
git commit -m "更新网站 %date% %time%"

echo [3/3] 推送到 GitHub...
git push origin main

echo.
echo ============================
echo  完成！稍等1-2分钟刷新网页：
echo.
echo  学生页：
echo  https://wayland123456.github.io/english-learning/
echo.
echo  教师监测页：
echo  https://wayland123456.github.io/english-learning/teacher.html
echo ============================
echo.
pause

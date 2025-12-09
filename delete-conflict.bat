@echo off
cd /d "d:\Java\jobapp\my-app\src\app\profile"
rd /s /q "[[...user_profile]]"
if exist "[[...user_profile]]" (
    echo Failed to delete directory
    exit /b 1
) else (
    echo Successfully deleted conflicting route directory
    exit /b 0
)

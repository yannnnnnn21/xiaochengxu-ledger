@echo off
cd /d "%~dp0"
if exist ".maven-settings.xml" (
  call mvn -s ".maven-settings.xml" spring-boot:run
) else (
  call mvn spring-boot:run
)
pause


$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

if (Test-Path ".maven-settings.xml") {
    & mvn -s ".maven-settings.xml" spring-boot:run
} else {
    & mvn spring-boot:run
}

exit $LASTEXITCODE


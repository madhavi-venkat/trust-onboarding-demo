@REM Maven Wrapper - runs the wrapper JAR with JAVA_HOME or java on PATH
@echo off
setlocal

set WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

if defined JAVA_HOME (
    set JAVA_CMD="%JAVA_HOME%\bin\java.exe"
) else (
    set JAVA_CMD=java
)

%JAVA_CMD% -jar "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%~dp0" %*

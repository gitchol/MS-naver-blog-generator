@echo off
chcp 65001 >nul
echo.
echo 🚀 네이버 블로그 콘텐츠 생성기 환경 변수 설정
echo ==================================================
echo.

REM 현재 디렉토리 확인
if not exist "package.json" (
    echo ❌ 오류: blog-generator 프로젝트 디렉토리에서 실행해주세요.
    echo 현재 위치: %CD%
    echo 올바른 위치: ...\blog-generator\
    pause
    exit /b 1
)

REM .env.local 파일 존재 확인
if exist ".env.local" (
    echo ⚠️  .env.local 파일이 이미 존재합니다.
    echo 기존 내용:
    type .env.local
    echo.
    set /p "overwrite=덮어쓸까요? (y/N): "
    if /i not "%overwrite%"=="y" (
        echo ❌ 설정이 취소되었습니다.
        pause
        exit /b 1
    )
)

REM API 키 입력 안내
echo 📝 Google Gemini API 키를 입력해주세요:
echo    1. https://makersuite.google.com/app/apikey 에서 API 키 발급
echo    2. 생성된 API 키를 복사하여 아래에 붙여넣기
echo.
set /p "api_key=API 키 입력: "

REM 입력 검증
if "%api_key%"=="" (
    echo ❌ API 키가 입력되지 않았습니다.
    pause
    exit /b 1
)

REM API 키 형식 간단 검증
echo %api_key% | findstr /r "^AIza" >nul
if errorlevel 1 (
    echo ⚠️  API 키 형식이 올바르지 않을 수 있습니다.
    echo Google Gemini API 키는 보통 'AIza'로 시작합니다.
    set /p "continue=계속 진행하시겠습니까? (y/N): "
    if /i not "%continue%"=="y" (
        echo ❌ 설정이 취소되었습니다.
        pause
        exit /b 1
    )
)

REM .env.local 파일 생성
echo GEMINI_API_KEY=%api_key% > .env.local

echo.
echo ✅ 환경 변수 설정이 완료되었습니다!
echo 📁 생성된 파일: .env.local
echo.
echo 다음 단계:
echo 1. 개발 서버 실행: npm run dev
echo 2. 브라우저에서 http://localhost:3000 접속
echo 3. 콘텐츠 생성 테스트
echo.
echo ⚠️  보안 주의사항:
echo - .env.local 파일은 Git에 업로드되지 않습니다
echo - API 키를 다른 사람과 공유하지 마세요
echo - 공개 저장소에 API 키를 업로드하지 마세요
echo.
pause 
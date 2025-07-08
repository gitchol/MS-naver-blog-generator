#!/bin/bash

# 네이버 블로그 콘텐츠 생성기 환경 변수 설정 스크립트

echo "🚀 네이버 블로그 콘텐츠 생성기 환경 변수 설정"
echo "=================================================="
echo

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
    echo "❌ 오류: blog-generator 프로젝트 디렉토리에서 실행해주세요."
    echo "현재 위치: $(pwd)"
    echo "올바른 위치: .../blog-generator/"
    exit 1
fi

# .env.local 파일 존재 확인
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local 파일이 이미 존재합니다."
    echo "기존 내용:"
    cat .env.local
    echo
    read -p "덮어쓸까요? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 설정이 취소되었습니다."
        exit 1
    fi
fi

# API 키 입력 안내
echo "📝 Google Gemini API 키를 입력해주세요:"
echo "   1. https://makersuite.google.com/app/apikey 에서 API 키 발급"
echo "   2. 생성된 API 키를 복사하여 아래에 붙여넣기"
echo
read -p "API 키 입력: " api_key

# 입력 검증
if [ -z "$api_key" ]; then
    echo "❌ API 키가 입력되지 않았습니다."
    exit 1
fi

# API 키 형식 간단 검증
if [[ ! $api_key =~ ^AIza[A-Za-z0-9_-]+$ ]]; then
    echo "⚠️  API 키 형식이 올바르지 않을 수 있습니다."
    echo "Google Gemini API 키는 보통 'AIza'로 시작합니다."
    read -p "계속 진행하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 설정이 취소되었습니다."
        exit 1
    fi
fi

# .env.local 파일 생성
echo "GEMINI_API_KEY=$api_key" > .env.local

echo "✅ 환경 변수 설정이 완료되었습니다!"
echo "📁 생성된 파일: .env.local"
echo
echo "다음 단계:"
echo "1. 개발 서버 실행: npm run dev"
echo "2. 브라우저에서 http://localhost:3000 접속"
echo "3. 콘텐츠 생성 테스트"
echo
echo "⚠️  보안 주의사항:"
echo "- .env.local 파일은 Git에 업로드되지 않습니다"
echo "- API 키를 다른 사람과 공유하지 마세요"
echo "- 공개 저장소에 API 키를 업로드하지 마세요" 
# 네이버 블로그 콘텐츠 생성기 (Naver Blog Content Generator)

한국의 예술/디자인 유학 전문 학원을 위한 SEO 최적화 블로그 콘텐츠 자동 생성 도구입니다.

## 🚀 주요 기능

### 📝 콘텐츠 타입
- **🎓 전문글**: 전문가 수준의 깊이 있는 분석과 실무 경험
- **❓ Q&A 형식**: 독자들이 자주 묻는 질문에 대한 실용적 답변
- **🎨 일반 예술 콘텐츠**: 친근한 스토리텔링 형식

### 🎯 SEO 최적화
- **키워드 중심 문장 재배치**: 서두/중간/결론 부분에 키워드 반복 배치
- **100+ 키워드 데이터베이스**: 8개 주요 카테고리별 전문 키워드
- **키워드 밸런스 스코어링**: A-C 등급 자동 평가 시스템

### 🏫 학원 마케팅 특화
- **실제 합격 사례** 및 성공률 데이터 언급
- **차별화된 커리큘럼** 강조
- **개인별 맞춤 지도** 방식 어필
- **전문 강사진** 실무 경험 부각

## 🛠️ 기술 스택

- **Frontend**: Next.js 15.3.4, TypeScript, Tailwind CSS
- **AI**: Google Gemini 1.5-flash API
- **Deployment**: Railway (권장)

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/[YOUR_USERNAME]/naver-blog-generator.git
cd naver-blog-generator
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Gemini API 키 발급**: [Google AI Studio](https://makersuite.google.com/app/apikey)

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 🎮 사용 방법

1. **카테고리 선택**: 다중 선택 가능 (아이비리그, 디자인, 유학 등)
2. **키워드 선택**: 최소 3개 이상 선택 (균형잡힌 조합 권장)
3. **글 유형 선택**: 전문글/Q&A/일반 중 선택
4. **주제 입력**: 구체적인 블로그 주제 작성
5. **콘텐츠 생성**: AI가 SEO 최적화된 콘텐츠 자동 생성
6. **네이버 블로그용 복사**: 원클릭으로 네이버 블로그 포맷으로 복사

## 📊 키워드 카테고리

- **상위 키워드**: 일반적인 유학 관련 키워드
- **건축**: 건축학과 관련 전문 용어
- **아이비리그**: 명문대학 관련 키워드
- **아트스쿨**: 예술 전문 학교 관련
- **디자인**: 디자인 분야 전문 용어
- **유학 및 컨설팅**: 유학 준비 관련
- **파인아트**: 순수 예술 관련
- **패션**: 패션 디자인 관련

## 🎯 추천 키워드 조합

시스템이 자동으로 12가지 검증된 키워드 조합을 제공하며, 각 조합은 다음과 같은 이점을 제공:
- **높은 검색량**: 많은 사람들이 검색하는 키워드
- **전문성**: 전문적인 정보를 찾는 사용자 타겟
- **틈새 시장**: 경쟁이 적은 특화 키워드

## 🚀 배포 (Railway)

### 1. Railway 계정 생성
[Railway](https://railway.app)에서 계정 생성

### 2. GitHub 연결
Railway에서 GitHub 저장소 연결

### 3. 환경 변수 설정
Railway 대시보드에서 환경 변수 추가:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. 자동 배포
GitHub에 푸시하면 자동으로 배포됩니다.

## 📁 프로젝트 구조

```
blog-generator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts          # AI 콘텐츠 생성 API
│   │   ├── globals.css               # 전역 스타일
│   │   ├── layout.tsx                # 레이아웃 컴포넌트
│   │   └── page.tsx                  # 메인 페이지
│   └── ...
├── public/                           # 정적 파일
├── .env.local                        # 환경 변수 (git 제외)
├── package.json                      # 프로젝트 설정
└── README.md                         # 프로젝트 문서
```

## 🔧 개발 참고사항

### API 엔드포인트
- `POST /api/generate`: 콘텐츠 생성 API
  - 요청: `{ prompt, category, keywords, contentType }`
  - 응답: `{ title, paragraph1, paragraph2, paragraph3, images, hashtags }`

### 콘텐츠 타입별 특징
- **전문글**: 1200자 이내, 전문가 톤, 핵심 요약 박스 포함
- **Q&A**: 1500자 이내, 친근한 톤, 3가지 핵심 질문
- **일반**: 1000자 이내, 친구 같은 톤, 이모지 활용

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

문제가 발생하거나 질문이 있으시면 Issues 탭에서 문의해주세요.

---

**Made with ❤️ for Korean Art Education Marketing**

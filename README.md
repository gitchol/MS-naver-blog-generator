# 네이버 블로그 콘텐츠 생성기 (Naver Blog Content Generator)

한국의 예술/디자인 유학 전문 학원을 위한 SEO 최적화 블로그 콘텐츠 자동 생성 도구입니다.

## 🚀 주요 기능

### 📝 콘텐츠 타입
- **🎓 전문글**: 전문가 수준의 깊이 있는 분석과 실무 경험
- **❓ Q&A 형식**: 독자들이 자주 묻는 질문에 대한 실용적 질문과 응답 형식
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

### 3. 환경 변수 설정 ⚠️ **중요**

**방법 1: 자동 설정 스크립트 사용 (권장)**

**Mac/Linux:**
```bash
cd blog-generator
chmod +x setup-env.sh
./setup-env.sh
```

**Windows:**
```cmd
cd blog-generator
setup-env.bat
```

**방법 2: 수동 설정**

**3-1. Google Gemini API 키 발급**
1. [Google AI Studio](https://makersuite.google.com/app/apikey)에 접속
2. Google 계정으로 로그인
3. "Create API Key" 버튼 클릭
4. 생성된 API 키 복사 (예: `AIzaSyAbc123...`)

**3-2. 환경 변수 파일 생성**
프로젝트 루트 디렉토리(`blog-generator/`)에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**실제 예시:**
```env
GEMINI_API_KEY=AIzaSyAbc123defghijklmnopqrstuvwxyz
```

**⚠️ 주의사항:**
- `.env.local` 파일은 **반드시 `blog-generator/` 디렉토리 바로 아래**에 생성해야 합니다
- API 키는 **절대로 GitHub에 업로드하지 마세요**
- API 키에 `your_gemini_api_key_here` 부분을 **실제 발급받은 키로 교체**해야 합니다

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 🐛 문제 해결

### 환경 변수 관련 오류
**증상:** 검은 화면 또는 "GEMINI_API_KEY가 설정되지 않았습니다" 오류

**해결 방법:**
1. **파일 위치 확인**: `.env.local` 파일이 `blog-generator/` 디렉토리에 있는지 확인
2. **API 키 확인**: 발급받은 실제 API 키를 정확히 입력했는지 확인
3. **개발 서버 재시작**: 환경 변수 변경 후 `npm run dev` 명령어로 서버 재시작
4. **파일 형식 확인**: 파일 확장자가 `.env.local`인지 확인 (`.env.local.txt` 아님)

### API 키 인증 오류
**증상:** "API 키가 유효하지 않습니다" 오류

**해결 방법:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 새 API 키 발급
2. 기존 API 키가 만료되었는지 확인
3. API 키 복사 시 앞뒤 공백이 들어가지 않았는지 확인

### 네트워크 연결 오류
**증상:** "AI 서비스 연결에 실패했습니다" 오류

**해결 방법:**
1. 인터넷 연결 상태 확인
2. 브라우저 새로고침 후 다시 시도
3. 잠시 후 다시 시도 (API 사용 한도 초과 가능성)

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

## 🧠 AI 학습 기능

### 개요
AI가 기존 블로그 컨텐츠를 학습하여 개인화된 글쓰기 스타일을 모방할 수 있는 기능입니다.

### 사용 방법

#### 1. 🤖 자동 학습 방법 (권장)
**백엔드 데이터 창고에 대량 업로드**
1. 커서(Cursor)에서 `src/data/bulk-training-data.csv` 파일을 엽니다
2. 다음 형식으로 데이터를 추가합니다:
   ```csv
   제목,본문,카테고리,콘텐츠타입
   "블로그 제목","블로그 본문 내용...","상위 키워드","general"
   "두 번째 제목","두 번째 본문...","건축","professional"
   ```
3. 파일을 저장하고 개발 서버를 재시작하면 자동으로 학습됩니다
4. 웹 인터페이스에서 "CSV 재학습" 버튼으로 수동 재학습 가능

#### 2. 📝 수기 입력 방법
1. 메인 페이지에서 "기존 글 학습하기" 버튼 클릭
2. 블로그 제목과 본문을 입력
3. "목록에 추가" 버튼으로 학습 목록에 추가
4. 여러 개의 블로그 추가 후 "학습시키기" 버튼 클릭

#### 3. 📄 CSV 파일 업로드 방법
1. 엑셀에서 데이터 작성:
   ```csv
   제목,본문
   첫 번째 블로그 제목,첫 번째 블로그 본문 내용...
   두 번째 블로그 제목,두 번째 블로그 본문 내용...
   ```
2. CSV 파일로 저장 (UTF-8 인코딩)
3. "CSV 파일로 일괄 업로드" 에서 파일 선택
4. 자동으로 목록에 추가됨
5. "학습시키기" 버튼 클릭

#### 3. 학습 데이터 분석
AI가 분석하는 요소들:
- **어조**: 친근한 vs 전문적인 vs 일반적인
- **문단 구조**: 다문단 구조 vs 단순 구조  
- **문장 길이**: 긴 문장 위주 vs 짧은 문장 위주
- **감정 표현**: 감정적인 vs 중립적인
- **공통 표현**: 자주 사용하는 문구와 패턴

#### 4. 개인화된 콘텐츠 생성
학습 후 생성되는 콘텐츠 특징:
- 기존 글의 스타일과 어조 모방
- 자주 사용하는 표현 패턴 활용
- 개인화된 감정 표현 방식
- 일관된 문단 구조와 문장 길이

### API 엔드포인트
- `POST /api/training/upload`: 수동 학습 데이터 업로드
- `GET /api/training/upload`: 수동 학습 데이터 조회
- `GET /api/training/status`: 자동 학습 상태 확인
- `POST /api/training/status`: 자동 학습 수동 실행

### 데이터 저장 위치
- `blog-generator/src/data/training-data.json`: 통합 학습 데이터 저장
- `blog-generator/src/data/bulk-training-data.csv`: 자동 학습용 CSV 파일 (대량 업로드)

### 트러블슈팅
- **CSV 업로드 실패**: "제목"과 "본문" 컬럼이 있는지 확인
- **인코딩 오류**: CSV 파일을 UTF-8로 저장
- **특수문자 오류**: 따옴표(")가 있다면 이스케이프 처리

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

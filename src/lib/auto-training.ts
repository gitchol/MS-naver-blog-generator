import fs from 'fs';
import path from 'path';

interface BlogContent {
  id: number;
  title: string;
  content: string;
  category?: string;
  subcategory?: string;
  keywords?: string[];
  contentType?: string;
  writingStyle?: {
    tone?: string;
    paragraphStructure?: string;
    sentenceLength?: string;
    emotionalTone?: string;
    promotionalLevel?: string;
  };
  createdAt: string;
}

interface TrainingData {
  blogs: BlogContent[];
  learningPatterns: {
    commonPhrases: string[];
    writingPatterns: string[];
    toneAnalysis: Record<string, unknown>;
    structureAnalysis: Record<string, unknown>;
  };
}

// 파일 경로 설정
const TRAINING_DATA_PATH = path.join(process.cwd(), 'src/data/training-data.json');
const BULK_CSV_PATH = path.join(process.cwd(), 'src/data/bulk-training-data.csv');

// 텍스트 정리 함수
function cleanText(text: string): string {
  return text
    // HTML 태그 제거
    .replace(/<[^>]*>/g, '')
    // HTML 엔티티 디코딩
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // 연속된 공백을 하나로 통합
    .replace(/\s+/g, ' ')
    // 연속된 줄바꿈을 최대 2개로 제한 (문단 구분용)
    .replace(/\n{3,}/g, '\n\n')
    // 탭 문자를 공백으로 변환
    .replace(/\t/g, ' ')
    // 앞뒤 공백 제거
    .trim()
    // 문장 끝 공백 정리 (. ! ? 뒤의 과도한 공백)
    .replace(/([.!?])\s{2,}/g, '$1 ')
    // 쉼표, 세미콜론 뒤 공백 정리
    .replace(/([,;])\s{2,}/g, '$1 ')
    // 괄호 안팎 공백 정리
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    // 따옴표 안팎 공백 정리
    .replace(/"\s+/g, '"')
    .replace(/\s+"/g, '"')
    // 마지막에 한 번 더 전체 공백 정리
    .replace(/\s+/g, ' ')
    .trim();
}

// 텍스트 분석 함수들
function analyzeWritingStyle(content: string) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length : 0;
  
  // 어조 분석
  const friendlyWords = ['여러분', '안녕', '함께', '도움', '응원', '화이팅'];
  const professionalWords = ['전문', '분석', '연구', '데이터', '결과', '효과'];
  const emotionalWords = ['감동', '기쁘', '놀라', '걱정', '설레', '힘들'];
  
  const friendlyCount = friendlyWords.reduce((count, word) => 
    count + (content.match(new RegExp(word, 'g')) || []).length, 0);
  const professionalCount = professionalWords.reduce((count, word) => 
    count + (content.match(new RegExp(word, 'g')) || []).length, 0);
  const emotionalCount = emotionalWords.reduce((count, word) => 
    count + (content.match(new RegExp(word, 'g')) || []).length, 0);
  
  return {
    avgSentenceLength,
    friendlyTone: friendlyCount > 2,
    professionalTone: professionalCount > 2,
    emotionalTone: emotionalCount > 1,
    paragraphCount: content.split('\n\n').length,
    sentenceCount: sentences.length
  };
}

function extractCommonPhrases(content: string): string[] {
  const phrases = [];
  const commonPatterns = [
    /여러분[은이]?\s+[^.!?]*[.!?]/g,
    /오늘[은이]?\s+[^.!?]*[.!?]/g,
    /정말[로]?\s+[^.!?]*[.!?]/g,
    /그래서\s+[^.!?]*[.!?]/g,
    /하지만\s+[^.!?]*[.!?]/g,
    /따라서\s+[^.!?]*[.!?]/g
  ];
  
  for (const pattern of commonPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      phrases.push(...matches);
    }
  }
  
  return phrases;
}

// 기존 학습 데이터 읽기
function readTrainingData(): TrainingData {
  try {
    if (fs.existsSync(TRAINING_DATA_PATH)) {
      const data = fs.readFileSync(TRAINING_DATA_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading training data:', error);
  }
  
  return {
    blogs: [],
    learningPatterns: {
      commonPhrases: [],
      writingPatterns: [],
      toneAnalysis: {},
      structureAnalysis: {}
    }
  };
}

// 학습 데이터 저장
function saveTrainingData(data: TrainingData): void {
  try {
    const dir = path.dirname(TRAINING_DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TRAINING_DATA_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving training data:', error);
    throw error;
  }
}

// CSV 파일 파싱
function parseCsvFile(filePath: string): Array<{title: string, content: string, category?: string, contentType?: string}> {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`CSV 파일이 존재하지 않습니다: ${filePath}`);
      return [];
    }

    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      console.log('CSV 파일에 데이터가 없습니다.');
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // 헤더 인덱스 찾기
    const titleIndex = headers.findIndex(h => 
      h.toLowerCase().includes('제목') || h.toLowerCase().includes('title')
    );
    const contentIndex = headers.findIndex(h => 
      h.toLowerCase().includes('본문') || h.toLowerCase().includes('content') || h.toLowerCase().includes('내용')
    );
    const categoryIndex = headers.findIndex(h => 
      h.toLowerCase().includes('카테고리') || h.toLowerCase().includes('category')
    );
    const contentTypeIndex = headers.findIndex(h => 
      h.toLowerCase().includes('콘텐츠타입') || h.toLowerCase().includes('contenttype') || h.toLowerCase().includes('type')
    );
    
    if (titleIndex === -1 || contentIndex === -1) {
      console.error('CSV 파일에 "제목"과 "본문" 컬럼이 필요합니다.');
      return [];
    }

    const blogs: Array<{title: string, content: string, category?: string, contentType?: string}> = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // CSV 파싱 (간단한 방식, 따옴표 내 쉼표 처리)
      const columns = parseCsvLine(line);
      
              if (columns.length > Math.max(titleIndex, contentIndex)) {
          const rawTitle = columns[titleIndex]?.trim().replace(/^"|"$/g, '');
          const rawContent = columns[contentIndex]?.trim().replace(/^"|"$/g, '');
          const category = categoryIndex >= 0 ? columns[categoryIndex]?.trim().replace(/^"|"$/g, '') : undefined;
          const contentType = contentTypeIndex >= 0 ? columns[contentTypeIndex]?.trim().replace(/^"|"$/g, '') : undefined;
          
          if (rawTitle && rawContent) {
            // 텍스트 정리 적용
            const title = cleanText(rawTitle);
            const content = cleanText(rawContent);
            
            // 정리 후에도 유효한 데이터인지 확인
            if (title.length > 0 && content.length > 10) {
              blogs.push({ title, content, category, contentType });
            }
          }
        }
    }

    return blogs;
  } catch (error) {
    console.error('CSV 파일 파싱 오류:', error);
    return [];
  }
}

// CSV 라인 파싱 (따옴표 내 쉼표 처리)
function parseCsvLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// 자동 학습 실행
export async function initializeAutoTraining(): Promise<void> {
  try {
    console.log('🧠 자동 학습 시스템 초기화 중...');
    
    // 기존 학습 데이터 읽기
    const trainingData = readTrainingData();
    const existingBlogCount = trainingData.blogs.length;
    
    // CSV 파일에서 새로운 데이터 읽기
    const csvBlogs = parseCsvFile(BULK_CSV_PATH);
    
    if (csvBlogs.length === 0) {
      console.log('📄 새로운 학습 데이터가 없습니다.');
      return;
    }
    
    // 중복 체크 (제목 기준)
    const existingTitles = new Set(trainingData.blogs.map(blog => blog.title));
    const newBlogs = csvBlogs.filter(blog => !existingTitles.has(blog.title));
    
    if (newBlogs.length === 0) {
      console.log('📄 모든 CSV 데이터가 이미 학습되었습니다.');
      return;
    }
    
    console.log(`📚 ${newBlogs.length}개의 새로운 블로그 데이터를 학습합니다...`);
    
    // 새로운 블로그 데이터 처리
    const processedBlogs: BlogContent[] = newBlogs.map((blog, index) => {
      const blogId = trainingData.blogs.length + index + 1;
      const writingStyle = analyzeWritingStyle(blog.content);
      const commonPhrases = extractCommonPhrases(blog.content);
      
      // 공통 표현 업데이트
      trainingData.learningPatterns.commonPhrases = [
        ...trainingData.learningPatterns.commonPhrases,
        ...commonPhrases
      ];
      
      return {
        id: blogId,
        title: blog.title,
        content: blog.content,
        category: blog.category || '기타',
        subcategory: '일반',
        keywords: [],
        contentType: blog.contentType || 'general',
        writingStyle: {
          tone: writingStyle.friendlyTone ? '친근한' : writingStyle.professionalTone ? '전문적인' : '일반적인',
          paragraphStructure: writingStyle.paragraphCount > 3 ? '다문단 구조' : '단순 구조',
          sentenceLength: writingStyle.avgSentenceLength > 50 ? '긴 문장 위주' : '짧은 문장 위주',
          emotionalTone: writingStyle.emotionalTone ? '감정적인' : '중립적인',
          promotionalLevel: '자연스러운'
        },
        createdAt: new Date().toISOString()
      };
    });
    
    // 학습 데이터 업데이트
    trainingData.blogs = [...trainingData.blogs, ...processedBlogs];
    
    // 학습 패턴 분석 업데이트
    const allContent = trainingData.blogs.map(blog => blog.content).join(' ');
    trainingData.learningPatterns.writingPatterns = extractCommonPhrases(allContent);
    
    // 저장
    saveTrainingData(trainingData);
    
    console.log(`✅ 자동 학습 완료! 총 ${trainingData.blogs.length}개 블로그 학습됨 (신규: ${newBlogs.length}개)`);
    
  } catch (error) {
    console.error('❌ 자동 학습 오류:', error);
  }
}

// 학습 상태 확인
export function getTrainingStatus(): {totalBlogs: number, lastUpdate: string} {
  try {
    const trainingData = readTrainingData();
    const lastUpdate = trainingData.blogs.length > 0 
      ? trainingData.blogs[trainingData.blogs.length - 1].createdAt 
      : 'Never';
    
    return {
      totalBlogs: trainingData.blogs.length,
      lastUpdate
    };
  } catch (error) {
    console.error('학습 상태 확인 오류:', error);
    return {
      totalBlogs: 0,
      lastUpdate: 'Error'
    };
  }
} 
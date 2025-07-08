import { NextRequest, NextResponse } from 'next/server';
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

// 학습 데이터 파일 경로
const TRAINING_DATA_PATH = path.join(process.cwd(), 'src/data/training-data.json');

// 학습 데이터 읽기
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
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  
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
  // 자주 사용되는 표현 추출
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

// POST: 블로그 컨텐츠 업로드
export async function POST(request: NextRequest) {
  try {
    const { blogs } = await request.json();
    
    if (!Array.isArray(blogs) || blogs.length === 0) {
      return NextResponse.json({ 
        error: '블로그 데이터가 유효하지 않습니다.' 
      }, { status: 400 });
    }
    
    // 기존 학습 데이터 읽기
    const trainingData = readTrainingData();
    
    // 새로운 블로그 데이터 처리
    const newBlogs: BlogContent[] = blogs.map((blog: { title?: string; content: string; category?: string; subcategory?: string; keywords?: string[]; contentType?: string }, index: number) => {
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
        title: cleanText(blog.title || `블로그 ${blogId}`),
        content: cleanText(blog.content),
        category: blog.category || '기타',
        subcategory: blog.subcategory || '일반',
        keywords: blog.keywords || [],
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
    trainingData.blogs = [...trainingData.blogs, ...newBlogs];
    
    // 학습 패턴 분석 업데이트
    const allContent = trainingData.blogs.map(blog => blog.content).join(' ');
    trainingData.learningPatterns.writingPatterns = extractCommonPhrases(allContent);
    
    // 저장
    saveTrainingData(trainingData);
    
    return NextResponse.json({
      success: true,
      message: `${newBlogs.length}개의 블로그 컨텐츠가 성공적으로 업로드되었습니다.`,
      totalBlogs: trainingData.blogs.length,
      newBlogs: newBlogs.length
    });
    
  } catch (error) {
    console.error('Training data upload error:', error);
    return NextResponse.json({ 
      error: '학습 데이터 업로드 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}

// GET: 학습 데이터 조회
export async function GET() {
  try {
    const trainingData = readTrainingData();
    
    return NextResponse.json({
      totalBlogs: trainingData.blogs.length,
      blogs: trainingData.blogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        category: blog.category,
        contentType: blog.contentType,
        createdAt: blog.createdAt
      })),
      learningPatterns: trainingData.learningPatterns
    });
    
  } catch (error) {
    console.error('Training data retrieval error:', error);
    return NextResponse.json({ 
      error: '학습 데이터 조회 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 
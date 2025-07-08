'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface StructuredContent {
  title: string;
  content: {
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
  };
  images: Array<{
    name: string;
    description: string;
  }>;
  hashtags: string[];
}

export default function Home() {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedContentType, setSelectedContentType] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | StructuredContent>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    images: string[];
    hashtags: string[];
  } | null>(null);

  // --- UI Enhancements ---
  const [promptPlaceholder, setPromptPlaceholder] = useState('카테고리, 키워드(3개), 글 유형을 먼저 선택해주세요');
  const [showRecommendedCombos, setShowRecommendedCombos] = useState(true);
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // --- Training Management ---
  const [showTrainingPanel, setShowTrainingPanel] = useState(false);
  const [trainingData, setTrainingData] = useState<{totalBlogs: number} | null>(null);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [trainingBlogs, setTrainingBlogs] = useState<Array<{title: string, content: string}>>([]);
  const [autoTrainingStatus, setAutoTrainingStatus] = useState<{totalBlogs: number, lastUpdate: string} | null>(null);
  const [isRefreshingAutoTraining, setIsRefreshingAutoTraining] = useState(false);

  const keywordHierarchy = {
    '상위 키워드': {
      keywords: ['포트폴리오 컨셉', '미국미술유학', '미대 석사 유학', 'GRE 미대석사', '미국대학 편입 과제', '미국 대학 편입 합격', '듀오링고 받는 미국 아트스쿨', '아트 서플리먼트', '비전공자 유학', '코넬 써머']
    },
    '건축': {
      keywords: ['건축 다이어그램', '건축 컨셉', '건축 대학원 유학', '건축 사이트 다이어그램', '건축 유학 포트폴리오', '건축대학원 유학', '미국 건축 대학원', '건축유학원', '건축 유학', '건축대학원 포트폴리오', '비전공자 건축 유학', '건축 포트폴리오 학원', '미국으로 건축 유학가기', '비전공자 건축유학', '건축 유학원', '미국 건축학교 포트폴리오', '건축유학 GSD 준비', '건축에서 컨셉이란', '건축과 포트폴리오 유학준비', '비전공자 건축대학원', '건축학 대학원 유학', '미국 비전공 건축 석사', '건축유학 포트폴리오', '건축 대학원 포트폴리오', 'OMA 건축', 'OMA 박물관']
    },
    '아이비리그': {
      keywords: ['하버드 GSD', '하버드 건축', 'GSAPP', '예일대학교 대학원', '하버드 건축대학원유학포트폴리오', '예일대학교 미술대학원', '컬럼비아 건축 대학원 비전공자', '하버드 GSD 건축', '코넬 패션 메니지먼트', '예일대학원 미술', '아이비리그 건축 대학원', '아이비리그 미대 입시 컨설팅', '하버드 건축학과', '하버드건축대학원 졸업', '하버드 대학원', '예일 미술대학원', '예일대 미술대학원', '코넬대학교 미술', '컬럼비아 대학 대학원', 'GSD 뜻']
    },
    '아트스쿨': {
      keywords: ['리즈디대학', 'RISD', '리즈디 대학', '파슨스', 'SVA', 'CalArts', 'SCAD', 'Art Center', 'Pratt', 'FIT', 'MICA MFA', '미국 미대 편입', '미국 미술대학 듀오링고', 'SCAD brand fashion management', '파슨스 STEM', '듀오링고미국미술대학', 'TISH 포트폴리오', '와세다 대학교 미대', '일본 파슨스', 'UAL CSM Chelsea LCC Wimbledon 순위']
    },
    '디자인': {
      keywords: ['그래픽 디자인', '산업 디자인', 'UX/UI 디자인', '브랜딩', '타이포그래피', '웹 디자인', '디자인 포트폴리오', '시각 디자인', '제품 디자인', '디지털 디자인', '미국디자인취업', '미디어아트 유학']
    },
    '유학 및 컨설팅': {
      keywords: ['마인드스페이스', '마인드스페이스 유학미술', '마인드스페이스 유학미술학원', '마인드스페이스 유학원', '압구정 유학미술', '마인드스페이스 건축', '국제학교 미술학원', '압구정 유학미술국제대회', '마인드스페이스 미술유학', '마인드스페이스 유학', '신사동 마인드스페이스', '마인드스페이스유학미술학원', '스페이스마인드 미술유학원', '마인드.스페이스', '아이비리그 미대 입시 컨설팅', '미술유학원압구정마인드스페이스', '마인드스페이스 예비반']
    },
    '파인아트': {
      keywords: ['국제학교 미술', 'IB Art', 'IB 미술', 'IB Visual Art', '미디어아트 유학', '미국미술유학', '예일대 미술대학원', '국제학교 미술전공', '미술 국제학교', '아트 서플리먼트', '미대 석사 유학', '코넬대학교 미술', '국제학교 미술학원 포트폴리오 초등', 'TISH 포트폴리오', '회화', '조각', '판화', '사진', '설치미술', '퍼포먼스', '드로잉', '미술사', '순수 미술', '현대 미술', 'MFA 과정', '노상호 작가 눈사람', 'AES+F']
    },
    '패션': {
      keywords: ['코넬 패션 메니지먼트', '패션 석사 유학', 'SCAD brand fashion management', '패션 디자인', '패션 일러스트', '패턴 메이킹', '텍스타일', '패션 스타일링', '패션 마케팅', '패션 유학', '패션스쿨', '의상학과', 'FIT 패션', '패션 포트폴리오', '패션 트렌드', '패션 브랜딩', '패션 비즈니스', '럭셔리 패션', '패션 머천다이징', '패션 저널리즘']
    }
  };

  const categories = Object.keys(keywordHierarchy);

  // Content types based on PRD requirements
  const contentTypes = [
    {
      id: 'professional',
      name: '전공별 전문글',
      description: '깊이 있는 전문 지식과 실무 경험을 담은 전문성 높은 콘텐츠',
      icon: '🎓',
      benefits: ['전문성 강화', '신뢰도 향상', '전문가 포지셔닝'],
      format: 'In-depth 분석형'
    },
    {
      id: 'qna',
      name: 'Q&A 형식',
      description: '자주 묻는 질문과 명확한 답변으로 구성된 실용적 콘텐츠',
      icon: '❓',
      benefits: ['높은 검색성', '사용자 친화적', '즉시 활용 가능'],
      format: '질문-답변 구조'
    },
    {
      id: 'general',
      name: '일반 예술 콘텐츠',
      description: '폭넓은 독자층을 대상으로 한 접근하기 쉬운 예술 정보',
      icon: '🎨',
      benefits: ['광범위한 매력', '높은 공유율', 'SEO 친화적'],
      format: '스토리텔링형'
    }
  ];

  // Keyword metadata for guidance
  const keywordMeta = {
    // High-impact keywords (top 10)
    'trending': ['마인드스페이스', '건축 다이어그램', '건축 컨셉', '하버드 GSD', '리즈디대학'],
    // Professional/specific keywords
    'expert': ['GSAPP', 'GSD 뜻', 'OMA 건축', 'MICA MFA', 'TISH 포트폴리오', 'IB Visual Art'],
    // Niche/specialized keywords  
    'niche': ['노상호 작가 눈사람', 'AES+F', 'UAL CSM Chelsea LCC Wimbledon 순위', '그리스 나사형모양 기둥은 무엇입니까'],
    // Broad appeal keywords
    'popular': ['미국미술유학', '포트폴리오 컨셉', '건축 유학', '아이비리그 입학', '패션 디자인']
  };

  // Recommended keyword combinations with content types - using useMemo to prevent re-renders
  const recommendedCombos = useMemo(() => [
    {
      name: "아이비리그 건축 진학",
      description: "명문대 건축과 입학 전략",
      category: "아이비리그",
      keywords: ["하버드 GSD", "GSAPP", "아이비리그 건축 대학원"],
      contentType: "professional",
      benefit: "높은 검색량 + 전문성"
    },
    {
      name: "포트폴리오 완성 가이드", 
      description: "포트폴리오 제작 노하우",
      category: "건축",
      keywords: ["건축 다이어그램", "건축 컨셉", "건축 유학 포트폴리오"],
      contentType: "qna",
      benefit: "실용성 + 트렌딩"
    },
    {
      name: "국제학교 학생 전용",
      description: "IB 과정 학생 맞춤",
      category: "파인아트", 
      keywords: ["IB Visual Art", "국제학교 미술", "아트 서플리먼트"],
      contentType: "general",
      benefit: "타겟 특화 + 틈새"
    },
    {
      name: "유학 컨설팅 최적화",
      description: "검색량 1위 키워드 활용",
      category: "유학 및 컨설팅",
      keywords: ["마인드스페이스", "아이비리그 미대 입시 컨설팅", "미국미술유학"],
      contentType: "professional",
      benefit: "최고 검색량 + 전환율"
    },
    {
      name: "RISD 입학 전략",
      description: "최고 아트스쿨 합격 비법",
      category: "아트스쿨",
      keywords: ["RISD", "리즈디 대학", "미국 미대 편입"],
      contentType: "professional",
      benefit: "명문대 + 높은 관심도"
    },
    {
      name: "패션 디자인 유학",
      description: "패션 전공 해외 진학",
      category: "패션",
      keywords: ["FIT 패션", "패션 디자인", "패션 유학"],
      contentType: "qna",
      benefit: "전문 분야 + 실용성"
    },
    {
      name: "UX/UI 디자인 트렌드",
      description: "최신 디자인 동향 분석",
      category: "디자인",
      keywords: ["UX/UI 디자인", "웹 디자인", "디지털 디자인"],
      contentType: "general",
      benefit: "트렌딩 + 광범위 매력"
    },
    {
      name: "예일대 미술대학원",
      description: "아이비리그 미술 석사",
      category: "아이비리그",
      keywords: ["예일대학교 미술대학원", "예일 미술대학원", "하버드 대학원"],
      contentType: "professional",
      benefit: "최고 권위 + 전문성"
    },
    {
      name: "건축 유학 포트폴리오",
      description: "건축과 지원 작품집",
      category: "건축",
      keywords: ["건축 유학 포트폴리오", "건축대학원 포트폴리오", "미국 건축 대학원"],
      contentType: "qna",
      benefit: "실무 중심 + 높은 수요"
    },
    {
      name: "국제학교 미술 커리큘럼",
      description: "IB Visual Art 완벽 가이드",
      category: "파인아트",
      keywords: ["IB Visual Art", "국제학교 미술전공", "미술 국제학교"],
      contentType: "general",
      benefit: "교육 과정 + 학부모 관심"
    },
    {
      name: "SCAD 브랜드 매니지먼트",
      description: "패션 비즈니스 전문 과정",
      category: "아트스쿨",
      keywords: ["SCAD", "SCAD brand fashion management", "Art Center"],
      contentType: "professional",
      benefit: "전문 과정 + 취업 연계"
    },
    {
      name: "그래픽 디자인 포트폴리오",
      description: "시각 디자인 작품집 제작",
      category: "디자인",
      keywords: ["그래픽 디자인", "시각 디자인", "브랜딩"],
      contentType: "qna",
      benefit: "기초 필수 + 범용성"
    }
  ], []);

  // Shuffle combos only once on first render
  useEffect(() => {
    try {
      // Auto-load training data and status on component mount
      loadTrainingData();
      loadAutoTrainingStatus();
    } catch (error) {
      console.error('Error in initial load:', error);
    }
  }, []);

  // Update placeholder example whenever category or content type changes
  const promptExamples: Record<string, string[]> = {
    '상위 키워드': ['미국 미술 유학을 위한 포트폴리오 전략', 'GRE 없이 지원 가능한 미대 석사 과정 분석'],
    '건축': ['친환경 소재를 활용한 작은 주택 설계 방법', 'OMA 박물관 건축 사례 분석'],
    '아이비리그': ['하버드 GSD 합격 포트폴리오 준비 전략', '예일대 미술대학원 인터뷰 준비 팁'],
    '아트스쿨': ['RISD 그래픽 디자인 전공 합격 스토리', 'SCAD 패션 매니지먼트 커리큘럼 집중 분석'],
    '디자인': ['UX/UI 디자인 트렌드 2024', '브랜딩 강화를 위한 타이포그래피 활용법'],
    '유학 및 컨설팅': ['미술 유학 컨설팅 선택 시 체크리스트', '마인드스페이스 컨설팅 합격 사례 분석'],
    '파인아트': ['IB Visual Art 고득점 포트폴리오 제작법', '현대 회화에서 설치미술로 확장하는 방법'],
    '패션': ['텍스타일 패션 디자인 프로세스', 'FIT 패션 마케팅 석사 합격 전략'],
    '전체': ['선택한 키워드를 활용한 블로그 주제를 입력하세요', '창의적인 아이디어를 자유롭게 표현해보세요']
  };

  // Helper functions (moved before useEffect to avoid declaration order issues)
  const getCurrentCategory = () => {
    try {
      if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) return '전체';
      if (selectedCategories.length === 1) return selectedCategories[0];
      return `${selectedCategories.length}개 카테고리`;
    } catch (error) {
      console.error('Error in getCurrentCategory:', error);
      return '전체';
    }
  };

  useEffect(() => {
    try {
      if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) {
        setPromptPlaceholder('카테고리, 키워드(3개), 글 유형을 먼저 선택해주세요');
      } else if (!Array.isArray(selectedKeywords) || selectedKeywords.length < 3) {
        setPromptPlaceholder(`키워드를 ${3 - (selectedKeywords?.length || 0)}개 더 선택해주세요`);
      } else if (!selectedContentType) {
        setPromptPlaceholder('글 유형을 선택해주세요');
      } else {
        const currentCategory = getCurrentCategory();
        const examples = promptExamples[currentCategory] || promptExamples['전체'] || ['블로그 주제를 입력하세요'];
        
        if (Array.isArray(examples) && examples.length > 0) {
          const randomExample = examples[Math.floor(Math.random() * examples.length)];
          setPromptPlaceholder(randomExample);
        } else {
          setPromptPlaceholder('블로그 주제를 입력하세요');
        }
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      setPromptPlaceholder('블로그 주제를 입력하세요');
    }
  }, [selectedCategories, selectedKeywords, selectedContentType]);

  const getKeywordTag = (keyword: string) => {
    try {
      if (!keyword || typeof keyword !== 'string') {
        return { label: '기타', color: 'bg-gray-100 text-gray-800' };
      }
      
      if (keywordMeta?.trending?.includes(keyword)) return { label: '트렌딩', color: 'bg-red-100 text-red-800' };
      if (keywordMeta?.expert?.includes(keyword)) return { label: '전문', color: 'bg-purple-100 text-purple-800' };
      if (keywordMeta?.niche?.includes(keyword)) return { label: '틈새', color: 'bg-yellow-100 text-yellow-800' };
      if (keywordMeta?.popular?.includes(keyword)) return { label: '인기', color: 'bg-green-100 text-green-800' };
      return { label: '일반', color: 'bg-gray-100 text-gray-800' };
    } catch (error) {
      console.error('Error in getKeywordTag:', error);
      return { label: '기타', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getBalanceScore = () => {
    try {
      if (!Array.isArray(selectedKeywords) || selectedKeywords.length < 3) return null;
      
      const tags = selectedKeywords
        .filter(k => k && typeof k === 'string')
        .map(k => getKeywordTag(k)?.label || '일반');
      
      if (tags.length === 0) return null;
      
      const uniqueTags = new Set(tags);
      const diversity = uniqueTags.size;
      const hasTrending = tags.includes('트렌딩');
      const hasExpert = tags.includes('전문');
      
      if (diversity >= 3) return { score: 'A', message: '완벽한 균형', color: 'text-green-600' };
      if (diversity === 2 && hasTrending) return { score: 'B+', message: '우수한 조합', color: 'text-blue-600' };
      if (diversity === 2) return { score: 'B', message: '좋은 조합', color: 'text-blue-500' };
      if (hasTrending || hasExpert) return { score: 'C+', message: '보통 조합', color: 'text-yellow-600' };
      return { score: 'C', message: '다양성 부족', color: 'text-orange-600' };
    } catch (error) {
      console.error('Error in getBalanceScore:', error);
      return null;
    }
  };

  const applyRecommendedCombo = (combo: typeof recommendedCombos[0]) => {
    try {
      // Validate combo data
      if (!combo || !combo.keywords || !combo.category || !combo.contentType) {
        console.error('Invalid combo data:', combo);
        return;
      }
      
      // Validate that the category exists in keywordHierarchy
      if (!keywordHierarchy[combo.category as keyof typeof keywordHierarchy]) {
        console.error(`Category "${combo.category}" not found in keywordHierarchy`);
        return;
      }
      
      // Validate that all keywords exist in the category
      const categoryKeywords = keywordHierarchy[combo.category as keyof typeof keywordHierarchy].keywords;
      const invalidKeywords = combo.keywords.filter(keyword => !categoryKeywords.includes(keyword));
      
      if (invalidKeywords.length > 0) {
        console.error(`Invalid keywords found: ${invalidKeywords.join(', ')}`);
        // Use only valid keywords
        const validKeywords = combo.keywords.filter(keyword => categoryKeywords.includes(keyword));
        if (validKeywords.length === 0) {
          console.error('No valid keywords found');
          return;
        }
        setSelectedKeywords(validKeywords);
      } else {
        setSelectedKeywords(combo.keywords);
      }
      
      setSelectedCategories([combo.category]);
      setSelectedPath([]);
      setSelectedContentType(combo.contentType);
      
      // Update prompt placeholder
      const examplePrompts = promptExamples[combo.category] || promptExamples['전체'] || ['블로그 주제를 입력하세요'];
      if (Array.isArray(examplePrompts) && examplePrompts.length > 0) {
        setPromptPlaceholder(examplePrompts[Math.floor(Math.random() * examplePrompts.length)]);
      } else {
        setPromptPlaceholder('블로그 주제를 입력하세요');
      }
      
      // Show success message
      alert(`"${combo.name}" 조합이 적용되었습니다!\n\n키워드: ${combo.keywords.join(', ')}\n콘텐츠 타입: ${contentTypes.find(t => t.id === combo.contentType)?.name}\n\n이제 블로그 주제를 입력하고 콘텐츠를 생성해보세요!`);
    } catch (error) {
      console.error('Error applying recommended combo:', error);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    
    // Clean up function to remove unwanted characters
    const cleanText = (text: string) => {
      return text
        .replace(/\*+/g, '') // Remove all asterisks
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s+/g, '\n') // Remove spaces at the beginning of new lines
        .trim();
    };
    
    // Format for Naver Blog with center alignment and proper structure
    let formattedText = `${cleanText(result.title)}\n\n`;
    formattedText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Add content paragraphs
    formattedText += `${cleanText(result.paragraph1)}\n\n`;
    formattedText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    formattedText += `${cleanText(result.paragraph2)}\n\n`;
    formattedText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    formattedText += `${cleanText(result.paragraph3)}\n\n`;
    
    formattedText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Add hashtags centered
    const hashtagText = result.hashtags.join(' ');
    formattedText += `${hashtagText}`;
    
    navigator.clipboard.writeText(formattedText);
    alert('네이버 블로그용 텍스트가 클립보드에 복사되었습니다!\n\n※ 모든 불필요한 문자(*)가 제거되어 바로 사용 가능합니다.');
  };

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    } else {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  const getFilteredKeywords = () => {
    try {
      if (selectedCategories.length === 0) {
        return Object.values(keywordHierarchy)
          .filter(data => data && Array.isArray(data.keywords))
          .flatMap(data => data.keywords);
      }
      return selectedCategories.flatMap(category => {
        const categoryData = keywordHierarchy[category as keyof typeof keywordHierarchy];
        return Array.isArray(categoryData?.keywords) ? categoryData.keywords : [];
      });
    } catch (error) {
      console.error('Error in getFilteredKeywords:', error);
      return [];
    }
  };

  const getGroupedKeywords = () => {
    try {
      if (selectedCategories.length === 0) {
        // Return all categories when no specific category is selected
        return Object.entries(keywordHierarchy)
          .filter(([category, data]) => data && Array.isArray(data.keywords))
          .map(([category, data]) => ({
            category,
            keywords: Array.isArray(data.keywords) ? data.keywords : []
          }));
      }
      // Return only selected categories
      return selectedCategories
        .map(category => {
          const categoryData = keywordHierarchy[category as keyof typeof keywordHierarchy];
          return {
            category,
            keywords: Array.isArray(categoryData?.keywords) ? categoryData.keywords : []
          };
        })
        .filter(item => Array.isArray(item.keywords) && item.keywords.length > 0);
    } catch (error) {
      console.error('Error in getGroupedKeywords:', error);
      return [];
    }
  };

  const handleKeywordToggle = (keyword: string) => {
    try {
      setSelectedKeywords(prev => 
        prev.includes(keyword) 
          ? prev.filter(k => k !== keyword)
          : [...prev, keyword]
      );
    } catch (error) {
      console.error('Error toggling keyword:', error);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setSelectedPath(prev => prev.slice(0, index + 1));
    if (index === 0) {
      setSelectedKeywords([]);
      setSelectedContentType('');
    }
  };

  // --- Training Management Functions ---
  const loadTrainingData = async () => {
    try {
      const response = await fetch('/api/training/upload');
      if (response.ok) {
        const data = await response.json();
        setTrainingData(data);
      }
    } catch (error) {
      console.error('학습 데이터 로드 실패:', error);
    }
  };

  // 텍스트 정리 함수
  const cleanText = (text: string): string => {
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
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Find column indices
      const titleIndex = headers.findIndex(h => h.toLowerCase().includes('제목') || h.toLowerCase().includes('title'));
      const contentIndex = headers.findIndex(h => h.toLowerCase().includes('본문') || h.toLowerCase().includes('content') || h.toLowerCase().includes('내용'));
      
      if (titleIndex === -1 || contentIndex === -1) {
        alert('CSV 파일에 "제목"과 "본문" 컬럼이 필요합니다.');
        return;
      }

      const csvBlogs: Array<{title: string, content: string}> = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',');
        if (columns.length > Math.max(titleIndex, contentIndex)) {
          const rawTitle = columns[titleIndex]?.trim().replace(/"/g, '');
          const rawContent = columns[contentIndex]?.trim().replace(/"/g, '');
          
          if (rawTitle && rawContent) {
            // 텍스트 정리 적용
            const title = cleanText(rawTitle);
            const content = cleanText(rawContent);
            
            // 정리 후에도 유효한 데이터인지 확인
            if (title.length > 0 && content.length > 10) {
              csvBlogs.push({ title, content });
            }
          }
        }
      }

      if (csvBlogs.length > 0) {
        setTrainingBlogs(prev => [...prev, ...csvBlogs]);
        alert(`${csvBlogs.length}개의 블로그가 목록에 추가되었습니다. (텍스트 자동 정리 적용)`);
      } else {
        alert('유효한 데이터를 찾을 수 없습니다.');
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const addTrainingBlog = () => {
    if (newBlogTitle.trim() && newBlogContent.trim()) {
      setTrainingBlogs(prev => [...prev, {
        title: cleanText(newBlogTitle),
        content: cleanText(newBlogContent)
      }]);
      setNewBlogTitle('');
      setNewBlogContent('');
    }
  };

  const removeTrainingBlog = (index: number) => {
    setTrainingBlogs(prev => prev.filter((_, i) => i !== index));
  };

  const uploadTrainingData = async () => {
    if (trainingBlogs.length === 0) {
      alert('업로드할 블로그 데이터가 없습니다.');
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch('/api/training/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogs: trainingBlogs
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`성공! ${data.newBlogs}개의 블로그가 학습되었습니다. (총 ${data.totalBlogs}개)`);
        setTrainingBlogs([]);
        await loadTrainingData();
      } else {
        alert('업로드 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 자동 학습 상태 확인
  const loadAutoTrainingStatus = async () => {
    try {
      const response = await fetch('/api/training/status');
      if (response.ok) {
        const data = await response.json();
        setAutoTrainingStatus(data);
      }
    } catch (error) {
      console.error('자동 학습 상태 로드 실패:', error);
    }
  };

  // 자동 학습 수동 실행
  const refreshAutoTraining = async () => {
    setIsRefreshingAutoTraining(true);
    try {
      const response = await fetch('/api/training/status', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setAutoTrainingStatus(data);
        alert('자동 학습이 완료되었습니다!');
      } else {
        alert('자동 학습 실행 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('자동 학습 실행 실패:', error);
      alert('자동 학습 실행 중 오류가 발생했습니다.');
    } finally {
      setIsRefreshingAutoTraining(false);
    }
  };

  // Load training data on component mount
  useEffect(() => {
    loadTrainingData();
    loadAutoTrainingStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((selectedCategories.length === 0 && !getCurrentCategory()) || selectedKeywords.length < 3 || !selectedContentType || !prompt.trim()) return;

    setLoading(true);
    setResult(null);
    setResponse('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          category: selectedCategories.length > 0 ? selectedCategories.join(', ') : getCurrentCategory(),
          keywords: selectedKeywords,
          contentType: selectedContentType
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.title && data.paragraph1 && data.paragraph2 && data.paragraph3) {
        const newResult = {
          title: data.title,
          paragraph1: data.paragraph1,
          paragraph2: data.paragraph2,
          paragraph3: data.paragraph3,
          images: data.images || [],
          hashtags: data.hashtags || []
        };
        setResult(newResult);
        setResponse('');
      } else if (data.content && !data.isStructured) {
        setResult(null);
        setResponse(data.content);
      } else {
        setResult(null);
        
        // 에러 메시지를 더 자세히 표시
        let errorMessage = data.error || '응답 형식이 올바르지 않습니다. 다시 시도해주세요.';
        
        // 상태별 에러 메시지 처리
        if (res.status === 500 && data.error && data.error.includes('GEMINI_API_KEY')) {
          errorMessage = `⚠️ 환경 변수 설정 문제\n\n${data.error}\n\n해결 방법:\n1. 프로젝트 루트에 .env.local 파일 생성\n2. GEMINI_API_KEY=your_api_key_here 추가\n3. Google AI Studio에서 API 키 발급: https://makersuite.google.com/app/apikey\n4. 개발 서버 재시작 (npm run dev)`;
        } else if (res.status === 401) {
          errorMessage = `🔑 API 키 인증 오류\n\n${data.error}\n\n해결 방법:\n1. API 키가 올바른지 확인\n2. API 키가 만료되지 않았는지 확인\n3. Google AI Studio에서 새 API 키 발급`;
        } else if (res.status === 503) {
          errorMessage = `🌐 AI 서비스 연결 오류\n\n${data.error}\n\n해결 방법:\n1. 네트워크 연결 확인\n2. 잠시 후 다시 시도\n3. API 사용 한도 확인`;
        }
        
        setResponse(errorMessage);
      }
    } catch (error) {
      console.error('API connection error:', error);
      const errorMessage = `🔌 네트워크 연결 오류\n\nAPI 연결에 실패했습니다.\n\n해결 방법:\n1. 네트워크 상태 확인\n2. 개발 서버가 실행 중인지 확인 (npm run dev)\n3. 브라우저 새로고침 후 다시 시도\n4. 브라우저 개발자 도구 콘솔에서 자세한 오류 확인\n\n오류 세부사항: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
      setResponse(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            네이버 블로그 콘텐츠 생성기
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Gemini AI를 사용하여 블로그 콘텐츠를 생성합니다
          </p>

          {/* Training Management Panel */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">🧠 AI 학습 관리</h3>
              <button
                type="button"
                onClick={() => setShowTrainingPanel(!showTrainingPanel)}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
              >
                {showTrainingPanel ? '숨기기' : '기존 글 학습하기'}
              </button>
            </div>
            
            {showTrainingPanel && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-600 mb-4">
                  <p className="mb-2">기존 블로그 컨텐츠를 학습시켜 AI가 당신의 글쓰기 스타일을 모방할 수 있도록 합니다.</p>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <p className="font-medium text-yellow-900 mb-1">💡 자동 학습 방법:</p>
                    <p className="text-yellow-800">
                      <code className="bg-yellow-100 px-1 rounded">src/data/bulk-training-data.csv</code> 파일에 
                      대량의 블로그 데이터를 추가하면 서버 시작 시 자동으로 학습됩니다.
                    </p>
                  </div>
                </div>
                
                {/* Auto Training Status */}
                {autoTrainingStatus && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-green-900">
                          🤖 자동 학습된 블로그: {autoTrainingStatus.totalBlogs}개
                        </span>
                        <div className="text-xs text-green-700 mt-1">
                          마지막 업데이트: {autoTrainingStatus.lastUpdate !== 'Never' ? new Date(autoTrainingStatus.lastUpdate).toLocaleString() : '없음'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={refreshAutoTraining}
                        disabled={isRefreshingAutoTraining}
                        className="text-xs text-green-600 hover:text-green-800 underline disabled:opacity-50"
                      >
                        {isRefreshingAutoTraining ? '학습 중...' : 'CSV 재학습'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual Training Status */}
                {trainingData && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">
                        📝 수동 학습된 블로그: {trainingData.totalBlogs}개
                      </span>
                      <button
                        type="button"
                        onClick={loadTrainingData}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        새로고침
                      </button>
                    </div>
                  </div>
                )}

                {/* CSV Upload */}
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">📄 CSV 파일로 일괄 업로드</h4>
                  <p className="text-xs text-yellow-700 mb-3">
                    엑셀에서 "제목", "본문" 컬럼으로 작성한 후 CSV로 저장하여 업로드하세요.
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {/* Add New Blog */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      블로그 제목
                    </label>
                    <input
                      type="text"
                      value={newBlogTitle}
                      onChange={(e) => setNewBlogTitle(e.target.value)}
                      placeholder="기존 블로그 포스트의 제목을 입력하세요"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      블로그 본문
                    </label>
                    <textarea
                      value={newBlogContent}
                      onChange={(e) => setNewBlogContent(e.target.value)}
                      placeholder="기존 블로그 포스트의 본문을 복사해서 붙여넣으세요... (어조, 말투, 문단 구조, 감정 표현 등을 학습합니다)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={6}
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={addTrainingBlog}
                    disabled={!newBlogTitle.trim() || !newBlogContent.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    목록에 추가
                  </button>
                </div>

                {/* Training Blogs List */}
                {trainingBlogs.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      학습 대기 목록 ({trainingBlogs.length}개)
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {trainingBlogs.map((blog, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                            <div className="text-xs text-gray-500">
                              {blog.content.length > 100 ? `${blog.content.substring(0, 100)}...` : blog.content}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTrainingBlog(index)}
                            className="ml-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      onClick={uploadTrainingData}
                      disabled={isUploading}
                      className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUploading ? '학습 중...' : `${trainingBlogs.length}개 블로그 학습시키기`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Breadcrumb Navigation */}
            {selectedPath.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>선택 경로:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPath([]);
                      setSelectedKeywords([]);
                      setSelectedContentType('');
                    }}
                    className="text-gray-500 hover:text-gray-700 underline"
                  >
                    처음으로
                  </button>
                  <span className="mx-2">›</span>
                  {selectedPath.map((path, index) => (
                    <div key={index} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => handleBreadcrumbClick(index)}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {path}
                      </button>
                      {index < selectedPath.length - 1 && <span className="mx-2">›</span>}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPath([]);
                    setSelectedKeywords([]);
                    setSelectedContentType('');
                  }}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-full transition-colors"
                >
                  초기화
                </button>
              </div>
            )}

            {/* Recommended Combinations */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">🎯 추천 키워드 조합</h3>
                <button
                  type="button"
                  onClick={() => setShowRecommendedCombos(!showRecommendedCombos)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full transition-colors"
                >
                  {showRecommendedCombos ? '숨기기' : '보기'}
                </button>
              </div>
              {showRecommendedCombos && (
                <>
                  <p className="text-sm text-gray-600 mb-4">성과가 입증된 키워드 조합을 바로 사용해보세요!</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendedCombos.map((combo, index) => {
                      try {
                        return (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                            onClick={() => applyRecommendedCombo(combo)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">{combo.name}</h4>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {combo.benefit || '추천'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {combo.description || '추천 키워드 조합입니다'} - {combo.benefit || '효과적인 콘텐츠 생성'}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              ✅ {combo.keywords?.length || 0}개 키워드 | 밸런스: A | {combo.keywords?.includes('trending') ? '트렌딩' : '전문'} 콘텐츠
                            </div>
                          </div>
                        );
                      } catch (error) {
                        console.error('Error rendering combo:', combo, error);
                        return null;
                      }
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                카테고리 선택 (다중 선택 가능)
                <span className="ml-2 text-blue-600">
                  선택됨: {selectedCategories.length}개
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-4 py-2 border rounded-full transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-200 text-gray-800 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  키워드 선택 (최소 3개 필수)
                  <span className="ml-2 text-blue-600">
                    선택됨: {selectedKeywords.length}/3
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAllKeywords(!showAllKeywords)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
                  >
                    {showAllKeywords ? '선택된 카테고리만' : '전체 키워드 보기'}
                  </button>
                {getBalanceScore() && (
                  <div className={`text-sm font-medium ${getBalanceScore()?.color}`}>
                    균형도: {getBalanceScore()?.score} - {getBalanceScore()?.message}
                  </div>
                )}
                </div>
              </div>

              <div className="mb-3 text-xs text-gray-500">
                <span className="inline-block w-3 h-3 bg-red-100 rounded mr-1"></span>트렌딩 |
                <span className="inline-block w-3 h-3 bg-purple-100 rounded mr-1 ml-2"></span>전문 |
                <span className="inline-block w-3 h-3 bg-green-100 rounded mr-1 ml-2"></span>인기 |
                <span className="inline-block w-3 h-3 bg-yellow-100 rounded mr-1 ml-2"></span>틈새
              </div>

              {getGroupedKeywords().length > 0 ? (
                <div className="space-y-4 mb-4 max-h-[600px] overflow-y-auto pr-1 border border-gray-200 rounded-lg p-4">
                {getGroupedKeywords()
                  .filter(group => group && group.category && Array.isArray(group.keywords))
                  .map(({ category, keywords }) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">{category}</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(keywords || []).filter(keyword => keyword && typeof keyword === 'string').map((keyword) => {
                        try {
                          const tag = getKeywordTag(keyword);
                          return (
                            <button
                              key={keyword}
                              type="button"
                              onClick={() => handleKeywordToggle(keyword)}
                              className={`px-3 py-2 rounded-full text-sm border transition-colors relative ${
                                selectedKeywords.includes(keyword)
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-gray-100 text-gray-800 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                              }`}
                            >
                              <span className={`absolute -top-1 -right-1 text-xs px-1 rounded-full ${tag?.color || 'bg-gray-100'}`}>
                                {tag?.label || '기타'}
                              </span>
                              {keyword}
                            </button>
                          );
                        } catch (error) {
                          console.error('Error rendering keyword:', keyword, error);
                          return null;
                        }
                      })}
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>카테고리를 선택하거나 '전체 키워드 보기' 버튼을 클릭하세요</p>
                </div>
              )}

              {selectedKeywords.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">선택된 키워드:</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(selectedKeywords || []).map((keyword) => {
                      const tag = getKeywordTag(keyword);
                      return (
                        <span
                          key={keyword}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${tag.color}`}></span>
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleKeywordToggle(keyword)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  {selectedKeywords.length >= 3 && getBalanceScore() && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">💡 조합 분석:</span>
                        <span className={`font-medium ${getBalanceScore()?.color}`}>
                          {getBalanceScore()?.score}등급
                        </span>
                      </div>
                      {getBalanceScore()?.score === 'A' && (
                        <p>완벽해요! 트렌딩 + 전문 + 틈새 키워드의 균형잡힌 조합입니다.</p>
                      )}
                      {getBalanceScore()?.score === 'B+' && (
                        <p>훌륭한 조합입니다! 높은 검색량과 전문성을 모두 갖춘 키워드들이에요.</p>
                      )}
                      {getBalanceScore()?.score === 'B' && (
                        <p>좋은 조합입니다. 다양한 키워드 타입이 포함되어 있어요.</p>
                      )}
                      {(getBalanceScore()?.score === 'C+' || getBalanceScore()?.score === 'C') && (
                        <p>💡 힌트: 다른 타입의 키워드를 추가하면 더 균형잡힌 콘텐츠를 만들 수 있어요!</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content Type Selection */}
            {(selectedCategories.length > 0 || selectedPath.length > 0) && selectedKeywords.length >= 3 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  글 유형 선택 (필수)
                  <span className="ml-2 text-blue-600">
                    {selectedContentType ? `✓ ${contentTypes.find(t => t.id === selectedContentType)?.name}` : '유형을 선택하세요'}
                  </span>
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {contentTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedContentType === type.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedContentType(type.id)}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{type.icon}</div>
                        <h3 className="font-semibold text-gray-900 mb-2">{type.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                        
                        <div className="text-xs">
                          <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                            <span className="font-medium">형식:</span> {type.format}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {type.benefits.map((benefit, index) => (
                              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedContentType && (
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">💡 선택된 유형:</span>
                      <span className="font-semibold">
                        {contentTypes.find(t => t.id === selectedContentType)?.name}
                      </span>
                    </div>
                    <p className="mt-1">
                      {selectedContentType === 'professional' && 
                        '전문가 수준의 깊이 있는 분석과 실무 경험이 담긴 콘텐츠를 생성합니다.'}
                      {selectedContentType === 'qna' && 
                        '독자들이 자주 묻는 질문에 대한 명확하고 실용적인 답변을 제공합니다.'}
                      {selectedContentType === 'general' && 
                        '누구나 쉽게 이해할 수 있는 친근한 스토리텔링 형식으로 작성됩니다.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                블로그 주제 입력
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={promptPlaceholder}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed placeholder-gray-500 text-gray-900"
                rows={4}
                required
                disabled={(selectedCategories.length === 0 && !getCurrentCategory()) || selectedKeywords.length < 3 || !selectedContentType}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || (selectedCategories.length === 0 && !getCurrentCategory()) || selectedKeywords.length < 3 || !selectedContentType || !prompt.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading 
                ? '생성 중...' 
                : (selectedCategories.length === 0 && !getCurrentCategory())
                  ? '카테고리를 선택하세요' 
                  : selectedKeywords.length < 3
                    ? `키워드를 ${3 - selectedKeywords.length}개 더 선택하세요`
                    : !selectedContentType
                      ? '글 유형을 선택하세요'
                      : '콘텐츠 생성'
              }
            </button>
          </form>

          {(result || response) && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">생성된 콘텐츠:</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {selectedCategories.length > 0 ? selectedCategories.join(', ') : getCurrentCategory()}
                  </span>
                  {selectedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-2">
                      {(selectedKeywords || []).slice(0, 3).map((keyword) => (
                        <span key={keyword} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedContentType && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      {contentTypes.find(t => t.id === selectedContentType)?.icon} {contentTypes.find(t => t.id === selectedContentType)?.name}
                    </span>
                  )}
                </div>
                
                {result && (
                  <div className="text-center">
                    <button
                      onClick={copyToClipboard}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      📋 네이버 블로그용 복사
                    </button>
                  </div>
                )}
              </div>
              
              {result && (
                <div className="bg-white p-8 rounded-lg shadow-sm border max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
                    {result.title}
                  </h2>
                  
                  <div className="space-y-6 text-lg leading-relaxed text-gray-700">
                    <div>{result.paragraph1}</div>
                    <div className="border-t border-gray-200"></div>
                    <div>{result.paragraph2}</div>
                    <div className="border-t border-gray-200"></div>
                    <div>{result.paragraph3}</div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">✅ 추천 이미지</h3>
                    <div className="space-y-4">
                      {(result.images || []).map((image, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-bold text-gray-900 mb-2">
                            {index + 1}. {image}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">✅ 해시태그</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {(result.hashtags || []).map((hashtag, index) => (
                        <span key={index} className="text-blue-600 font-medium text-lg">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!result && response && (
                <div className="bg-white p-6 rounded-lg shadow-sm border max-w-4xl mx-auto">
                  {typeof response === 'string' && (response.startsWith('오류:') || response.includes('실패') || response.includes('⚠️') || response.includes('🔑') || response.includes('🌐') || response.includes('🔌')) ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-semibold text-red-800 mb-4">오류가 발생했습니다</h3>
                          <div className="bg-white p-4 rounded border">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                              {typeof response === 'string' ? response : JSON.stringify(response)}
                            </pre>
                          </div>
                          <div className="mt-6 flex gap-3">
                            <button
                              onClick={() => {
                                setResponse('');
                                setResult(null);
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                              다시 시도
                            </button>
                            <button
                              onClick={() => {
                                // 브라우저의 개발자 도구 콘솔을 열도록 안내
                                alert('브라우저에서 F12를 눌러 개발자 도구를 열고 Console 탭에서 자세한 오류 정보를 확인할 수 있습니다.');
                              }}
                              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              개발자 도구 열기 안내
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-start mb-4">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-semibold text-yellow-800">구조화되지 않은 응답</h3>
                          <div className="text-sm text-yellow-700 mt-2 mb-4">
                            <p>AI가 구조화된 형식으로 응답하지 않았습니다. 원본 응답을 표시합니다:</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded border">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                          {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
    </div>
    </main>
  );
}
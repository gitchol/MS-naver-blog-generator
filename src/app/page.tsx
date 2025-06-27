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
  const [shuffledCombos, setShuffledCombos] = useState<typeof recommendedCombos>([]);
  const [promptPlaceholder, setPromptPlaceholder] = useState('카테고리, 키워드(3개), 글 유형을 먼저 선택해주세요');
  const [showRecommendedCombos, setShowRecommendedCombos] = useState(true);
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
      keywords: ["건축 다이어그램", "건축 컨셉", "포트폴리오 컨셉"],
      contentType: "qna",
      benefit: "실용성 + 트렌딩"
    },
    {
      name: "국제학교 학생 전용",
      description: "IB 과정 학생 맞춤",
      category: "파인아트", 
      keywords: ["IB Art", "국제학교 미술", "아트 서플리먼트"],
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
    setShuffledCombos([...recommendedCombos].sort(() => Math.random() - 0.5));
  }, [recommendedCombos]);

  // Update placeholder example whenever category or content type changes
  const promptExamples: Record<string, string[]> = {
    '상위 키워드': ['미국 미술 유학을 위한 포트폴리오 전략', 'GRE 없이 지원 가능한 미대 석사 과정 분석'],
    '건축': ['친환경 소재를 활용한 작은 주택 설계 방법', 'OMA 박물관 건축 사례 분석'],
    '아이비리그': ['하버드 GSD 합격 포트폴리오 준비 전략', '예일대 미술대학원 인터뷰 준비 팁'],
    '아트스쿨': ['RISD 그래픽 디자인 전공 합격 스토리', 'SCAD 패션 매니지먼트 커리큘럼 집중 분석'],
    '디자인': ['UX/UI 디자인 트렌드 2024', '브랜딩 강화를 위한 타이포그래피 활용법'],
    '유학 및 컨설팅': ['미술 유학 컨설팅 선택 시 체크리스트', '마인드스페이스 컨설팅 합격 사례 분석'],
    '파인아트': ['IB Visual Art 고득점 포트폴리오 제작법', '현대 회화에서 설치미술로 확장하는 방법'],
    '패션': ['텍스타일 패션 디자인 프로세스', 'FIT 패션 마케팅 석사 합격 전략']
  };

  // Helper functions (moved before useEffect to avoid declaration order issues)
  const getCurrentCategory = () => {
    if (selectedCategories.length === 0) return '전체';
    if (selectedCategories.length === 1) return selectedCategories[0];
    return `${selectedCategories.length}개 카테고리`;
  };

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setPromptPlaceholder('카테고리, 키워드(3개), 글 유형을 먼저 선택해주세요');
    } else if (selectedKeywords.length < 3) {
      setPromptPlaceholder(`키워드를 ${3 - selectedKeywords.length}개 더 선택해주세요`);
    } else if (!selectedContentType) {
      setPromptPlaceholder('글 유형을 선택해주세요');
    } else {
      const examples = promptExamples[getCurrentCategory()] || promptExamples['전체'];
      const randomExample = examples[Math.floor(Math.random() * examples.length)];
      setPromptPlaceholder(randomExample);
    }
  }, [selectedCategories, selectedKeywords, selectedContentType]);

  const getKeywordTag = (keyword: string) => {
    if (keywordMeta.trending.includes(keyword)) return { label: '트렌딩', color: 'bg-red-100 text-red-800' };
    if (keywordMeta.expert.includes(keyword)) return { label: '전문', color: 'bg-purple-100 text-purple-800' };
    if (keywordMeta.niche.includes(keyword)) return { label: '틈새', color: 'bg-yellow-100 text-yellow-800' };
    if (keywordMeta.popular.includes(keyword)) return { label: '인기', color: 'bg-green-100 text-green-800' };
    return { label: '일반', color: 'bg-gray-100 text-gray-800' };
  };

  const getBalanceScore = () => {
    if (selectedKeywords.length < 3) return null;
    
    const tags = selectedKeywords.map(k => getKeywordTag(k).label);
    const uniqueTags = new Set(tags);
    const diversity = uniqueTags.size;
    const hasTrending = tags.includes('트렌딩');
    const hasExpert = tags.includes('전문');
    
    if (diversity >= 3) return { score: 'A', message: '완벽한 균형', color: 'text-green-600' };
    if (diversity === 2 && hasTrending) return { score: 'B+', message: '우수한 조합', color: 'text-blue-600' };
    if (diversity === 2) return { score: 'B', message: '좋은 조합', color: 'text-blue-500' };
    if (hasTrending || hasExpert) return { score: 'C+', message: '보통 조합', color: 'text-yellow-600' };
    return { score: 'C', message: '다양성 부족', color: 'text-orange-600' };
  };

  const applyRecommendedCombo = (combo: typeof recommendedCombos[0]) => {
    setSelectedCategories([combo.category]);
    setSelectedPath([]);
    setSelectedKeywords(combo.keywords);
    setSelectedContentType(combo.contentType);
  };

  const copyToClipboard = () => {
    if (!result) return;
    
    // Format for Naver Blog with center alignment and proper structure
    let formattedText = `${result.title}\n\n`;
    formattedText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Add content paragraphs
    formattedText += `${result.paragraph1}\n\n`;
    formattedText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    formattedText += `${result.paragraph2}\n\n`;
    formattedText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    formattedText += `${result.paragraph3}\n\n`;
    
    formattedText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Add hashtags centered
    const hashtagText = result.hashtags.join(' ');
    formattedText += `${hashtagText}`;
    
    navigator.clipboard.writeText(formattedText);
    alert('네이버 블로그용 텍스트가 클립보드에 복사되었습니다!');
  };

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    } else {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  const getFilteredKeywords = () => {
    if (selectedCategories.length === 0) {
      return Object.values(keywordHierarchy).flat();
    }
    return selectedCategories.flatMap(category => keywordHierarchy[category as keyof typeof keywordHierarchy]?.keywords || []);
  };

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleBreadcrumbClick = (index: number) => {
    setSelectedPath(prev => prev.slice(0, index + 1));
    if (index === 0) {
      setSelectedKeywords([]);
      setSelectedContentType('');
    }
  };

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
        setResponse(`오류: ${data.error || '응답 형식이 올바르지 않습니다. 다시 시도해주세요.'}`);
      }
    } catch (error) {
      console.error('API connection error:', error);
      setResponse('API 연결에 실패했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
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
                    {shuffledCombos.map((combo, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => applyRecommendedCombo(combo)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{combo.name}</h4>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {combo.benefit}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {combo.description} - {combo.benefit}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          ✅ {combo.keywords.length}개 키워드 | 밸런스: A | {combo.keywords.includes('trending') ? '트렌딩' : '전문'} 콘텐츠
                        </div>
                      </div>
                    ))}
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

              {getFilteredKeywords().length > 0 ? (
                <div className="space-y-4 mb-4 max-h-[600px] overflow-y-auto pr-1 border border-gray-200 rounded-lg p-4">
                {getFilteredKeywords().map(({ category, keywords }) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">{category}</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {keywords.map((keyword) => {
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
                            <span className={`absolute -top-1 -right-1 text-xs px-1 rounded-full ${tag.color}`}>
                              {tag.label}
                            </span>
                            {keyword}
                          </button>
                        );
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
                    {selectedKeywords.map((keyword) => {
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
                      {selectedKeywords.slice(0, 3).map((keyword) => (
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
                      {result.images.map((image, index) => (
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
                      {result.hashtags.map((hashtag, index) => (
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
                  {typeof response === 'string' && (response.startsWith('오류:') || response.includes('실패')) ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">오류가 발생했습니다</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{typeof response === 'string' ? response : JSON.stringify(response)}</p>
                          </div>
                          <div className="mt-4">
                            <div className="flex">
                              <button
                                onClick={() => {
                                  setResponse('');
                                  setResult(null);
                                }}
                                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                              >
                                다시 시도
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="ml-3 text-sm font-medium text-yellow-800">구조화되지 않은 응답</h3>
                      </div>
                      <div className="text-sm text-yellow-700 mb-4">
                        <p>AI가 구조화된 형식으로 응답하지 않았습니다. 원본 응답을 표시합니다:</p>
                      </div>
                      <div className="bg-white p-4 rounded border text-gray-800">
                        <pre className="whitespace-pre-wrap text-sm">{typeof response === 'string' ? response : JSON.stringify(response, null, 2)}</pre>
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
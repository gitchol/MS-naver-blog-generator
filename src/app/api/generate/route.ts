import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, category, keywords, contentType } = await request.json();

    if (!prompt || !category || !keywords || !contentType || !Array.isArray(keywords) || keywords.length < 3) {
      return NextResponse.json({ error: 'Prompt, category, contentType, and at least 3 keywords are required' }, { status: 400 });
    }

    // Create content-type specific prompt with keywords
    const keywordString = keywords.join(', ');
    
    const contentTypePrompts = {
      professional: {
        structure: {
          paragraph1: "전문적 배경 및 현황 분석 - 글 요약 제시, 업계 전문 지식과 실무 경험 기반. 키워드를 문장 서두에 배치하여 SEO 최적화. 실제 합격 사례와 학원의 전문성 어필. 문자열 내에 소제목과 본문을 포함하여 구조화. 영문 전공명을 병기하여 국제적 맥락 제공 (350-400자)",
          paragraph2: "핵심 내용 설명 - [1], [2] 등 단계별 구조화된 설명, 구체적 사례와 전문 용어 포함. 키워드를 중간 부분에 자연스럽게 반복 배치. 학생들의 실력 향상과 합격률 데이터 언급. 중간에 '📌 핵심 요약' 박스 형태의 요약 정보 포함. 문자열 내에 소제목과 본문을 포함하여 구조화 (400-450자)",
          paragraph3: "실무 적용 방안 및 전문가 조언 - 키워드를 결론 부분에 재차 강조하여 SEO 효과 극대화. 학원의 차별화된 커리큘럼과 개인별 맞춤 지도 방식 어필. '정리하면', '오늘 글 정리' 등으로 마무리. 문자열 내에 소제목과 본문을 포함하여 구조화 (350-400자)"
        },
        tone: "전문가가 실무 경험을 바탕으로 교육하는 톤. 짧은 문장과 긴 문장을 혼용하여 리듬감 조성. 전문 용어를 사용하되 이해하기 쉽게 설명. 강조 표현과 구어체를 적절히 섞어 단조로움 방지. 학원의 전문성과 실제 성과를 자연스럽게 어필. 각 문단 내에 소제목을 포함하여 읽기 편하게 구성.",
        format: "제목에 주제 요약 포함, 본문 시작에 '오늘 글 요약' 구조, 단계별 번호 매기기 ([1], [2]), 각 문단 내에 소제목 포함, 두 번째 문단에 '📌 핵심 요약' 박스 포함, 영문 전공명 병기, 키워드 SEO 배치(서두/중간/결론), 학원 차별화 포인트 언급, 마지막에 정리 문구",
        examples: "구체적인 케이스 스터디, 실무 팁, 단계별 가이드라인, 전문가 인사이트, 핵심 요약 박스, 합격 사례 및 통계, 학원 커리큘럼 강점"
      },
      qna: {
        structure: {
          paragraph1: "핵심 질문 1 (Key Question 1) 제시 및 이에 대한 친근하고 감정적인 어조의 답변. '◆ Q1: 질문내용' 형태로 시작하여 답변 제공. 키워드를 질문과 답변 초반에 배치. 학원의 실제 지도 경험과 학생 성과 언급. 짧은 문장과 긴 문장 혼용으로 리듬감 조성 (450-550자)",
          paragraph2: "핵심 질문 2 (Key Question 2) 제시 및 이에 대한 답변. '◆ Q2: 질문내용' 형태로 시작하여 답변 제공. 키워드를 답변 중간에 자연스럽게 반복. 학원의 차별화된 교육 방식과 개별 맞춤 지도 어필. 강조 표현과 구어체 적절히 활용 (450-550자)",
          paragraph3: "핵심 질문 3 (Key Question 3) 제시 및 이에 대한 답변. '◆ Q3: 질문내용' 형태로 시작하여 답변 제공. 키워드를 마무리 부분에 재강조. 학원의 합격률과 학생들의 실력 향상 사례 언급. 영문 전공명 병기로 국제적 맥락 제공 (450-550자)"
        },
        tone: "친근하고 감정적인 어조로, 실제 경험을 직접적으로 드러내지 않고도 공감과 정보를 전달하는 방식. 짧은 문장과 긴 문장을 혼용하여 리듬감 조성. 강조 표현과 구어체를 적절히 섞어 단조로움 방지. 학원의 전문성과 학생 성과를 자연스럽게 어필. 각 질문을 명확히 구분하여 읽기 편하게 구성.",
        format: "각 문단마다 '◆ Q1:', '◆ Q2:', '◆ Q3:' 형태로 질문을 명시하고 그에 대한 답변을 제공. 영문 전공명 병기. 키워드 SEO 배치(질문/답변 전반). 학원의 실무 경험과 성과 언급. 감사인사와 추천 메시지는 포함하지 않음.",
        examples: "주제에서 파생된 3가지 주요 질문과 그에 대한 친근한 답변, 정보와 공감이 어우러진 설명, 다양한 문장 구조, 학원의 교육 성과 사례"
      },
      general: {
        structure: {
          paragraph1: "독자 참여 질문으로 시작 - '여러분은 ~인가요?' 등으로 시작하고, 키워드를 인사말에 자연스럽게 포함. 소제목을 포함하여 친근한 인사와 주제 소개. 학원의 전문성을 간접적으로 어필. 짧은 문장과 긴 문장 혼용으로 리듬감 조성 (300-350자)",
          paragraph2: "흥미롭고 친근한 설명 - 키워드를 본문 중간에 반복 배치. 소제목을 포함하여 시각적 묘사, 개인적 견해, 쉬운 설명 제공. 학원의 교육 방식과 학생들의 성장 스토리 언급. 강조 표현과 구어체 적절히 활용. 영문 전공명 병기 (350-400자)",
          paragraph3: "독자 참여 유도 마무리 - 키워드를 마무리에 재강조하여 SEO 효과 극대화. 학원의 차별화된 서비스와 개별 맞춤 지도 어필. 이모지 사용, 소제목을 포함하여 질문 던지기, 팔로우 유도. 다양한 문장 구조로 단조로움 방지 (250-300자)"
        },
        tone: "친구가 대화하듯 친근하고 편안한 톤. 짧은 문장과 긴 문장을 혼용하여 리듬감 조성. 강조 표현과 구어체를 적절히 섞어 단조로움 방지. 학원의 따뜻한 교육 철학과 학생 중심 접근법을 자연스럽게 어필. 각 문단 내에 소제목을 포함하여 읽기 편하게 구성. 독자와의 소통을 중시하며 흥미로운 스토리텔링 방식.",
        format: "독자 질문으로 시작, 이모지 적극 활용 (🧘🏻‍♀️, 💭, 📍), 각 문단 내에 소제목 포함, 영문 전공명 병기, 키워드 SEO 배치(시작/중간/마무리), 학원의 교육 성과와 학생 케어 시스템 언급, 댓글 참여 유도, 팔로우 유도 멘트",
        examples: "개인적 경험담, 흥미로운 이야기, 시각적 설명, 독자와의 소통, 다양한 문장 구조, 학원의 교육 철학과 성과 사례"
      }
    };

    const selectedType = contentTypePrompts[contentType as keyof typeof contentTypePrompts];
    
    const structuredPrompt = `
당신은 한국의 예술/디자인 유학 전문 학원에서 블로그 콘텐츠를 작성하는 전문가입니다.
네이버 블로그 SEO 최적화와 학원 홍보를 위한 콘텐츠를 작성해주세요.

**SEO 키워드 최적화 전략:**
- 선택된 키워드들을 문장 서두, 중간, 결론 부분에 자연스럽게 반복 배치
- 예: "미국 디자인스쿨 편입 포트폴리오 수업"과 같은 키워드 조합을 각 문단에서 변형하여 사용
- 키워드 밀도를 높이되 자연스러운 문맥 유지

**학원 어필 포인트:**
- 실제 합격 사례와 성공률 데이터 언급
- 학생들의 실력 향상과 성장 스토리 포함
- 차별화된 커리큘럼과 개인별 맞춤 지도 방식 강조
- 전문 강사진의 실무 경험과 업계 네트워크 어필
- 체계적인 학생 관리 시스템과 사후 관리 서비스 언급

**카테고리:** ${category}
**선택된 키워드:** ${keywordString}
**콘텐츠 타입:** ${contentType}
**사용자 프롬프트:** ${prompt}

**콘텐츠 타입별 요구사항:**
${JSON.stringify(selectedType, null, 2)}

**출력 형식:**
반드시 다음 JSON 형식으로 응답해주세요:
{
  "title": "SEO 최적화된 제목 (키워드 포함, 30자 이내)",
  "paragraph1": "첫 번째 문단의 실제 내용",
  "paragraph2": "두 번째 문단의 실제 내용",
  "paragraph3": "세 번째 문단의 실제 내용",
  "images": ["이미지 설명 1", "이미지 설명 2", "이미지 설명 3", "이미지 설명 4", "이미지 설명 5"],
  "hashtags": [
    "#해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5",
    "#해시태그6", "#해시태그7", "#해시태그8", "#해시태그9", "#해시태그10"
  ]
}

**중요 지침:**
1. 키워드를 각 문단에서 자연스럽게 반복하여 SEO 효과 극대화
2. 학원의 전문성과 실제 성과를 구체적으로 어필
3. 문장 구조를 다양화하여 읽기 쉽게 작성
4. 네이버 블로그 특성에 맞는 친근하고 유용한 정보 제공
5. 선택된 콘텐츠 타입의 톤과 형식을 정확히 준수
`;

    const enhancedPrompt = structuredPrompt;

    // Initialize the Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate content
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    try {
      // Clean up the response text to extract JSON
      let jsonText = text.trim();
      
      // Remove any markdown code block markers
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON content between braces
      const jsonStart = jsonText.indexOf('{');
      const jsonEnd = jsonText.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd);
      }
      
      const structuredContent = JSON.parse(jsonText);
      
      // Validate required fields
      if (!structuredContent.title || !structuredContent.paragraph1 || !structuredContent.paragraph2 || !structuredContent.paragraph3 || !structuredContent.images || !structuredContent.hashtags) {
        throw new Error('Missing required fields in structured content');
      }
      
      return NextResponse.json({
        title: structuredContent.title,
        paragraph1: structuredContent.paragraph1,
        paragraph2: structuredContent.paragraph2,
        paragraph3: structuredContent.paragraph3,
        images: structuredContent.images,
        hashtags: structuredContent.hashtags
      });
      
    } catch (parseError) {
      console.error('JSON parsing failed, returning raw text:', parseError);
      
      // Fallback to raw text if JSON parsing fails
      return NextResponse.json({ 
        content: text,
        isStructured: false,
        error: 'Structured parsing failed, showing raw content'
      });
    }
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getTrainingStatus, initializeAutoTraining } from '@/lib/auto-training';

// GET: 학습 상태 조회
export async function GET() {
  try {
    const status = getTrainingStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('학습 상태 조회 오류:', error);
    return NextResponse.json({ 
      error: '학습 상태 조회 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}

// POST: 수동으로 자동 학습 재실행
export async function POST() {
  try {
    await initializeAutoTraining();
    const status = getTrainingStatus();
    return NextResponse.json({
      message: '자동 학습이 완료되었습니다.',
      ...status
    });
  } catch (error) {
    console.error('수동 학습 실행 오류:', error);
    return NextResponse.json({ 
      error: '수동 학습 실행 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 
import jobsData from '@/data/jobs_data.json';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json(jobsData);
  } catch (error) {
    console.error('Error loading jobs data:', error);
    return NextResponse.json(
      { error: 'Failed to load jobs data' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = 'https://app.crossroads.ai/api/v2/';
const API_KEY = '7c68c616-a0d3-4c2e-a653-c649debfd541';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const campaignId = searchParams.get('campaignId');

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Endpoint is required' },
      { status: 400 },
    );
  }

  try {
    const url = `${API_BASE_URL}${endpoint}?key=${API_KEY}${
      campaignId ? `&campaign_ids=${campaignId}` : ''
    }`;

    const response = await axios.get(url);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Error in proxy:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: error.response?.status || 500 },
    );
  }
}

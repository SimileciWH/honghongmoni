import { GET as dailyEmailGET } from '../daily-email/route'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return dailyEmailGET(request)
}

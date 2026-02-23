import { NextRequest, NextResponse } from 'next/server'
import { runInterestJob } from '@/lib/interest-job'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession()

        // In a real app, check for admin role here
        // For this demo, we allow the request if authenticated
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const results = await runInterestJob()

        return NextResponse.json({
            message: `Interest credited successfully to ${results.length} accounts.`,
            details: results
        })

    } catch (error: any) {
        console.error("Interest credit error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET - fetch the current user's account info
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const account = await prisma.account.findFirst({
            where: { userId: (session.user as any).id }
        })
        if (!account) {
            return NextResponse.json({ error: "No account found" }, { status: 404 })
        }
        return NextResponse.json({ account })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH - toggle card freeze status (block/unblock)
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const { action } = await req.json()
        const account = await prisma.account.findFirst({
            where: { userId: (session.user as any).id }
        })
        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 })
        }

        if (action === 'toggleFreeze') {
            const updated = await prisma.account.update({
                where: { id: account.id },
                data: { isFrozen: !account.isFrozen }
            })
            return NextResponse.json({
                success: true,
                isFrozen: updated.isFrozen,
                message: updated.isFrozen ? "Card blocked successfully." : "Card unblocked successfully."
            })
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

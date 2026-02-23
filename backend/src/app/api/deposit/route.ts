import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { BankingEngine } from "@/lib/banking"

// POST /api/deposit - Add money to user's own account (top-up for testing)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const { amount } = await req.json()
        if (!amount || amount <= 0 || amount > 1000000) {
            return NextResponse.json({ error: "Amount must be between ₹1 and ₹10,00,000." }, { status: 400 })
        }

        const account = await prisma.account.findFirst({
            where: { userId: (session.user as any).id }
        })
        if (!account) {
            return NextResponse.json({ error: "No account found." }, { status: 404 })
        }

        const result = await BankingEngine.deposit(account.id, amount, "Self deposit / top-up")
        return NextResponse.json({
            success: true,
            balance: result.account.balance,
            reference: result.transaction.reference,
            message: `₹${amount.toLocaleString('en-IN')} added to your account.`
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

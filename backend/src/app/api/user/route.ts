import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET - full user profile
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                kycStatus: true,
                biometricEnabled: true,
                isLocked: true,
                failedAttempts: true,
                createdAt: true,
                accounts: {
                    select: {
                        id: true,
                        type: true,
                        accountNumber: true,
                        balance: true,
                        isFrozen: true,
                        createdAt: true,
                    }
                },
                loans: {
                    select: {
                        id: true,
                        type: true,
                        amount: true,
                        interestRate: true,
                        tenureMonths: true,
                        status: true,
                        emiAmount: true,
                        remainingAmt: true,
                    }
                }
            }
        })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        return NextResponse.json({ user })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

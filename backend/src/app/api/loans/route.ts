import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET - fetch user's loans
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const loans = await prisma.loan.findMany({
            where: { userId: (session.user as any).id },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json({ loans })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST - apply for a new loan
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const { type, amount, tenureMonths } = await req.json()

        const validTypes = ['PERSONAL', 'HOME', 'CAR', 'EDUCATION', 'BUSINESS']
        if (!type || !validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid loan type." }, { status: 400 })
        }
        if (!amount || amount < 10000 || amount > 10000000) {
            return NextResponse.json({ error: "Loan amount must be between ₹10,000 and ₹1,00,00,000." }, { status: 400 })
        }
        if (!tenureMonths || ![12, 24, 36, 48, 60, 84, 120].includes(tenureMonths)) {
            return NextResponse.json({ error: "Invalid tenure." }, { status: 400 })
        }

        // Check if user is KYC verified
        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            select: { kycStatus: true }
        })
        if (!user?.kycStatus) {
            return NextResponse.json({ error: "KYC verification is required before applying for a loan." }, { status: 403 })
        }

        // Interest rates by loan type
        const rates: Record<string, number> = {
            PERSONAL: 12.5,
            HOME: 8.5,
            CAR: 9.0,
            EDUCATION: 7.5,
            BUSINESS: 14.0,
        }
        const interestRate = rates[type]
        const monthlyRate = interestRate / 100 / 12
        // EMI formula: P × r × (1+r)^n / ((1+r)^n - 1)
        const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
            (Math.pow(1 + monthlyRate, tenureMonths) - 1)

        const loan = await prisma.loan.create({
            data: {
                userId: (session.user as any).id,
                type,
                amount,
                interestRate,
                tenureMonths,
                emiAmount: Math.round(emi),
                remainingAmt: amount,
                status: 'PENDING',
            }
        })

        await prisma.auditLog.create({
            data: {
                userId: (session.user as any).id,
                action: `LOAN_APPLIED_${type}`,
                ipAddress: "system",
                userAgent: "web-client",
            }
        })

        return NextResponse.json({
            success: true,
            loan,
            message: `Loan application for ₹${amount.toLocaleString('en-IN')} submitted successfully! EMI: ₹${Math.round(emi).toLocaleString('en-IN')}/month`
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

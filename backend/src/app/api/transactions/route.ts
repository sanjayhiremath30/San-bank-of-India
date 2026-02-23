import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { BankingEngine } from "@/lib/banking"
import { FraudDetectionService } from "@/lib/fraud"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { targetAccountNumber, amount, type, description } = await req.json()

        if (!targetAccountNumber || !amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid transfer details" }, { status: 400 })
        }

        // 1. Get user's primary account
        const userAccount = await prisma.account.findFirst({
            where: { userId: (session.user as any).id }
        })

        if (!userAccount) {
            return NextResponse.json({ error: "No source account found" }, { status: 404 })
        }

        // 2. Get target account
        const targetAccount = await prisma.account.findUnique({
            where: { accountNumber: targetAccountNumber }
        })

        // 3. AI Fraud Check
        const fraudAnalysis = await FraudDetectionService.analyzeTransaction({
            userId: (session.user as any).id,
            amount,
            type: targetAccount ? "INTERNAL_TRANSFER" : "EXTERNAL_TRANSFER",
            sourceAccountId: userAccount.id
        })

        if (fraudAnalysis.riskScore > 85) {
            await FraudDetectionService.logFraudAttempt({
                userId: (session.user as any).id,
                riskScore: fraudAnalysis.riskScore,
                reason: fraudAnalysis.reason
            })
            return NextResponse.json({
                error: "Transaction flagged as suspicious. Please contact security.",
                riskScore: fraudAnalysis.riskScore
            }, { status: 403 })
        }

        let transaction;
        if (targetAccount) {
            // Internal Transfer
            transaction = await BankingEngine.transfer({
                sourceAccountId: userAccount.id,
                targetAccountId: targetAccount.id,
                amount,
                type: "INTERNAL_TRANSFER",
                description
            })
        } else {
            // EXTERNAL TRANSFER - deduct from source using BankingEngine to enforce rules
            const result = await BankingEngine.withdraw(
                userAccount.id,
                amount,
                description || `External transfer to ${targetAccountNumber}`
            )
            transaction = result.transaction
            // Update the reference to reflect external transfer
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    reference: `EXT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
                }
            })
        }

        // 4. Create a notification for the user
        await prisma.notification.create({
            data: {
                userId: (session.user as any).id,
                title: "Transaction Successful",
                message: `You sent ₹${amount.toLocaleString('en-IN')} to ${targetAccount ? 'SAN Bank account' : 'external account'} ${targetAccountNumber}.`,
                type: "SUCCESS",
            }
        })


        // 5. Log activity if moderately risky
        if (fraudAnalysis.riskScore > 30) {
            await FraudDetectionService.logFraudAttempt({
                userId: (session.user as any).id,
                transactionId: transaction.id,
                riskScore: fraudAnalysis.riskScore,
                reason: fraudAnalysis.reason
            })
        }

        return NextResponse.json({
            message: "Transfer successful",
            transactionId: transaction.id,
            reference: transaction.reference
        })

    } catch (error: any) {
        console.error("Transfer error:", error)
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { BankingEngine } from "@/lib/banking"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
    try {
        const { email, password, name, accountType } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        const type = accountType === "CURRENT" ? "CURRENT" : "SAVINGS"

        // Define account defaults
        const accountDefaults = type === "SAVINGS" ? {
            minimumBalance: 1000,
            dailyLimit: 50000,
            interestRate: 0.04
        } : {
            minimumBalance: 0,
            dailyLimit: 200000,
            interestRate: 0
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user and initial account in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                }
            })

            const accountNumber = await BankingEngine.generateAccountNumber()

            const account = await tx.account.create({
                data: {
                    userId: user.id,
                    accountNumber,
                    type,
                    balance: 0,
                    ...accountDefaults
                }
            })

            return { user, account }
        })

        return NextResponse.json({
            message: "User registered successfully",
            userId: result.user.id,
            accountNumber: result.account.accountNumber
        }, { status: 201 })

    } catch (error: any) {
        console.error("Registration error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

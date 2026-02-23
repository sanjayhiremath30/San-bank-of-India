import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

// POST - set / change transaction PIN
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    try {
        const { pin, currentPin } = await req.json()
        if (!pin || !/^\d{4}$/.test(pin)) return NextResponse.json({ error: "PIN must be exactly 4 digits." }, { status: 400 })

        const user = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { transactionPin: true } })

        // If PIN already set, require current PIN to change
        if (user?.transactionPin && currentPin) {
            const valid = await bcrypt.compare(currentPin, user.transactionPin)
            if (!valid) return NextResponse.json({ error: "Current PIN is incorrect." }, { status: 403 })
        }

        const hashed = await bcrypt.hash(pin, 10)
        await prisma.user.update({ where: { id: (session.user as any).id }, data: { transactionPin: hashed } })

        // Create a notification
        await prisma.notification.create({
            data: {
                userId: (session.user as any).id,
                title: "Transaction PIN Updated",
                message: "Your 4-digit transaction PIN has been set successfully.",
                type: "SUCCESS",
                link: "/security"
            }
        })
        return NextResponse.json({ success: true, message: "PIN set successfully!" })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT - verify PIN (returns ok: true/false without revealing hash)
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    try {
        const { pin } = await req.json()
        const user = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { transactionPin: true } })
        if (!user?.transactionPin) return NextResponse.json({ hasPIN: false })

        const valid = await bcrypt.compare(pin, user.transactionPin)
        return NextResponse.json({ hasPIN: true, valid })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// GET - check whether user has a PIN set
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { transactionPin: true } })
    return NextResponse.json({ hasPIN: !!user?.transactionPin })
}

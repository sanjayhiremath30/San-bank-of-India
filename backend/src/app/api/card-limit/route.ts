import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// PATCH - update card spending limits
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    try {
        const { dailyLimit, monthlyLimit } = await req.json()
        if (dailyLimit === undefined && monthlyLimit === undefined) return NextResponse.json({ error: "Provide at least one limit." }, { status: 400 })
        if (dailyLimit !== undefined && (dailyLimit < 1000 || dailyLimit > 200000)) return NextResponse.json({ error: "Daily limit must be between ₹1,000 and ₹2,00,000." }, { status: 400 })
        if (monthlyLimit !== undefined && (monthlyLimit < 1000 || monthlyLimit > 1000000)) return NextResponse.json({ error: "Monthly limit must be between ₹1,000 and ₹10,00,000." }, { status: 400 })

        const account = await prisma.account.findFirst({ where: { userId: (session.user as any).id } })
        if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 })

        const updated = await prisma.account.update({
            where: { id: account.id },
            data: {
                ...(dailyLimit !== undefined && { dailyLimit }),
                ...(monthlyLimit !== undefined && { monthlyLimit }),
            }
        })

        await prisma.notification.create({
            data: {
                userId: (session.user as any).id,
                title: "Card Limits Updated",
                message: `Your card limits have been updated. Daily: ₹${(dailyLimit ?? account.dailyLimit).toLocaleString('en-IN')}, Monthly: ₹${(monthlyLimit ?? account.monthlyLimit).toLocaleString('en-IN')}.`,
                type: "INFO",
            }
        })

        return NextResponse.json({ success: true, account: updated, message: "Card limits updated successfully!" })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

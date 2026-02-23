import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET - fetch all notifications for the user
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: (session.user as any).id },
            orderBy: { createdAt: 'desc' },
            take: 30
        })
        const unreadCount = notifications.filter(n => !n.read).length
        return NextResponse.json({ notifications, unreadCount })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH - mark notifications as read
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    try {
        const { id, markAll } = await req.json()
        if (markAll) {
            await prisma.notification.updateMany({
                where: { userId: (session.user as any).id, read: false },
                data: { read: true }
            })
        } else if (id) {
            await prisma.notification.update({ where: { id }, data: { read: true } })
        }
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

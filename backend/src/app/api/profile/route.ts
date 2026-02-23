import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// PATCH - update user profile
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const { name, phone } = await req.json()
        if (!name || name.trim().length < 2) {
            return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 })
        }
        const updated = await prisma.user.update({
            where: { id: (session.user as any).id },
            data: { name: name.trim() }
        })
        return NextResponse.json({ success: true, name: updated.name })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// POST /api/kyc - Update KYC status
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const { aadhaar, pan, dob, address } = await req.json()

        if (!aadhaar || !pan || !dob || !address) {
            return NextResponse.json({ error: "All fields are required: Aadhaar, PAN, Date of Birth, Address." }, { status: 400 })
        }
        if (!/^\d{12}$/.test(aadhaar.replace(/\s/g, ''))) {
            return NextResponse.json({ error: "Aadhaar number must be 12 digits." }, { status: 400 })
        }
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
            return NextResponse.json({ error: "Invalid PAN format (e.g. ABCDE1234F)." }, { status: 400 })
        }

        // Mark KYC as verified
        await prisma.user.update({
            where: { id: (session.user as any).id },
            data: { kycStatus: true }
        })

        // Log in audit
        await prisma.auditLog.create({
            data: {
                userId: (session.user as any).id,
                action: "KYC_VERIFIED",
                ipAddress: "system",
                userAgent: "web-client",
            }
        })

        return NextResponse.json({ success: true, message: "KYC verified successfully! Your account is now fully verified." })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

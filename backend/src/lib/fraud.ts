import prisma from './prisma'

export class FraudDetectionService {
    /**
     * Analyzes a transaction for potential fraud
     * Returns a risk score (0-100)
     */
    static async analyzeTransaction(params: {
        userId: string
        amount: number
        type: string
        sourceAccountId?: string
    }): Promise<{ riskScore: number; reason: string }> {
        const { userId, amount } = params
        let riskScore = 0
        let reasons: string[] = []

        // 1. Check for large amounts (Anomalies)
        if (amount > 1000000) { // Over 1M
            riskScore += 50
            reasons.push('High value transaction anomaly')
        } else if (amount > 100000) {
            riskScore += 20
            reasons.push('Large transaction amount')
        }

        // 2. Rapid Transfer Detection (Frequency)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
        const recentTxCount = await prisma.transaction.count({
            where: {
                sourceAccount: { userId: userId },
                createdAt: { gte: tenMinutesAgo }
            }
        })

        if (recentTxCount > 5) {
            riskScore += 40
            reasons.push('Rapid transaction frequency detected')
        }

        // 3. Round amount transactions (Common in fraud/testing)
        if (amount % 1000 === 0 && amount > 5000) {
            riskScore += 10
            reasons.push('suspicious round-number amount')
        }

        // 4. Night-time transactions (Optional heuristic)
        const hour = new Date().getHours()
        if (hour >= 1 && hour <= 4) {
            riskScore += 15
            reasons.push('Transaction during unusual hours (late night)')
        }

        // Cap risk score at 100
        riskScore = Math.min(riskScore, 100)

        return {
            riskScore,
            reason: reasons.length > 0 ? reasons.join(', ') : 'No suspicious patterns detected'
        }
    }

    /**
     * Logs a fraud alert if risk score is high
     */
    static async logFraudAttempt(params: {
        userId: string
        transactionId?: string
        riskScore: number
        reason: string
    }) {
        return await prisma.fraudLog.create({
            data: {
                userId: params.userId,
                transactionId: params.transactionId,
                riskScore: params.riskScore,
                reason: params.reason,
                isFlagged: params.riskScore > 70
            }
        })
    }
}

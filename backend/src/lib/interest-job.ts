import prisma from './prisma'
import { BankingEngine } from './banking'

/**
 * Interest Calculation Job
 * This script credits monthly interest to all active Savings accounts.
 */
export async function runInterestJob() {
    console.log('[Interest Job] Starting interest calculation...')
    try {
        const results = await BankingEngine.calculateInterest()
        console.log(`[Interest Job] Successfully processed ${results.length} accounts.`)
        return results
    } catch (error) {
        console.error('[Interest Job] Error processing interest:', error)
        throw error
    }
}

// If run directly (e.g., node interest-job.js), execute the job
if (require.main === module) {
    runInterestJob()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err)
            process.exit(1)
        })
}

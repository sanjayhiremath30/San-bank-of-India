import prisma from './prisma'

export class BankingEngine {
    /**
     * Generates a unique account number
     */
    static async generateAccountNumber(): Promise<string> {
        const prefix = '62' // Sample bank prefix
        const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
        const accountNumber = prefix + random

        const existing = await prisma.account.findUnique({
            where: { accountNumber }
        })

        if (existing) return this.generateAccountNumber()
        return accountNumber
    }

    /**
     * Internal helper to validate if an account can perform an outgoing transaction
     */
    private static async validateTransaction(tx: any, account: any, amount: number) {
        const now = new Date()

        if (account.isFrozen) throw new Error('Account is frozen')

        // Reset daily amount if it's a new day
        let dailyTransferAmount = account.dailyTransferAmount
        if (!account.lastTransferDate ||
            new Date(account.lastTransferDate).toDateString() !== now.toDateString()) {
            dailyTransferAmount = 0
        }

        // Check Daily Limit
        if (dailyTransferAmount + amount > account.dailyLimit) {
            throw new Error(`Daily transfer limit of ₹${account.dailyLimit} exceeded. You have already transferred ₹${dailyTransferAmount} today.`)
        }

        // Check Minimum Balance (if SAVINGS)
        if (account.type === "SAVINGS" && (account.balance - amount) < account.minimumBalance) {
            throw new Error(`Savings account must maintain a minimum balance of ₹${account.minimumBalance}`)
        }

        if (account.balance < amount) {
            throw new Error('Insufficient funds')
        }

        return dailyTransferAmount
    }

    /**
     * Executes a transfer between two accounts with ACID compliance
     */
    static async transfer(params: {
        sourceAccountId: string
        targetAccountId: string
        amount: number
        type: string
        description?: string
    }) {
        const { sourceAccountId, targetAccountId, amount, type, description } = params
        const now = new Date()

        return await prisma.$transaction(async (tx) => {
            const sourceAccount = await tx.account.findUnique({ where: { id: sourceAccountId } })
            if (!sourceAccount) throw new Error('Source account not found')

            const currentDailyAmount = await this.validateTransaction(tx, sourceAccount, amount)

            const targetAccount = await tx.account.findUnique({ where: { id: targetAccountId } })
            if (!targetAccount) throw new Error('Target account not found')
            if (targetAccount.isFrozen) throw new Error('Target account is frozen')

            await tx.account.update({
                where: { id: sourceAccountId },
                data: {
                    balance: { decrement: amount },
                    dailyTransferAmount: currentDailyAmount + amount,
                    lastTransferDate: now
                }
            })

            await tx.account.update({
                where: { id: targetAccountId },
                data: { balance: { increment: amount } }
            })

            return await tx.transaction.create({
                data: {
                    reference: `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
                    amount, type, status: "COMPLETED", sourceAccountId, targetAccountId, description,
                }
            })
        })
    }

    /**
     * Deposits money into an account
     */
    static async deposit(accountId: string, amount: number, description?: string) {
        return await prisma.$transaction(async (tx) => {
            const account = await tx.account.update({
                where: { id: accountId },
                data: { balance: { increment: amount } }
            })

            const transaction = await tx.transaction.create({
                data: {
                    reference: `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
                    amount: amount,
                    type: "DEPOSIT",
                    status: "COMPLETED",
                    targetAccountId: accountId,
                    description,
                }
            })

            return { account, transaction }
        })
    }

    /**
     * Withdraws money from an account
     */
    static async withdraw(accountId: string, amount: number, description?: string) {
        const now = new Date()
        return await prisma.$transaction(async (tx) => {
            const account = await tx.account.findUnique({ where: { id: accountId } })
            if (!account) throw new Error('Account not found')

            const currentDailyAmount = await this.validateTransaction(tx, account, amount)

            const updatedAccount = await tx.account.update({
                where: { id: accountId },
                data: {
                    balance: { decrement: amount },
                    dailyTransferAmount: currentDailyAmount + amount,
                    lastTransferDate: now
                }
            })

            const transaction = await tx.transaction.create({
                data: {
                    reference: `WTH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
                    amount: amount,
                    type: "WITHDRAWAL",
                    status: "COMPLETED",
                    sourceAccountId: accountId,
                    description,
                }
            })

            return { account: updatedAccount, transaction }
        })
    }

    /**
     * Credits interest to all eligible SAVINGS accounts
     * This would typically be run by a scheduled job once per month
     */
    static async calculateInterest() {
        return await prisma.$transaction(async (tx) => {
            const accounts = await tx.account.findMany({
                where: {
                    type: "SAVINGS",
                    balance: { gt: 0 }
                }
            })

            const results = []
            const now = new Date()

            for (const account of accounts) {
                // Simplified monthly interest: balance * (annual_rate / 12)
                const interestAmount = account.balance * (account.interestRate / 12)

                if (interestAmount > 0.01) {
                    const updatedAccount = await tx.account.update({
                        where: { id: account.id },
                        data: {
                            balance: { increment: interestAmount },
                            lastInterestCredit: now
                        }
                    })

                    await tx.transaction.create({
                        data: {
                            reference: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
                            amount: interestAmount,
                            type: "INTEREST",
                            status: "COMPLETED",
                            targetAccountId: account.id,
                            description: `Monthly interest credit (${(account.interestRate * 100).toFixed(1)}% p.a.)`,
                        }
                    })

                    results.push({ accountId: account.id, amount: interestAmount })
                }
            }

            return results
        })
    }
}

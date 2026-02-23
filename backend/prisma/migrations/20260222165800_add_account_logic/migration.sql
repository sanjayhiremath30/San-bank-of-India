-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SAVINGS',
    "balance" REAL NOT NULL DEFAULT 0,
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "interestRate" REAL NOT NULL DEFAULT 0.04,
    "minimumBalance" REAL NOT NULL DEFAULT 1000,
    "dailyLimit" REAL NOT NULL DEFAULT 100000,
    "dailyTransferAmount" REAL NOT NULL DEFAULT 0,
    "lastTransferDate" DATETIME,
    "lastInterestCredit" DATETIME,
    "monthlyLimit" REAL NOT NULL DEFAULT 1000000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("accountNumber", "balance", "createdAt", "dailyLimit", "id", "isFrozen", "monthlyLimit", "type", "updatedAt", "userId") SELECT "accountNumber", "balance", "createdAt", "dailyLimit", "id", "isFrozen", "monthlyLimit", "type", "updatedAt", "userId" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_accountNumber_key" ON "Account"("accountNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

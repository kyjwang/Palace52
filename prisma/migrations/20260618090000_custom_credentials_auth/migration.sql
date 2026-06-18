-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Suit" AS ENUM ('CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES');

-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING');

-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('FULL_DECK', 'SPEED', 'SUIT_FOCUS', 'PAO_FLASHCARD', 'RANDOM_POSITION', 'REVIEW', 'HALF_DECK');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MistakeType" AS ENUM ('CORRECT', 'WRONG_CARD', 'WRONG_POSITION', 'MISSING', 'EXTRA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "avatarColor" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Palace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Palace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PalaceLocation" (
    "id" TEXT NOT NULL,
    "palaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "cue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PalaceLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardImage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rank" "Rank" NOT NULL,
    "suit" "Suit" NOT NULL,
    "person" TEXT,
    "action" TEXT,
    "object" TEXT,
    "imagePrompt" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "palaceId" TEXT,
    "mode" "SessionMode" NOT NULL DEFAULT 'FULL_DECK',
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "deck" JSONB NOT NULL,
    "deckSize" INTEGER,
    "selectedSuit" "Suit",
    "difficulty" TEXT,
    "generatedDeck" JSONB,
    "userRecall" JSONB,
    "questionPositions" JSONB,
    "userAnswers" JSONB,
    "recall" JSONB,
    "score" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "memorizationMs" INTEGER,
    "recallMs" INTEGER,
    "totalTimeMs" INTEGER,
    "mistakes" JSONB,
    "isValidRun" BOOLEAN NOT NULL DEFAULT true,
    "isPersonalBest" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionCardResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "expectedRank" "Rank" NOT NULL,
    "expectedSuit" "Suit" NOT NULL,
    "recalledRank" "Rank",
    "recalledSuit" "Suit",
    "expectedIndex" INTEGER NOT NULL,
    "recalledIndex" INTEGER,
    "isCorrect" BOOLEAN NOT NULL,
    "mistakeType" "MistakeType" NOT NULL,
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionCardResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rank" "Rank" NOT NULL,
    "suit" "Suit" NOT NULL,
    "intervalDays" INTEGER NOT NULL DEFAULT 1,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "mode" "SessionMode" NOT NULL,
    "score" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "memorizationMs" INTEGER,
    "recallMs" INTEGER,
    "totalTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Palace_userId_idx" ON "Palace"("userId");

-- CreateIndex
CREATE INDEX "PalaceLocation_palaceId_idx" ON "PalaceLocation"("palaceId");

-- CreateIndex
CREATE UNIQUE INDEX "PalaceLocation_palaceId_order_key" ON "PalaceLocation"("palaceId", "order");

-- CreateIndex
CREATE INDEX "CardImage_userId_idx" ON "CardImage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CardImage_userId_rank_suit_key" ON "CardImage"("userId", "rank", "suit");

-- CreateIndex
CREATE INDEX "TrainingSession_userId_createdAt_idx" ON "TrainingSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingSession_mode_status_score_idx" ON "TrainingSession"("mode", "status", "score");

-- CreateIndex
CREATE INDEX "SessionCardResult_sessionId_idx" ON "SessionCardResult"("sessionId");

-- CreateIndex
CREATE INDEX "SessionCardResult_expectedRank_expectedSuit_idx" ON "SessionCardResult"("expectedRank", "expectedSuit");

-- CreateIndex
CREATE INDEX "ReviewCard_userId_dueAt_idx" ON "ReviewCard"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewCard_userId_rank_suit_key" ON "ReviewCard"("userId", "rank", "suit");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_sessionId_key" ON "LeaderboardEntry"("sessionId");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_mode_score_accuracy_idx" ON "LeaderboardEntry"("mode", "score", "accuracy");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_userId_idx" ON "LeaderboardEntry"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Palace" ADD CONSTRAINT "Palace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PalaceLocation" ADD CONSTRAINT "PalaceLocation_palaceId_fkey" FOREIGN KEY ("palaceId") REFERENCES "Palace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardImage" ADD CONSTRAINT "CardImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_palaceId_fkey" FOREIGN KEY ("palaceId") REFERENCES "Palace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionCardResult" ADD CONSTRAINT "SessionCardResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewCard" ADD CONSTRAINT "ReviewCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

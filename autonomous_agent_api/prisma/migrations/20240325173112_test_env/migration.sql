-- CreateTable
CREATE TABLE "Test_Post" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Test_Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test_User" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Test_User_pkey" PRIMARY KEY ("id")
);

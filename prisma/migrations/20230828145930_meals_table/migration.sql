-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date_time" DATETIME NOT NULL,
    "is_on_diet" BOOLEAN NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "meals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

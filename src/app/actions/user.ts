"use server";

import { getDb } from "@/lib/mongodb";

export async function saveUserToDb(uid: string, email: string | null) {
  const db = await getDb();
  const users = db.collection("user");

  await users.updateOne(
    { uid },
    {
      $set: {
        email: email ?? "",
        lastLoginAt: new Date(),
      },
      $setOnInsert: {
        uid,
        credits: 0,
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
}

import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { postsTable } from "./db/schema";
import * as dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
    const post: typeof postsTable.$inferInsert = {
        title: "My first post",
        content: "This is my first post",
        tag: "test",
    };

    await db.insert(postsTable).values(post);
    console.log("New post created!");

    const posts = await db.select().from(postsTable);
    console.log("Getting all posts from the database: ", posts);
    /*
  const posts: {
    id: number;
    title: string;
    content: string;
    tag: string;
  }[]
  */

    await db
        .update(postsTable)
        .set({
            title: "My updated post",
        })
        .where(eq(postsTable.tag, post.tag));
    console.log("Post info updated!");

    await db.delete(postsTable).where(eq(postsTable.tag, post.tag));
    console.log("Post deleted!");
}

main();

export default db;

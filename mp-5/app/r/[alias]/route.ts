
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI!);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ alias: string }> }
) {
  try {
    const { alias } = await params;

    const db = client.db("urlShortener");
    const collection = db.collection("urls");

    const result = await collection.findOne({ alias });

    if (!result) {
      return Response.json(
        { error: "Alias not found" },
        { status: 404 }
      );
    }

    return Response.redirect(result.url, 307);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

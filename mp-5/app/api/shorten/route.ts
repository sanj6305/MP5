import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI!;

if (!uri) {
  throw new Error("MONGO_URI environment variable is not defined");
}

const client = new MongoClient(uri);

export async function POST(request: Request) {
  const { url, alias } = await request.json();

  try {
    //handling invalid urls
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
        } catch {
        return Response.json(
            { error: "Invalid URL" },
            { status: 400 }
        );
        }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return Response.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    //validating and normalizing alias
    if (typeof alias !== "string") {
        return Response.json(
            { error: "Invalid alias" },
            { status: 400 }
            );
    }
    
    const normalizedAlias = alias.toLowerCase();
    if (normalizedAlias.length < 3 || normalizedAlias.length > 20) {
      return Response.json(
        { error: "Alias must be between 3 and 20 characters" },
        { status: 400 }
      );
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(normalizedAlias)) {
      return Response.json(
        { error: "Alias can only contain letters, numbers, hyphens, and underscores" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("urlShortener");
    const collection = db.collection("urls");

    // Check for duplicate alias
    const existingAlias = await collection.findOne({ alias });
    if (existingAlias) {
      return Response.json(
        { error: "Alias already exists" },
        { status: 409}
      );
    }

    await collection.insertOne({ url, alias });

    return Response.json(
      { success: true, shortUrl: `${new URL(request.url).origin}/r/${normalizedAlias}` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } 
}
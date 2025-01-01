import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import Redis from "ioredis";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();
const redis = new Redis();
const PORT = 8080;

app.use(bodyParser.json());
app.use(cors());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});

app.use(limiter);

const BASE_URL = "http://localhost:8080";

// POST /shorten
app.post("/shorten", async (req: Request, res: Response): Promise<void> => {
    try {
        const { url } = req.body;
        if (!url) {
            res.status(400).json({ error: "Missing field: url" });
            return;
        }
    
        // Check if URL already exists
        const existingKey = await redis.get(`url:${url}`);
        if (existingKey) {
            res.json({
                key: existingKey,
                long_url: url,
                short_url: `${BASE_URL}/${existingKey}`,
            });
        }
    
        // Generate a unique key
        const key = nanoid(6);
        const existingUrl = await redis.get(`key:${key}`);
    
        if (existingUrl) {
            res.status(500).json({ error: "Key collision. Try again." });
            return;
        }
    
        // Store mappings
        await redis.set(`url:${url}`, key);
        await redis.set(`key:${key}`, url);
    
        res.json({
            key,
            long_url: url,
            short_url: `${BASE_URL}/${key}`,
        });
    } catch (error) {
        res.status(500).json({ error: "Key collision. Try again." });
    }
});

// GET /:key
app.get("/:key", async (req: Request, res: Response): Promise<void> => {
    try {
        const { key } = req.params;
    
        // Fetch the original URL from Redis
        const url = await redis.get(`key:${key}`);
    
        if (!url) {
            // Return 404 for invalid keys
            res.status(404).json({ error: "URL not found" });
            return;
        }
    
        // Redirect to the original URL
        res.status(302).set("Location", url).send();
        return;
    } catch (error) {
        res.status(500).json({ error: "Try again...." });
    }
});

app.delete("/:key", async (req: Request, res: Response) => {
    const { key } = req.params;

    // Attempt to delete the key from Redis
    const result = await redis.del(`key:${key}`);

    if (result === 0) {
        // Key did not exist
        return res.status(200).send(); // No action required
    }

    // Successful deletion
    res.status(200).send();
});


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

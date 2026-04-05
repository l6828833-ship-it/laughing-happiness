import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./routes/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ── Middleware ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ── API Routes ──────────────────────────────────────────────────────────
  // All database operations go through /api — the React SPA calls these.
  app.use("/api", apiRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`✅ Quizoi server running on http://localhost:${port}/`);
    console.log(`   API available at http://localhost:${port}/api`);
    if (!process.env.DATABASE_URL) {
      console.warn(
        "\n⚠️  WARNING: DATABASE_URL is not set. API routes will fail.\n" +
          "   Add it to your .env file before starting the server.\n",
      );
    }
  });
}

startServer().catch(console.error);

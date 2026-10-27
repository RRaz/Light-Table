import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const PUBLIC_ROOT = path.join(process.cwd(), "public");
  const GALLERIES_ROOT = path.join(PUBLIC_ROOT, "galleries");

  // API to list all available galleries (in galleries subdirectory)
  app.get("/api/galleries", (req, res) => {
    try {
      const dirs = fs.readdirSync(GALLERIES_ROOT, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      res.json(dirs);
    } catch (err) {
      res.status(500).json({ error: "Failed to read galleries" });
    }
  });

  // API to list photos from any directory within /public/
  app.get("/api/photos/:galleryName", (req, res) => {
    try {
      const { galleryName } = req.params;
      // First try galleries subdirectory, then try directly in public
      let galleryPath = path.join(GALLERIES_ROOT, galleryName);
      
      if (!fs.existsSync(galleryPath)) {
        galleryPath = path.join(PUBLIC_ROOT, galleryName);
      }
      
      if (!fs.existsSync(galleryPath)) {
        return res.status(404).json({ error: "Gallery not found" });
      }

      const files = fs.readdirSync(galleryPath);
      const relativeGalleryPath = galleryPath.startsWith(GALLERIES_ROOT) ? `galleries/${galleryName}` : galleryName;
      const photos = files
        .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
        .map((file, index) => ({
          id: `${galleryName}-${index}`,
          url: `/content/${relativeGalleryPath}/${file}`,
          title: file.replace(/\.[^/.]+$/, ""),
          format: file.split('.').pop()?.toUpperCase() || 'IMG',
          resolution: 'High-Res',
          date: fs.statSync(path.join(galleryPath, file)).mtime.toISOString().split('T')[0]
        }));
      res.json(photos);
    } catch (err) {
      res.status(500).json({ error: "Failed to read gallery" });
    }
  });

  // Serve any content from /public/ directory root
  app.use("/content", express.static(path.join(process.cwd(), "public")));

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

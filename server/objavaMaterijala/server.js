const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const app = express();
const upload = multer({ dest: "uploads/" });

const cors = require("cors");
app.use(cors());

const serviceAccountKey = require("./service-account-key.json");

const driveAuth = new google.auth.GoogleAuth({
  keyFile: "./service-account-key.json",
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth: driveAuth });

const GOOGLE_DRIVE_FOLDER_ID = "1I9H0ooP32aYfxf30jwJscSvHoMGa70FK";

app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = path.join(__dirname, req.file.path);

  try {
    const response = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
        parents: [GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(filePath),
      },
    });

    fs.unlinkSync(filePath);

    res.status(200).send("File uploaded successfully");
  } catch (error) {
    console.error("Error uploading file:", error.message);
    res.status(500).send("Error uploading file");
  }
});

app.get("/files", async (req, res) => {
  try {
    const response = await drive.files.list({
      q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      fields: "files(id, name)",
    });

    res.status(200).json(response.data.files);
  } catch (error) {
    console.error("Error listing files:", error.message);
    res.status(500).send("Error fetching file list");
  }
});

app.get("/download/:id", async (req, res) => {
  const fileId = req.params.id;

  try {
    const fileMetadata = await drive.files.get({
      fileId,
      fields: "name, mimeType",
    });

    const fileName = fileMetadata.data.name;
    const mimeType = fileMetadata.data.mimeType;

    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", mimeType);

    response.data
      .on("end", () => console.log("File downloaded successfully"))
      .on("error", (err) => console.error("Error downloading file:", err))
      .pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error.message);
    res.status(500).send("Error downloading file");
  }
});

app.delete("/delete/:id", async (req, res) => {
  const fileId = req.params.id;

  try {
    await drive.files.delete({ fileId });
    res.status(200).send("File deleted successfully");
  } catch (error) {
    console.error("Error deleting file:", error.message);
    res.status(500).send("Error deleting file");
  }
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

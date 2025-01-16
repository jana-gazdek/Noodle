const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const app = express();
const upload = multer({ dest: "uploads/" });

const cors = require("cors");
app.use(cors());

app.set('trust proxy', 1);

const serviceAccountKey = require("./service-account-key.json");

const driveAuth = new google.auth.GoogleAuth({
  keyFile: "./service-account-key.json",
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth: driveAuth });

const GOOGLE_DRIVE_FOLDER_ID = "1I9H0ooP32aYfxf30jwJscSvHoMGa70FK";

const client = require("../connection.js");
client.connect();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

app.post("/upload", upload.single("file"), async (req, res) => {
  const { name, surname, googleId } = req.body;
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
      fields: 'id, size',
    });

    const razredres = await client.query(`SELECT razred FROM DJELATNIK WHERE djelatnik.djelatnikId = '$1'`, [googleId]);
    const razredi = razredres.rows[0].razred;
    const insertQueryLink = `insert into LINK(brojPregleda, autor, razred, datumObjave, linkTekst, repID) 
    values ($1, $2, $3, date_trunc('second', CURRENT_TIMESTAMP), $4, $5)`;
    const insertQueryDatoteka = `insert into DATOTEKA(veličina, linkTekst) values ($1, $2)`;
    const fileLink =
      'https://drive.google.com/file/d/' + response.data.id + '/view';

    const valuesLink = [
      '0',
      `${name} ${surname}`,
      razredi,
      fileLink,
      GOOGLE_DRIVE_FOLDER_ID,
    ];
    const fileSize = formatFileSize(response.data.size);
    const valuesDatoteka = [fileSize, fileLink];

    await client.query(insertQueryLink, valuesLink);
    await client.query(insertQueryDatoteka, valuesDatoteka);

    fs.unlinkSync(filePath);

    res.status(200).send("File uploaded successfully");
  } catch (error) {
    console.error("Error uploading file:", error.message);
    res.status(500).send("Error uploading file");
  }
});

app.post("/files", async (req, res) => {
  const { googleId } = req.body;
  try {
    const userResult = await client.query(`SELECT razred FROM UČENIK WHERE UČENIK.učenikId = $1`, [googleId]);
    const userRazred = userResult.rows[0].razred;

    const prikaz = await client.query(`SELECT REGEXP_REPLACE(linktekst, '^.*file/d/([^/]+)/.*$', '\\1') AS ids, razred FROM LINK`);
    const filteredLinks = prikaz.rows.filter(row => {
      const linkRazred = row["razred"].split(",");
      return linkRazred.includes(userRazred); 
    });
    const fileIds = filteredLinks.map(row => row.ids);
    const query = fileIds.map(id => `'${id}' in parents`).join(" or ");
    
    console.log(query);
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
      fields: "name, mimeType, id",
    });

    const fileName = fileMetadata.data.name;
    const mimeType = fileMetadata.data.mimeType;

    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    const updateDownloads = `update LINK set brojPregleda = (CAST(brojPregleda AS INT) + 1)::VARCHAR where linkTekst = $1`;
    const updateDownloadsValue = [
      'https://drive.google.com/file/d/' + fileMetadata.data.id + '/view',
    ];

    await client.query(updateDownloads, updateDownloadsValue);

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
    const deleteFile = await drive.files.get({
      fileId,
      fields: "id",
    });
    const deleteDatoteka = `delete from DATOTEKA where linkTekst = $1`;
    const deleteLink = `delete from LINK where linkTekst = $1`;
    const valuesDeleteDatotekaAndLink = [
      'https://drive.google.com/file/d/' + deleteFile.data.id + '/view',
    ];

    await client.query(deleteDatoteka, valuesDeleteDatotekaAndLink);
    await client.query(deleteLink, valuesDeleteDatotekaAndLink);

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

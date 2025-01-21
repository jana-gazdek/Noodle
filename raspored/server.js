const express = require('express');
const app = express();
const random = require('random');
const path = require('path');
const cors = require('cors');
app.use(cors());

const client = require('../server/connection.js');
client.connect();

async function generateSchedule(razred) {
    let tjedan = [[], [], [], [], []];

    try {
        const result = await client.query(
            `SELECT * FROM raspored WHERE razred = $1 ORDER BY dan, vrijeme`, [razred]);

        //console.log("Query result:", result.rows);

        result.rows.forEach((row) => {
            //console.log("Row data:", row);
            tjedan[row.dan - 1].push(`${row.imepredmet} [${row.oznaka}]`);
        });

        return tjedan;
    } catch (err) {
        console.error("Error fetching schedule:", err);
        return tjedan;
    }
}


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/schedule-data', async (req, res) => {
    const razred = '1C' //HARD CODED, promjeni
    try {
        const tjedan = await generateSchedule(razred);
        res.json({ original_tjedan: tjedan });
    } catch (err) {
        console.error("Error generating schedule:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(3006, () => {
    console.log("Server running on http://localhost:3006");
});
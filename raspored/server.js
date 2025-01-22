const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3001', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

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
            tjedan[row.dan - 1].push({text: `${row.imepredmet} [${row.oznaka}]`, vrijeme : row.vrijeme});
        });

        return tjedan;
    } catch (err) {
        console.error("Error fetching schedule:", err);
        return tjedan;
    }
}

async function generateScheduleProf(googleId) {
    let tjedan = [[], [], [], [], []];

    try {
        const result = await client.query(
            `SELECT r.terminId, r.razred, r.oznaka, r.imepredmet, r.školaid, r.dan, r.vrijeme 
                FROM djelatnik d 
                JOIN predaje p ON d.djelatnikid = p.djelatnikid 
                JOIN predmet p2 ON p.predmetid = p2.predmetid 
                JOIN raspored r ON r.imepredmet = p2.imepredmet
                WHERE d.djelatnikid = $1
                AND (
                    (r.imepredmet != 'Sat razrednika' AND d.razred LIKE '%' || r.razred || '%') 
                    OR 
                    (r.imepredmet = 'Sat razrednika' AND d.razrednik LIKE '%' || r.razred || '%')
                );`, [googleId]);

        //console.log("Query result:", result.rows);

        result.rows.forEach((row) => {
            //console.log("Row data:", row);
            tjedan[row.dan - 1].push({text: `${row.imepredmet} (${row.razred}) [${row.oznaka}]`, vrijeme : row.vrijeme});
        });

        return tjedan;
    } catch (err) {
        console.error("Error fetching schedule:", err);
        return tjedan;
    }
}

app.post('/schedule-data', async (req, res) => {
    const {razred} = req.body;
    try {
        const tjedan = await generateSchedule(razred);
        res.json({ original_tjedan: tjedan });
    } catch (err) {
        console.error("Error generating schedule:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/schedule-data-prof', async (req, res) => {
    const {googleId} = req.body;
    try {
        const tjedan = await generateScheduleProf(googleId);
        res.json({ original_tjedan: tjedan });
    } catch (err) {
        console.error("Error generating schedule:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(3006, () => {
    console.log("Server running on http://localhost:3006");
});
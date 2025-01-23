const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
app.use(cors({
    origin: 'https://noodle-frontend.onrender.com', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.set('trust proxy', 1);
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

app.post('/update-schedule-data'), async (req, res) => {
    const { dan, vrijeme, razred, imePredmet, labos } = req.body;
    try {
        await client.query(`UPDATE raspored SET labos = $1, imePredmet = $2 WHERE dan = $3 AND vrijeme = $4 AND razred = $5`, [labos, imePredmet, dan, vrijeme, razred]);
        res.json({ message: 'Termin ažuriran.' });
    } catch (err) {
        console.error("Greška pri ažuriranju termina:", err);
        res.status(500).json({ error: "Greška pri ažuriranju termina" });
    }
}

app.post('/free-profs'), async (req, res) => {
    const { dan, vrijeme, razred } = req.body;
    try {
        const slobodni = await client.query(`
            SELECT DISTINCT
            d.djelatnikID, k.ime || ' ' || k.prezime AS Profesor, 
            p.imePredmet, d.razred
            FROM korisnik k 
            NATURAL JOIN djelatnik d 
            NATURAL JOIN predaje pr 
            NATURAL JOIN predmet p 
            JOIN raspored r 
            ON r.imePredmet = p.imePredmet
            WHERE r.razred = $1 AND d.djelatnikID NOT IN (
            SELECT DISTINCT
            d1.djelatnikID 
            FROM korisnik k1 
            NATURAL JOIN djelatnik d1 
            NATURAL JOIN predaje pr1 
            NATURAL JOIN predmet p1 
            JOIN raspored r1
            ON r1.imePredmet = p1.imePredmet
            WHERE dan = $2 AND vrijeme = $3
            )
            AND (
            (r.imepredmet != 'Sat razrednika' AND d.razred LIKE '%' || r.razred || '%') 
            OR 
            (r.imepredmet = 'Sat razrednika' AND d.razrednik LIKE '%' || r.razred || '%'))
            order by d.djelatnikID`, [razred, dan, vrijeme]);
        const slobodniProf = slobodni.rows;
        res.json(slobodniProf);
    } catch (err) {
        console.error("Greška pri dohvaćivanju slobodnih profesora:", err);
        res.status(500).json({ error: "Greška pri dohvaćivanju slobodnih profesora" });
    }
}

app.listen(3006, () => {
    console.log("Server running on http://localhost:3006");
});

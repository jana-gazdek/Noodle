const express = require('express');
const app = express();
const random = require('random');
const path = require('path');
const cors = require('cors');
app.use(cors());

function listaPredmeta(predmetData) {
    const subjectsList = [];
    const predmetiSLab = [];

    predmetData.forEach(predmet => {
        if (predmet.godine.split(', ').includes('1') && predmet.smjer === 'informatički') {
            const totalHours = predmet.brojsatova + predmet.brojlab;
            for (let i = 0; i < totalHours; i++) {
                subjectsList.push(predmet.imepredmet);
            }
        }
        if (predmet.godine.split(', ').includes('1') && predmet.brojlab !== 0) {
            predmetiSLab.push(predmet.imepredmet);
        }
    });

    return { subjectsList, predmetiSLab };
}

function ispraviVjezbe(tjedan, predmetiSLab) {
    predmetiSLab.forEach(imePredmet => {
        for (let dan of tjedan) {
            const count = dan.filter(predmet => predmet === imePredmet).length;
            if (count === 1) {
                const index = dan.indexOf(imePredmet);
                if (index !== -1) {
                    dan[index] = `${imePredmet} - vježbe`;
                    break;
                }
            }
        }
    });
}

function transformTjedan(tjedan) {
    return tjedan.map(dan => {
        const n = dan.length;
        const shift = dan[n - 2] === dan[n - 3] ? 3 : 2;
        return dan.slice(-shift).concat(dan.slice(0, -shift));
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateSchedule() {
    const predmetData = [
        { imepredmet: 'Matematika', brojsatova: 4, brojlab: 1, godine: '1, 2', smjer: 'informatički' },
        { imepredmet: 'Matematika', brojsatova: 5, brojlab: 1, godine: '3, 4', smjer: 'informatički' },
        { imepredmet: 'Hrvatski jezik', brojsatova: 4, brojlab: 0, godine: '1, 2, 3, 4', smjer: 'informatički' },
        { imepredmet: 'Engleski jezik', brojsatova: 3, brojlab: 0, godine: '1, 2, 3, 4', smjer: 'informatički' },
        { imepredmet: 'Fizika', brojsatova: 2, brojlab: 1, godine: '1, 2, 3, 4', smjer: 'informatički' },
        { imepredmet: 'Kemija', brojsatova: 2, brojlab: 0, godine: '1, 2, 3, 4', smjer: 'informatički' },
        { imepredmet: 'Biologija', brojsatova: 2, brojlab: 0, godine: '1, 2, 3, 4', smjer: 'informatički' },
        { imepredmet: 'Geografija', brojsatova: 2, brojlab: 0, godine: '1, 2, 3, 4', smjer: 'informatički' },
        { imepredmet: 'Povijest', brojsatova: 2, brojlab: 0, godine: '1, 2, 3, 4', smjer: 'informatički' },
        { imepredmet: 'Informatika', brojsatova: 2, brojlab: 1, godine: '1, 2, 3, 4', smjer: 'informatički' },
        { imepredmet: 'TZK', brojsatova: 2, brojlab: 0, godine: '1, 2, 3, 4', smjer: 'informatički' },
        { imepredmet: 'Filozofija', brojsatova: 2, brojlab: 0, godine: '4', smjer: 'informatički' },
        { imepredmet: 'Logika', brojsatova: 1, brojlab: 0, godine: '3', smjer: 'informatički' },
        { imepredmet: 'Politika i gospodarstvo', brojsatova: 1, brojlab: 0, godine: '4', smjer: 'informatički' },
        { imepredmet: 'Latinski jezik', brojsatova: 2, brojlab: 0, godine: '1, 2', smjer: 'informatički' },
        { imepredmet: 'Vjeronauk', brojsatova: 1, brojlab: 0, godine: '1, 2, 3, 4', smjer: 'informatički' },
        { imepredmet: 'Psihologija', brojsatova: 1, brojlab: 0, godine: '3', smjer: 'informatički' },
        { imepredmet: 'Sociologija', brojsatova: 1, brojlab: 0, godine: '3', smjer: 'informatički' },
        { imepredmet: 'Glazbena umjetnost', brojsatova: 1, brojlab: 0, godine: '1, 2', smjer: 'informatički' },
        { imepredmet: 'Likovna Kultura', brojsatova: 1, brojlab: 0, godine: '1, 2', smjer: 'informatički' },
        { imepredmet: 'Sat razrednika', brojsatova: 1, brojlab: 0, godine: '1, 2, 3, 4', smjer: 'informatički' },
        { imepredmet: 'Sat razrednika', brojsatova: 1, brojlab: 0, godine: '1, 2, 3, 4', smjer: 'matematički' }
    ];

    let { subjectsList, predmetiSLab } = listaPredmeta(predmetData);
    const tjedan = [];
    let dan = [];

    while (subjectsList.length > 0) {
        if (dan.length < 7) {
            const randomIndex = Math.floor(Math.random() * subjectsList.length);
            const predmetPriv = subjectsList[randomIndex];
            if (dan.filter(p => p === predmetPriv).length < 2) {
                dan.push(predmetPriv);
                subjectsList.splice(randomIndex, 1);
            }
        } else {
            dan.sort();
            tjedan.push(dan);
            dan = [];
        }
    }

    if (dan.length > 0) {
        dan.sort();
        tjedan.push(dan);
    }

    ispraviVjezbe(tjedan, predmetiSLab);
    shuffle(tjedan);

    return tjedan;
}

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/schedule-data', (req, res) => {
    const tjedan = generateSchedule();
    res.json({
        original_tjedan: tjedan,
        new_tjedan: transformTjedan(tjedan)
    });
});

app.listen(3006, () => {
    console.log("Server running on http://localhost:3006");
});
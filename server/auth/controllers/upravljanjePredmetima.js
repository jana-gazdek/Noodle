const client = require('../../connection.js');

async function getDjelatnik(OIB) {
  const query = `
    SELECT *
    FROM DJELATNIK
    WHERE OIB = $1;
  `;

  try {
    const res = await client.query(query, [OIB]);
    if (res.rows.length > 0) {
      return res.rows[0];
    } else {
      return null;
    }
  } catch (err) {
    console.error('Greška pri dobavljanju iz baze:', err.stack);
    return null; 
  }
}

async function getAllSubjects(){
  try {
    const queryText = 'SELECT predmetID, imePredmet FROM PREDMET;';
    const result = await client.query(queryText);

    const subjects = result.rows.map(row => ({
      predmetID: row.predmetid,
      imePredmet: row.imepredmet
    }));

    return subjects;
  } catch (err) {
    console.error('Error executing getAllSubjects query:', err.stack);
    return [];
  }
}

async function predmetiDjelatnika(djelatnikID) {
  const query = `
    SELECT p.predmetID, p.imePredmet
    FROM DJELATNIK d
    JOIN predaje pj ON d.djelatnikID = pj.djelatnikID
    JOIN PREDMET p ON pj.predmetID = p.predmetID
    WHERE d.djelatnikID = $1;
  `;

  try {
    const res = await client.query(query, [djelatnikID]);
    if (res.rows.length > 0) {
      return res.rows.map(row => ({
        predmetID: row.predmetid,
        imePredmet: row.imepredmet
      }));
    } else {
      return [];
    }
  } catch (err) {
    console.error('Greška pri dobavljanju iz baze:', err.stack);
    return [];
  }
}

async function obrisiPredmeteDjelatnika(djelatnikID) {
  const deleteQuery = `DELETE FROM predaje WHERE djelatnikid = $1`;
  await client.query(deleteQuery, [djelatnikID]);
}

async function dodajPredmeteDjelatnika(djelatnikID, predmeti){
  if (predmeti && predmeti.length > 0) {
    for (const predmet of predmeti) {
      const insertQuery = `INSERT INTO predaje (djelatnikID, predmetID) VALUES ($1, $2)`;
      await client.query(insertQuery, [djelatnikID, predmet.predmetID]);
    }
  }
}

module.exports = {
  predmetiDjelatnika,
  getDjelatnik,
  obrisiPredmeteDjelatnika,
  dodajPredmeteDjelatnika,
  getAllSubjects
};

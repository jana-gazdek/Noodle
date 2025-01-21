const express = require('express');
const router = express.Router();
const client = require('../../connection.js');
const nodemailer = require('nodemailer');

router.post('/slanje-obavijesti', async (req, res) => {
  const { tekst, naslov, linkTekst, autor, razred, datumObjave } = req.body;
  const brojPregleda = 0;
  const repID = '1I9H0ooP32aYfxf30jwJscSvHoMGa70FK';

  try {
    // if(req.user){
    //   if (
    //     req.user.role !== 'profesor' && req.user.role !== 'satničar' && req.user.role !== 'admin') {
    //     return res.status(403).json({ error: 'Unauthorized' });
    //   }
    // }else{
    //   return res.status(403).json({ error: 'Unauthorized (nema user objekta)' });
    // }
    

    const insertQueryLink = `INSERT INTO LINK (brojPregleda, autor, razred, datumObjave, linkTekst, repID)
                             VALUES ($1, $2, $3, $4, $5, $6)`;
    const valuesLink = [brojPregleda, autor, razred, datumObjave, linkTekst, repID];
    await client.query(insertQueryLink, valuesLink);

    const insertQueryObavijest = `INSERT INTO OBAVIJEST (tekst, naslov, linkTekst)
                                  VALUES ($1, $2, $3)`;
    const valuesObavijest = [tekst, naslov, linkTekst];
    await client.query(insertQueryObavijest, valuesObavijest);

    res.status(201).json({ message: 'Obavijest successfully sent' });
  } catch (error) {
    console.error('Greška pri slanju obavijesti:', error);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'Duplicate entry for linkTekst' });
    }

    res.status(500).json({ error: 'Greška pri slanju obavijesti' });
  }
});

router.get('/ispis-obavijesti', async (req, res) => {
  try {
    const query = `
      SELECT 
        obavijest.tekst,
        obavijest.naslov,
        link.linkTekst,
        link.brojPregleda,
        link.autor,
        link.razred,
        link.datumObjave,
        link.repID,
        repozitorij.imeRep
      FROM 
        OBAVIJEST obavijest
      INNER JOIN 
        LINK link ON obavijest.linkTekst = link.linkTekst
      INNER JOIN 
        REPOZITORIJ repozitorij ON link.repID = repozitorij.repID
    `;

    const result = await client.query(query);

    res.status(200).json({
      message: 'Sve obavijesti uspješno dohvaćene',
      obavijesti: result.rows,
    });
  } catch (error) {
    console.error('Greška pri dohvaćanju obavijesti:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju obavijesti' });
  }
});

router.post('/ispis-obavijesti-razred', async (req, res) => {
  let razredi;
  if("razred" in req.body){
    razredi = req.body.razred
  }else if("razredi" in req.body){
    razredi = req.body.razredi
  }

  if (!razredi) {
    return res.status(400).json({ error: 'Razred je obavezan' });
  }

  try {
    const razrediArray = razredi.split(',').map(razred => razred.trim());
    const placeholders = razrediArray.map((_, index) => `$${index + 1}`).join(', ');
    const query = `
      SELECT 
        obavijest.tekst,
        obavijest.naslov,
        link.linkTekst,
        link.brojPregleda,
        link.autor,
        link.razred,
        link.datumObjave,
        link.repID,
        repozitorij.imeRep
      FROM 
        OBAVIJEST obavijest
      INNER JOIN 
        LINK link ON obavijest.linkTekst = link.linkTekst
      INNER JOIN 
        REPOZITORIJ repozitorij ON link.repID = repozitorij.repID
      WHERE 
        link.razred IN (${placeholders})
    `;

    const result = await client.query(query, razrediArray);

    res.status(200).json({
      message: 'Obavijesti za odabrani razred uspješno dohvaćene',
      obavijesti: result.rows,
    });
  } catch (error) {
    console.error('Greška pri dohvaćanju obavijesti za razred:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju obavijesti za razred' });
  }
});

router.post('/zasebna-obavijest', async (req, res) => {
  const { linkTekst } = req.body;

  if (!linkTekst) {
    return res.status(400).json({ error: 'linkTekst je obavezan' });
  }

  try {
    const preglediQuery = `
      UPDATE LINK
      SET brojPregleda = brojPregleda::INTEGER + 1
      WHERE linkTekst = $1
      RETURNING brojPregleda
    `;
    const preglediResult = await client.query(preglediQuery, [linkTekst]);

    if (preglediResult.rowCount === 0) {
      return res.status(404).json({ error: 'Obavijest nije pronađena' });
    }

    const query = `
      SELECT 
        obavijest.tekst,
        obavijest.naslov,
        link.linkTekst,
        link.brojPregleda,
        link.autor,
        link.razred,
        link.datumObjave,
        link.repID,
        repozitorij.imeRep
      FROM 
        OBAVIJEST obavijest
      INNER JOIN 
        LINK link ON obavijest.linkTekst = link.linkTekst
      INNER JOIN 
        REPOZITORIJ repozitorij ON link.repID = repozitorij.repID
      WHERE 
        obavijest.linkTekst = $1
    `;

    const result = await client.query(query, [linkTekst]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Obavijest nije pronađena' });
    }

    res.status(200).json({
      message: 'Obavijest uspješno dohvaćena',
      obavijest: result.rows[0],
    });
  } catch (error) {
    console.error('Greška pri dohvaćanju obavijesti:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju obavijesti' });
  }
});

module.exports = router;

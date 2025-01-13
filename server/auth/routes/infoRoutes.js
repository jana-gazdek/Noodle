const express = require('express');
const dayjs = require('dayjs');
const router = express.Router();
const Request = require('../models/Requests');
const hash = require('../controllers/hashPass.js')
const ConfirmedUser = require('../models/ConfirmedUser');
const User = require('../models/User');
const { google } = require("googleapis");
const client = require('../../../database/connection.js');
client.connect();

const serviceAccountKey = require("../../objavaMaterijala/service-account-key.json");

const driveAuth = new google.auth.GoogleAuth({
  keyFile: "../objavaMaterijala/service-account-key.json",
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth: driveAuth });

const GOOGLE_DRIVE_FOLDER_ID = "1I9H0ooP32aYfxf30jwJscSvHoMGa70FK";

function schoolYear(){
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const sYear = currentMonth >= 6 ? currentYear : currentYear - 1;
  return `${sYear}./${sYear + 1}.`;
}

// router.post('/test-hash', async(req, res) =>{
//   const {pass, hashPass} = req.body
//   console.log(pass, hashPass)
//   const result = await hash.checkPassword(pass, hashPass)
//   res.json(result)
// })

router.post('/submit-request', async (req, res) => {
  console.log('Request received at backend:', req.body);

  if (!req.body || !req.body.googleId) {
    return res.status(401).json({ error: 'User is not authenticated' });
  }

  const {
    name,
    surname,
    pass,
    email,
    OIB,
    spol,
    address,
    dateOfBirth,
    dateTimeOfRequest,
    primarySchool,
    role
  } = req.body;

  const hashedPass = await hash.hashPassword(pass);

  //console.log(hashedPass)

  try {
    const newRequest = new Request({
      _id: req.body.googleId,
      name,
      surname,
      email,
      OIB,
      spol,
      address,
      dateOfBirth : dayjs(dateOfBirth).format("YYYY-MM-DD"),
      dateTimeOfRequest,
      primarySchool,
      role: 'pending'
    });

    const insertQueryKorisnik = `insert into KORISNIK(OIB, spol, ime, prezime, datumrod, adresa, email, zaporka, školaID) 
    values($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

    const insertQueryGost = `insert into GOST(gostID, datumPristupa, OIB) values ($1, CURRENT_TIMESTAMP, $2)`;

    const valuesKorisnik = [newRequest.OIB, newRequest.spol, newRequest.name, newRequest.surname, newRequest.dateOfBirth, 
      newRequest.address, newRequest.email, hashedPass, newRequest.primarySchool];

    const valuesGost = [newRequest._id, newRequest.OIB];

    await client.query(insertQueryKorisnik, valuesKorisnik);

    await client.query(insertQueryGost, valuesGost);

    await newRequest.save();

    await User.findOneAndUpdate({ googleId: req.body.googleId }, { role: 'pending' }, {new: true});

    res.json({
      message: 'Data saved successfully',
      savedData: newRequest
    });
  } catch (err) {
    console.error('Error saving request:', err.message);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

router.get('/get-requests', async(req, res) => {
  try{
    const requests = await Request.find();
    res.json(requests);
  }catch(err){
    console.log('Erros fetching requests:', err);
    res.status(500).json({ error: 'Failed to fetch requests'});
  }
});

router.post('/change-info-request', async(req, res) => {
  const { _id, name, surname, email, OIB, spol, address, dateOfBirth, dateTimeOfRequest, primarySchool, role } = req.body;
  
  if(!_id){
    return res.status(400).json({ error: 'User ID is required'});
  }

  try{
    const updatedRequest = await Request.findByIdAndUpdate(
      _id,
      {
        name,
        surname,
        email,
        OIB,
        spol,
        address,
        dateOfBirth,
        dateTimeOfRequest,
        primarySchool,
        role
      },
      { new: true }
    );

    if(!updatedRequest){
      return res.status(404).json({error: 'User not found'});
    }

    res.json({ message: 'User information updated successfully', updatedRequest });
  } catch(err){
    console.error('Error updating user info:', err);
    res.status(500).json({ error: 'Failed to update user information' });
  }
});

router.post('/confirm-request', async (req, res) => {
  const { _id, email } = req.body;

  if (!_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const request = await Request.findById(_id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const deleteGost = `delete from gost where gostid = $1`;
    const valuesDeleteGost = [request._id];
    const insertQueryDjelatnik = `insert into DJELATNIK (djelatnikID, mobBroj, razred, razrednik, status, OIB) values ($1, $2, $3, $4, $5, $6)`;
    const insertQueryUčenik = `insert into UČENIK (učenikID, razred, škGod, smjer, OIB) VALUES($1, $2, $3, $4, $5)`;

    const role = request.role === 'pending' ? 'učenik' : request.role;

    if (role === 'učenik') {
      const valuesUčenik = [request._id, '4b', schoolYear(), 'računarstvo', request.OIB];
      await client.query(deleteGost, valuesDeleteGost);
      await client.query(insertQueryUčenik, valuesUčenik);
    } else {
      const valuesDjelatnik = [request._id, '0000000000', 'NONE', 'NONE', role, request.OIB];
      await client.query(deleteGost, valuesDeleteGost);
      await client.query(insertQueryDjelatnik, valuesDjelatnik);

      await drive.permissions.create({
        fileId: GOOGLE_DRIVE_FOLDER_ID,
        requestBody: {
            role: 'writer',
            type: 'user',
            emailAddress: request.email,
        },
    });
    
    }

      const confirmedUser = new ConfirmedUser({
      _id: request.id,
      name: request.name,
      surname: request.surname,
      email: request.email,
      OIB: request.OIB,
      spol: request.spol,
      address: request.address,
      dateOfBirth: request.dateOfBirth,
      dateTimeOfRequest: request.dateTimeOfRequest,
      primarySchool: request.primarySchool,
      role
    });

    await confirmedUser.save();

    await User.findOneAndUpdate({ googleId: _id }, { role }, { new: true })

    await Request.findByIdAndDelete(_id);

    res.json({ message: 'Request confirmed and transferred to Students collection', confirmedUser});
  } catch (err) {
    console.error('Error confirming request:', err);
    res.status(500).json({ error: 'Failed to confirm request' });
  }
});

router.post('/deny-request', async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const request = await Request.findByIdAndDelete(_id);

    const deleteGost = `delete from GOST where gostID = $1`;
    const valuesDeleteGost = [request._id];
    const deleteKorisnik = `delete from KORISNIK where OIB = $1`;
    const valuesDeleteKorisnik = [request.OIB];  

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    await User.findOneAndUpdate({ googleId: _id }, { role: 'denied' }, { new: true});
    await client.query(deleteGost, valuesDeleteGost);
    await client.query(deleteKorisnik, valuesDeleteKorisnik);

    res.json({ message: 'Request denied' });
  } catch (err) {
    console.error('Error denying request:', err);
    res.status(500).json({ error: 'Failed to deny request' });
  }
});

router.post('/get-user-info', async(req, res) => {
    const { OIB } = req.body;

	if(!OIB){
		return res.status(400).json({ error: 'User OIB is required' });
	}

	try{
		const user = await ConfirmedUser.findOne({ OIB });

		if (!user) {
		  return res.status(404).json({ error: 'User not found' });
		}

		res.json(user);
	} catch(err){
		console.error('Error finding student:', err);
    	res.status(500).json({ error: 'Failed to retrieve student' });
	}
})

router.post('/update-user-info', async (req, res) => {
  const { _id, name, surname, email, OIB, address, dateOfBirth, dateTimeOfRequest, primarySchool, role } = req.body;

	if(!_id){
		return res.status(400).json({ error: 'User ID is required'});
	}

	try{
		const updatedUser = await ConfirmedUser.findByIdAndUpdate(
		  _id,
		  {
			name,
			surname,
			email,
			OIB,
      spol,
			address,
			dateOfBirth : dayjs(dateOfBirth).format("YYYY-MM-DD"),
      dateTimeOfRequest,
			primarySchool,
			role
		  },
		  { new: true }
		);

		if(!updatedUser){
			return res.status(404).json({error: 'User not found'});
		}

    const result = await client.query('SELECT status FROM djelatnik WHERE OIB = $1', [updatedUser.OIB]);

    if (updatedUser.role === 'denied') {
      if (result.rows.length === 0) {
        await client.query(`delete from UČENIK where OIB = $1`, [updatedUser.OIB]);
      } else {
        await client.query(`delete from DJELATNIK where OIB = $1`, [updatedUser.OIB]);
      }
      await client.query(`delete from KORISNIK where OIB = $1`, [updatedUser.OIB]);
    } else {
      const updateUserInfo = 'update KORISNIK set OIB = $1, spol = $2, ime = $3, prezime = $4, datumRod = $5, adresa = $6, email = $7, zaporka = $8, školaID = $9 where OIB = $1';
      const updateUserInfoValues = [updatedUser.OIB, 'M', updatedUser.name, updatedUser.surname, updatedUser.dateOfBirth, updatedUser.address, updatedUser.email, 'passU',updatedUser.primarySchool];
      await client.query(updateUserInfo, updateUserInfoValues);
      /*if (result.rows.length === 0) {
        const updateUčenikInfo
        const updateUčenikInfoValues
        await client.query(updateUčenikInfo, updateUčenikInfoValues);
      } else {
        const updateDjelatnikInfo
        const updateDjelatnikInfoValues
        await client.query(updateDjelatnikInfo, updateDjelatnikInfoValues);
      }*/
    }

    await updatedUser.save();

    await User.findOneAndUpdate({ googleId: _id }, { role }, { new: true })

		  res.json({ message: 'User information updated successfully', updatedUser });

	}catch(err){
    console.error('Error updating user info:', err);
    res.status(500).json({ error: 'Failed to update user information' });
	}
})

router.post('/upis-prostorije', async(req, res) => {
  const { kapacitet, oznaka, tip, skolaID } = req.body;

  if (!kapacitet || !oznaka || !tip) {
    return res.status(400).json({ error: 'Sva polja moraju biti ispunjena!'});
  }

  try {
    const result = await client.query('SELECT * FROM PROSTORIJA WHERE oznaka = $1', [oznaka]);
    if (result.rows.length > 0) {
      const updateQuery = `
        UPDATE PROSTORIJA
        SET kapacitet = $1, tipProstorije = $2, školaID = $3
        WHERE oznaka = $4
      `;
      await client.query(updateQuery, [kapacitet, tip, skolaID, oznaka]);
      res.json({ message: 'Prostorija je uređena.' });
    } else {
      const insertQuery = `
        INSERT INTO PROSTORIJA (kapacitet, oznaka, tipProstorije, školaID)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(insertQuery, [kapacitet, oznaka, tip, skolaID]);
      res.json({ message: 'Prostorija uspješno dodana.' });
    }
  } catch (error) {
    console.log('Neuspješan upis:', error);
    res.status(500).json({ error: 'Greška pri upisu u bazu' });
  }
});

router.post('/brisanje-prostorije', async (req, res) => {
  const { oznaka } = req.body;

  if (!oznaka) {
      return res.status(400).json({ error: 'Oznaka prostorije je obavezna za brisanje!' });
  }

  try {
      const findQuery = await client.query('SELECT * FROM PROSTORIJA WHERE oznaka = $1', [oznaka]);
      if (findQuery.rows.length === 0) {
          return res.status(404).json({ message: 'Prostorija s danom oznakom ne postoji.' });
      }

      const deleteQuery = 'DELETE FROM PROSTORIJA WHERE oznaka = $1';
      await client.query(deleteQuery, [oznaka]);
      res.json({ message: 'Prostorija uspješno obrisana.' });
  } catch (error) {
      console.error('Greška pri brisanju prostorije:', error);
      res.status(500).json({ error: 'Došlo je do pogreške pri brisanju prostorije.' });
  }
});


module.exports = router;
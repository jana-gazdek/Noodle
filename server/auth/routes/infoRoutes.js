const express = require('express');
const dayjs = require('dayjs');
const router = express.Router();
const Request = require('../models/Requests');
const Student = require('../models/Student');
const User = require('../models/User');
const client = require('../../../database/connection.js');
client.connect();

router.post('/submit-request', async (req, res) => {
  console.log('Request received at backend:', req.body);

  if (!req.body || !req.body.googleId) {
    return res.status(401).json({ error: 'User is not authenticated' });
  }

  const {
    name,
    surname,
    email,
    OIB,
    address,
    dateOfBirth,
    dateTimeOfRequest,
    primarySchool,
    role
  } = req.body;

  try {
    const newRequest = new Request({
      _id: req.body.googleId,
      name,
      surname,
      email,
      OIB,
      address,
      dateOfBirth : dayjs(dateOfBirth).format("YYYY-MM-DD"),
      dateTimeOfRequest,
      primarySchool,
      role: 'pending'
    });

    const insertQueryKorisnik = `insert into KORISNIK(OIB, spol, ime, prezime, datumrod, adresa, email, zaporka, školaID) 
    values($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

    const insertQueryGost = `insert into GOST(gostID, datumPristupa, OIB) values ($1, CURRENT_TIMESTAMP, $2)`;

    const valuesKorisnik = [newRequest.OIB, 'M', newRequest.name, newRequest.surname, newRequest.dateOfBirth, 
      newRequest.address, newRequest.email, 'passU', newRequest.primarySchool];

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
  const { _id, name, surname, email, OIB, address, dateOfBirth, dateTimeOfRequest, primarySchool, role } = req.body;
  
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
  const { _id } = req.body;

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
    //const insertQueryRole = `insert into $1(gostID, datumPristupa, OIB) values ($1, CURRENT_TIMESTAMP, $2)`;
    const insertQueryUčenik = `insert into UČENIK (učenikID, razred, škGod, smjer, OIB) VALUES($1, $2, $3, $4, $5)`;

    const role = request.role === 'pending' ? 'student' : request.role;

    if (role == 'student'||'pending'){
      const valuesUčenik = [request._id, '4b', '2023./2024.', 'računarstvo', request.OIB];
      await client.query(deleteGost, valuesDeleteGost);
      await client.query(insertQueryUčenik, valuesUčenik);
    }

      const student = new Student({
      _id: request.id,
      name: request.name,
      surname: request.surname,
      email: request.email,
      OIB: request.OIB,
      address: request.address,
      dateOfBirth: request.dateOfBirth,
      dateTimeOfRequest: request.dateTimeOfRequest,
      primarySchool: request.primarySchool,
      role
    });

    await student.save();

    await User.findOneAndUpdate({ googleId: _id }, { role }, { new: true })

    await Request.findByIdAndDelete(_id);

    res.json({ message: 'Request confirmed and transferred to Students collection', student});
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

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    await User.findOneAndUpdate({ googleId: _id }, { role: 'denied' }, { new: true});

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
		const user = await Student.findOne({ OIB });

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
		const updatedUser = await Student.findByIdAndUpdate(
		  _id,
		  {
			name,
			surname,
			email,
			OIB,
			address,
			dateOfBirth,
      dateTimeOfRequest,
			primarySchool,
			role
		  },
		  { new: true }
		);

		if(!updatedUser){
			return res.status(404).json({error: 'User not found'});
		}

		  res.json({ message: 'User information updated successfully', updatedUser });

	}catch(err){
    console.error('Error updating user info:', err);
    res.status(500).json({ error: 'Failed to update user information' });
	}
})

module.exports = router;
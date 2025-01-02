const express = require('express');
const router = express.Router();
const Request = require('../models/Requests');
const Student = require('../models/Student');

router.post('/submit-request', async (req, res) => {
  console.log('Request received at backend:', req.body);
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
      name,
      surname,
      email,
      OIB,
      address,
      dateOfBirth,
      dateTimeOfRequest,
      primarySchool,
      role
    });

    await newRequest.save();

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

    const student = new Student({
      name: request.name,
      surname: request.surname,
      email: request.email,
      OIB: request.OIB,
      address: request.address,
      dateOfBirth: request.dateOfBirth,
      dateTimeOfRequest: request.dateTimeOfRequest,
      primarySchool: request.primarySchool,
      role: request.role
    });

    await student.save();

    await Request.findByIdAndDelete(_id);

    res.json({ message: 'Request confirmed and transferred to Students collection', student });
  } catch (err) {
    console.error('Error confirming request:', err);
    res.status(500).json({ error: 'Failed to confirm request' });
  }
});

router.post('/deny-request', async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(400).json({ error: 'User ID (_id) is required' });
  }

  try {
    const request = await Request.findByIdAndDelete(_id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Request denied' });
  } catch (err) {
    console.error('Error denying request:', err);
    res.status(500).json({ error: 'Failed to deny request' });
  }
});

module.exports = router;
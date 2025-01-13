const bcrypt = require('bcrypt');
const saltRounds = 10;
  
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error(error);
  }
}

async function checkPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = {
  hashPassword,
  checkPassword
};
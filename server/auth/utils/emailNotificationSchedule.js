const nodemailer = require('nodemailer');
const ConfirmedUser = require('../models/ConfirmedUser');

const sendEmailNotificationSchedule = async (schedule) => {
  const results = {
    successes: [],
    failures: []
  }

  try {
    const students = await ConfirmedUser.find(/*ConfirmedUser.role = 'učenik'*/);

    if (!students || students.length === 0) {
      console.log('No students found, no emails sent.');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    for (const student of students) {
      const mailOptions = {
        from: '"Noodle" <no-reply@noodle.com>',
        to: student.email,
        subject: 'Obavijest o promjeni rasporeda',
        text: `Dragi ${student.name},\n\nDošlo je do promjena u rasporedu. Molimo provjerite svoj raspored u Noodle aplikaciji.\n\nSrdačan pozdrav,\nVaša škola`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${student.email}`);
        results.successes.push(student.email);
      } catch (err) {
        console.error(`Failed to send email to ${student.email}:`, err);
        results.failures.push(student.email);
      }
    }
  } catch (err) {
    console.error('Error fetching students or sending emails:', err);
  }
  return results;
};

module.exports = sendEmailNotificationSchedule;
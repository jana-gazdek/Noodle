const nodemailer = require('nodemailer');
const ConfirmedUser = require('../models/ConfirmedUser');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmails = async (students, subject, textTemplate) => {
  const results = { successes: [], failures: [] };

  const emailPromises = students.map((student) => {
    const mailOptions = {
      from: '"Noodle" <no-reply@noodle.com>',
      to: student.email,
      subject,
      text: textTemplate.replace('{name}', student.name),
    };

    return transporter
      .sendMail(mailOptions)
      .then(() => {
        console.log(`Email sent to ${student.email}`);
        results.successes.push(student.email);
      })
      .catch((err) => {
        console.error(`Failed to send email to ${student.email}:`, err);
        results.failures.push(student.email);
      });
  });

  await Promise.all(emailPromises);
  return results;
};

const sendEmailNotificationSchedule = async () => {
  try {
    const students = await ConfirmedUser.find({ role: 'učenik' });
    if (!students || students.length === 0) {
      console.log('Nije pronađen nijedan učenik, mail nije poslan.');
      return { successes: [], failures: [] };
    }

    return await sendEmails(
      students,
      'Obavijest o promjeni rasporeda',
      `Dragi {name},\n\nDošlo je do promjena u rasporedu. Molimo provjerite svoj raspored u Noodle aplikaciji.\n\nSrdačan pozdrav,\nVaša škola`
    );
  } catch (err) {
    console.error('Error fetching students or sending emails:', err);
    throw err;
  }
};

const sendEmailNotificationArrived = async () => {
  try {
    const students = await ConfirmedUser.find({ role: 'učenik' });
    if (!students || students.length === 0) {
      console.log('Nije pronađen nijedan učenik, mail nije poslan.');
      return { successes: [], failures: [] };
    }

    return await sendEmails(
      students,
      'Nova obavijest',
      `Dragi {name},\n\nNa aplikaciji Noodle postavljena je nova obavijest. Molimo provjerite aplikaciju.\n\nSrdačan pozdrav,\nVaša škola`
    );
  } catch (err) {
    console.error('Error fetching students or sending emails:', err);
    throw err;
  }
};

module.exports = { sendEmailNotificationSchedule, sendEmailNotificationArrived };

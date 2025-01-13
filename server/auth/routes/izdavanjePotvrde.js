const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const ConfirmedUser = require('../models/ConfirmedUser');
const streamBuffers = require('stream-buffers');
const path = require('path');

router.post('/izdavanje-potvrde', async (req, res) => {
  const { OIB } = req.body;
  if (!OIB) {
    return res.status(400).json({ error: 'Potreban je OIB korisnika' });
  }

  try {
    const student = await ConfirmedUser.findOne({ OIB });
    if (!student) {
      return res.status(404).json({ error: 'Učenik nije pronađen' });
    }

    const doc = new PDFDocument();
    const buffer = new streamBuffers.WritableStreamBuffer({
      initialSize: (100 * 1024),
      incrementAmount: (10 * 1024) 
    });

    const fontPath = path.join('..', 'fonts', 'dejavu-sans', 'DejaVuSans.ttf');
    doc.registerFont('DejaVuSans', fontPath);

    doc.pipe(buffer);
    doc.font('DejaVuSans')
       .fontSize(16)
       .text('Potvrda o studiranju', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12)
       .text(`Ime: ${student.name}`)
       .text(`Prezime: ${student.surname}`)
       .text(`OIB: ${student.OIB}`)
       .text(`Škola: ${student.primarySchool}`);
    doc.moveDown();
    doc.text(`${student.name} ${student.surname} (${student.OIB}) pohađa školu ${student.primarySchool}.`);
    doc.end();

    doc.on('end', async () => {
      const pdfBuffer = buffer.getContents();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: '"Noodle" <no-reply@noodle.com>',
        to: student.email,
        subject: 'Potvrda o studiranju',
        text: `Dragi ${student.name},\n\nU prilogu se nalazi vaša potvrda o studiranju.\n\nSrdačan pozdrav,\nVaša škola`,
        attachments: [{
          filename: 'Potvrda_o_studiranju.pdf',
          content: pdfBuffer
        }]
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${student.email}`);
        res.status(200).send('PDF generated and email sent successfully.');
      } catch (err) {
        console.error('Failed to send email:', err);
        res.status(500).json({ error: 'Failed to send confirmation email' });
      }
    });
  } catch (err) {
    console.error('Error generating confirmation PDF:', err);
    res.status(500).json({ error: 'Failed to generate confirmation document' });
  }
});

module.exports = router;

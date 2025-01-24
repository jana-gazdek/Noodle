const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const ConfirmedUser = require('../models/ConfirmedUser');
const streamBuffers = require('stream-buffers');
const path = require('path');
const client = require('../../connection.js');
const fs = require('fs');

router.post('/izdavanje-potvrde', async (req, res) => {
  const { googleId } = req.body;
  
  const ojib = await client.query(`SELECT OIB FROM UČENIK WHERE učenikId = $1`, [googleId]);
  console.log(ojib)
  const OIB = (ojib.rows[0])["oib"]
  if (!OIB) {
    return res.status(400).json({ error: 'Potreban je OIB korisnika' });
  }

  try {
    const student = await ConfirmedUser.findOne({ OIB });
    if (!student) {
      return res.status(404).json({ error: 'Učenik nije pronađen' });
    }

    const akGod = await client.query(`select škGod from uČenik where oib = $1`, [student.OIB]);
    const škola = await client.query(`select imeŠkole from Škola where školaid = 1`);

    const doc = new PDFDocument();
    const buffer = new streamBuffers.WritableStreamBuffer({
      initialSize: (100 * 1024),
      incrementAmount: (10 * 1024) 
    });

    const fontPath = path.join('..', 'fonts', 'dejavu-sans', 'DejaVuSans.ttf');
    const boltFontPath = path.join('..', 'fonts', 'dejavu-sans', 'DejaVuSans-Bold.ttf');
    doc.registerFont('DejaVuSans', fontPath);
    doc.registerFont('DejaVuSans-Bold', boltFontPath)

    doc.pipe(buffer);
    doc.image('../images/grb.png', {
      fit: [150, 150],
      align: 'center',
      x: 50,
      y: 50 
    });
    doc.moveDown(10);
    doc.font('DejaVuSans-Bold')
       .fontSize(16)
       .text('ELEKTRONIČKI ZAPIS O STATUSU UČENIKA', { align: 'center' });
    doc.moveDown(2);
    doc.font('DejaVuSans')
       .fontSize(10)
       .text(`U evidenciji izadnih učeničkih isprava u akademskoj godini ${akGod.rows[0].škgod} utvrđeno je sljedeće:`)
       .text(`${student.name} ${student.surname}, OIB: ${student.OIB},`)
       .text(`ima upis u statusu redovitog učenika u školi:`)
       .text(`${škola.rows[0].imeŠkole}`);
    doc.moveDown(2);
    doc.text(`${student.name} ${student.surname} (${student.OIB}) pohađa školu ${škola.rows[0].imeŠkole}.`);
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

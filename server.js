require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files (so you can visit http://localhost:PORT and the contact form
// will be same-origin with the API). Make sure this folder contains `index.html`.
app.use(express.static(path.join(__dirname)));

// Basic rate limiter for contact endpoint to prevent abuse
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many contact requests from this IP, please try again later.'
});

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// POST /api/contact -> send email to configured recipient
// Reuse a single transporter and verify credentials on startup for clearer errors
let transporter;
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
}

transporter = createTransporter();
transporter.verify(function(error, success) {
  if (error) {
    console.error('Error verifying mail transporter. Check GMAIL_USER/GMAIL_PASS in .env:', error);
  } else {
    console.log('Mail transporter verified. Ready to send messages.');
  }
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body || {};

  // Basic server-side validation
  if (!name || !email || !message) {
    return res.status(400).send('Name, email and message are required');
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return res.status(400).send('Invalid input types');
  }

  if (name.length > 100 || email.length > 254 || message.length > 5000) {
    return res.status(400).send('Input values are too long');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send('Invalid email address');
  }

  // Simple sanitization to avoid HTML injection in emails
  const sanitize = (str) => String(str).replace(/<|>|`|\$\{|\}/g, '');
  const sName = sanitize(name);
  const sEmail = sanitize(email);
  const sMessage = sanitize(message);

  try {
    const mailOptions = {
      from: `${sName} <${sEmail}>`,
      to: process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER,
      subject: `Portfolio contact form: ${sName}`,
      text: `You received a new message from your portfolio contact form:\n\nName: ${sName}\nEmail: ${sEmail}\n\nMessage:\n${sMessage}`,
      html: `<p>You received a new message from your portfolio contact form:</p>
             <p><strong>Name:</strong> ${sName}<br/>
             <strong>Email:</strong> ${sEmail}</p>
             <p><strong>Message:</strong><br/>${sMessage.replace(/\n/g, '<br/>')}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent:', info.response);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error sending contact email:', err);
    // Provide the error message in logs; return a generic message to client
    res.status(500).send('Failed to send email');
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Note: For production use, secure this endpoint and add rate limiting/validation.

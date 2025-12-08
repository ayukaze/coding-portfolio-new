# Portfolio contact email server

This small helper runs a local Express server that accepts POST requests from the front-end contact form and forwards them to your Gmail address using `nodemailer`.

Getting started

1. Copy `.env.example` to `.env` and fill in your values:

   - `GMAIL_USER` — your Gmail address (sender)
   - `GMAIL_PASS` — App Password (recommended) or SMTP password
   - `RECIPIENT_EMAIL` — the address that should receive contact messages (defaults to `GMAIL_USER`)

2. Install and run:

```powershell
cd 'e:\coding\portfolio new'
npm install
npm start
```

3. Open your portfolio `index.html` (or serve it) and submit the contact form. The client-side code posts to `/api/contact`.

Security notes

- Use a Gmail App Password (Google account -> Security -> App passwords) if your account uses 2FA.
- Do not commit `.env` to source control.
- The server includes a basic rate limiter to reduce spam; for production use add stronger anti-abuse measures (CAPTCHA, more validation) and host securely.

Testing

- Health check: `GET /api/health` should return `{ ok: true }`.
- Submit the form from the front-end and verify you receive the email.

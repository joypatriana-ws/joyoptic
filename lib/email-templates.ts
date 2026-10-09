// Template-urile de email din tema JoyOptic (Emails/html/*.ctp), cu același HTML și aceleași stiluri.

const h = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const ADMIN_STYLE = `
        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 500px;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            margin: auto;
        }
        h2 {
            color: #d9534f;
            text-align: center;
        }
        .details {
            padding: 10px;
            background: #f8f8f8;
            border-radius: 5px;
            margin-top: 10px;
            border: 1px solid #ddd;
        }
        .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 12px;
            color: #666;
        }`;

type BookingData = {
  name: string;
  phone: string;
  email: string;
  date: string; // d-m-Y
  hour: string; // H:i
  type: string;
  medic: string;
};

/** Emails/html/admin_booking.ctp — subiect „Programare nouă - JoyOptic" */
export function adminBookingHtml(b: BookingData) {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouă Programare - JoyOptic</title>
    <style>${ADMIN_STYLE}
    </style>
</head>
<body>
    <div class="container">
        <h2>Programare Nouă</h2>
        <p>A fost efectuată o nouă programare:</p>

        <div class="details">
            <p><strong>Nume:</strong> ${h(b.name)}</p>
            <p><strong>Telefon:</strong> ${h(b.phone)}</p>
            <p><strong>Email:</strong> ${h(b.email)}</p>
            <p><strong>Data:</strong> ${h(b.date)}</p>
            <p><strong>Ora:</strong> ${h(b.hour)}</p>
            <p><strong>Tip programare:</strong> ${h(b.type)}</p>
            <p><strong>Medic:</strong> ${h(b.medic || "-")}</p>
        </div>

        <div class="footer">
            <p>&copy; 2025 JoyOptic</p>
        </div>
    </div>
</body>
</html>`;
}

/** Emails/html/user_booking.ctp — subiect „Confirmare programare - JoyOptic" */
export function userBookingHtml(b: BookingData & { confirmUrl: string }) {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmare Programare - JoyOptic</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin: auto;
        }
        h1 {
            text-align: center;
            color: #0056b3;
        }
        .details {
            padding: 15px;
            background: #e9f5ff;
            border-radius: 5px;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Confirmare Programare</h1>
        <p>Bună,</p>
        <p>Programarea ta la JoyOptic a fost înregistrată cu succes!</p>

        <div class="details">
            <p><strong>Data:</strong> ${h(b.date)}</p>
            <p><strong>Ora:</strong> ${h(b.hour)}</p>
            <p><strong>Tip programare:</strong> ${h(b.type)}</p>
            <p><strong>Medic:</strong> ${h(b.medic || "-")}</p>
            <p><strong>Telefon:</strong> ${h(b.phone)}</p>
            <p><strong>Email:</strong> ${h(b.email)}</p>
        </div>

        <p>Te vom contacta pentru confirmare. Îți mulțumim pentru alegerea serviciilor noastre!</p>

        <p>Vă rugăm să confirmi programarea apăsând butonul de mai jos:</p>
        <p style="text-align: center;">
            <a href="${h(b.confirmUrl)}"
               style="display: inline-block; background: #28a745; color: #fff; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
               Confirmă Programarea
            </a>
        </p>

        <div class="footer">
            <p>&copy; 2025 JoyOptic - Toate drepturile rezervate.</p>
        </div>
    </div>
</body>
</html>`;
}

/** Emails/html/admin_message.ctp — subiect „Mesaj nou - JoyOptic" */
export function adminMessageHtml(m: {
  name: string;
  phone: string;
  email: string;
  date: string; // d-m-Y H:i
  subject: string;
  body: string;
}) {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mesaj nou - JoyOptic</title>
    <style>${ADMIN_STYLE}
    </style>
</head>
<body>
    <div class="container">
        <h2>Mesaj nou</h2>
        <p>A fost trimis un mesaj de contact:</p>

        <div class="details">
            <p><strong>Nume:</strong> ${h(m.name)}</p>
            <p><strong>Telefon:</strong> ${h(m.phone)}</p>
            <p><strong>Email:</strong> ${h(m.email)}</p>
            <p><strong>Data:</strong> ${h(m.date)}</p>
            <p><strong>Subiect:</strong> ${h(m.subject)}</p>
            <p><strong>Mesaj:</strong> ${h(m.body)}</p>
        </div>

        <div class="footer">
            <p>&copy; 2025 JoyOptic</p>
        </div>
    </div>
</body>
</html>`;
}


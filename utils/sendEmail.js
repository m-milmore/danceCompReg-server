const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // create reusable transporter object using the default SMTP transport
  // this will trap the invalid email at mailtrap.io
  // when in production, switch to the gmail code because emails will be valid emails
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   auth: {
  //     user: process.env.SMTP_EMAIL,
  //     pass: process.env.SMTP_PASSWORD,
  //   },
  // });

  // I used my gmail account to send emails, I had to generate an app-specific password and use that in place of my actual password

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  // send mail with defined transport object
  const message = {
    from: `${process.env.GMAIL_NAME} <${process.env.GMAIL_EMAIL}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    attachments: options.attachments, // entries
  };

  const info = await transporter.sendMail(message);

  // MDN console
  // string substitutions %s Outputs a string.
  // Message sent: <f3c94108-a182-a014-d52f-ac8ea7f82776@gmail.com>
  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;

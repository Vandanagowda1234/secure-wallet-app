import nodemailer from "nodemailer";

// Replace with your Gmail and App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vandanagowda86@gmail.com",
    pass: "fhbi akju pvgp fitk", // 16-character Gmail App Password
  },
});

transporter.sendMail({
  from: '"Test Email" <vandanagowda86@gmail.com>',
  to: "vandanagowda86@gmail.com", // where you want to receive the test email
  subject: "Test Email from Node",
  text: "Hello! This is a test email from Node.js",
}, (err, info) => {
  if (err) console.error("Error sending email:", err);
  else console.log("Email sent successfully:", info.response);
});

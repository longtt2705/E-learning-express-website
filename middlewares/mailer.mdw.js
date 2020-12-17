const nodemailer = require("nodemailer");
const key = require("../key/key");
const mailAccount = require("../key/key");
const jwt = require("jsonwebtoken");

// async..await is not allowed in global scope, must use a wrapper
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: key.mailServicesUsername,
    pass: key.mailServicesPassword,
  },
});

const createUrl = (email) => {
  const token = jwt.sign(
    {
      data: email,
    },
    "SECRET_KEY",
    { expiresIn: "1m" }
  );

  const url = "http://localhost:5555/account/confirmation/?token=" + token;
  return url;
};

// send mail with defined transport object
module.exports = {
  sendConfirm(email) {
    let mailOptions = {
      from: mailAccount.mailServicesUsername, // sender address
      to: email, // list of receivers
      subject: "Online Courses Email Vertification", // Subject line
      html:
        "<b>Click the link below to verify your email</b> <br>" +
        createUrl(email), // html body
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  },
};

var nodemailer = require('nodemailer');
const { ServerException } = require('../common/exception/exception');

// Create a transporter object using SMTP with the ProtonMail settings
// const transporter = nodemailer.createTransport({
//     host: 'smtp://protonmail.com',
//     port: 465,
//     secure: true, // true for 465, false for other ports
//     auth: {
//         user: 'soundroom2021@proton.me', // your ProtonMail email address
//         pass: 'soundRoom_pf'   // your ProtonMail password or app-specific password
//     }
// });
 
// // Setup email data with unicode symbols
// const mailOptions = {
//     from: '"sound room" <soundroom2021@proton.me>', // sender address
//     //to: String(req["to"]),                  // list of receivers
//     //to: to,
//     //subject: String(req["subject"]),                          // Subject line
//     //subject: subject,
//     text: 'Hello world?',                         // plain text body
//     html: '<b>Hello world?</b>'                   // html body
// };
 
// // Send mail with defined transport object
// transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//         return console.log(error);
//     }
//     console.log('Message sent: %s', info.messageId);
//     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
// });

// -----------------------------------------------------------
//email sender function - version vieja
var mailOptions = {
        from: 'soundroomapp@gmail.com',
        to: '',
        subject: '',
        text: ''
    };
exports.sendEmail = function(req, res){
    // Definimos el transporter
    
    mailOptions = {
        to: String(req["to"]),
        subject: String(req["subject"]),
        text: String(req["text"]),
        html: String(req["html"])

    }
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'soundroomapp@gmail.com',
            pass: 'gmxm xwyi wcmx lodr'
        }
    });
    // Enviamos el email
    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            console.log(error);
            res.send(500, err.message);
        } else {
            console.log("Email sent");
            res.status(200).jsonp(req.body);
        }
    });
};

exports.sendEmailAsync = async (mailOptions) =>  {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'soundroomapp@gmail.com',
            pass: 'gmxm xwyi wcmx lodr'
        }
    });
    mailOptions.from = 'soundroomapp@gmail.com'
     // Enviamos el email
     transporter.sendMail(mailOptions, function(error, info){
        if (error){
            console.error(error)
           throw new ServerException("Error sending email")
        } else {
            console.log("Email sent to and msj: ", mailOptions );
        }
    });
};




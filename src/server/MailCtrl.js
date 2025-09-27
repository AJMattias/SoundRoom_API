var nodemailer = require('nodemailer');
const { ServerException } = require('../common/exception/exception');

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




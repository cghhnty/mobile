var nodemailer = require('nodemailer');

var mailOptions = {
    from: 'verification@wosai-inc.com', // sender address
    to: 'verification@wosai-inc.com', // list of receivers
    subject: '验证码', // Subject line
    text: 'Hello world ✔', // plaintext body
    html: '<b>  </b>' // html body
};

 exports.sendMail = function(data) {
    // nodemailer.SMTP = {
    //     host: 'smtp.gmail.com'
    // }
    var transporter = nodemailer.createTransport({
        host: 'smtp.qq.com',
        port: 465,
        secureConnection: true,
        service: 'QQ',
        auth: {
            user: 'verification@wosai-inc.com',
            pass: 'wosai123'
        }
    });
    mailOptions.html = data;
    transporter.sendMail(mailOptions, function(err, info){
        if(err){
             console.log(err);
        }else{
            console.log(info);
        }
    });
 };
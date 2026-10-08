const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', // Standard configuration for Gmail
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

const sendPasswordResetEmail = async (to, resetToken) => {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
        from: process.env.SMTP_FROM || 'EVCMS <batam.cg@gmail.com>',
        to,
        subject: 'Reset Password - EVCMS',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f172a; text-align: center;">Reset Password Anda</h2>
                <p style="color: #475569; font-size: 16px;">Halo,</p>
                <p style="color: #475569; font-size: 16px;">Kami menerima permintaan untuk mereset password akun EVCMS Anda. Jika Anda tidak melakukan permintaan ini, abaikan email ini.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
                </div>
                <p style="color: #475569; font-size: 14px; margin-top: 20px;">Atau salin dan tempel tautan berikut ke browser Anda:</p>
                <p style="word-break: break-all; color: #3b82f6; font-size: 14px;"><a href="${resetUrl}">${resetUrl}</a></p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">Ini adalah email otomatis, mohon jangan membalas email ini.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendPasswordResetEmail
};

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
const sendChargingNotificationEmail = async (emails, chargingData, statusText) => {
    const transporter = createTransporter();
    
    const mailOptions = {
        from: process.env.SMTP_FROM || 'EVCMS <batam.cg@gmail.com>',
        to: emails.join(', '),
        subject: `Notifikasi ${statusText} - EVCMS`,
        html: `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 40px 0; font-family: Arial, sans-serif;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <!-- Header -->
                            <tr>
                                <td align="center" style="background-color: #e11d48; padding: 30px 20px;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">EVCMS System</h1>
                                    <p style="color: #ffe4e6; margin: 10px 0 0 0; font-size: 16px;">Notifikasi ${statusText}</p>
                                </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                                <td style="padding: 30px;">
                                    <p style="color: #475569; font-size: 16px; margin-top: 0;">Halo,</p>
                                    <p style="color: #475569; font-size: 16px; line-height: 1.5;">Sistem menginformasikan bahwa terdapat aktivitas <strong>${statusText}</strong> dengan rincian sebagai berikut:</p>
                                    
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 25px; margin-bottom: 30px; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 12px 15px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc; width: 35%; color: #334155;">Waktu</td>
                                            <td style="padding: 12px 15px; border: 1px solid #e2e8f0; color: #334155;">${new Date(chargingData.waktu).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 15px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc; color: #334155;">Kendaraan</td>
                                            <td style="padding: 12px 15px; border: 1px solid #e2e8f0; color: #334155;">${chargingData.kendaraan}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 15px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc; color: #334155;">Odometer</td>
                                            <td style="padding: 12px 15px; border: 1px solid #e2e8f0; color: #334155;">${chargingData.odometer} km</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 15px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc; color: #334155;">Operator</td>
                                            <td style="padding: 12px 15px; border: 1px solid #e2e8f0; color: #334155;">${chargingData.operator}</td>
                                        </tr>
                                    </table>
                                    
                                    <div style="text-align: center; margin: 35px 0 10px 0;">
                                        <a href="${process.env.FRONTEND_URL}/charging/${chargingData.id}" style="background-color: #e11d48; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Lihat Detail di Aplikasi</a>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td align="center" style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #e2e8f0;">
                                    <p style="color: #94a3b8; font-size: 13px; margin: 0;">Ini adalah email otomatis dari EVCMS, mohon jangan membalas email ini.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendPasswordResetEmail,
    sendChargingNotificationEmail
};

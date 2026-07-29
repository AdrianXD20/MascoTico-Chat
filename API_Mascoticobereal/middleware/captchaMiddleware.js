const axios = require('axios');

async function verifyCaptcha(req, res, next) {
    const captchaToken = req.body.captchaToken;

    if (!captchaToken) {
        return res.status(400).json({ message: 'CAPTCHA es requerido' });
    }

    try {
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: captchaToken
                }
            }
        );

        if (!response.data.success) {
            return res.status(400).json({ message: 'CAPTCHA inválido. Intenta de nuevo.' });
        }

        next();
    } catch (error) {
        console.error('Error verificando CAPTCHA:', error.message);
        return res.status(500).json({ message: 'Error al verificar CAPTCHA' });
    }
}

module.exports = { verifyCaptcha };

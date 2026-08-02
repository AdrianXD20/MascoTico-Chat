const axios = require('axios');

const GOOGLE_TEST_KEYS = [
    '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe', // test secret
    '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // test site key
];

async function verifyCaptcha(req, res, next) {
    const captchaToken = req.body.captchaToken;

    if (!captchaToken) {
        return res.status(400).json({ message: 'CAPTCHA es requerido' });
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret || GOOGLE_TEST_KEYS.includes(secret)) {
        return res.status(500).json({ message: 'CAPTCHA no configurado correctamente' });
    }

    try {
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: secret,
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

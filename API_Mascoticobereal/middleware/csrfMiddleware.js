const crypto = require('crypto');

const csrfTokens = new Map();

const CSRF_EXPIRY = 24 * 60 * 60 * 1000;

function generateToken(req, res) {
    const token = crypto.randomBytes(32).toString('hex');
    csrfTokens.set(token, Date.now() + CSRF_EXPIRY);
    res.json({ csrfToken: token });
}

function csrfProtection(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const token = req.headers['x-csrf-token'];
    if (!token) {
        return res.status(403).json({ error: 'CSRF token no proporcionado' });
    }

    const expiry = csrfTokens.get(token);
    if (!expiry) {
        return res.status(403).json({ error: 'CSRF token inválido' });
    }

    if (Date.now() > expiry) {
        csrfTokens.delete(token);
        return res.status(403).json({ error: 'CSRF token expirado' });
    }

    next();
}

function limpiarTokensExpirados() {
    const now = Date.now();
    for (const [token, expiry] of csrfTokens) {
        if (now > expiry) csrfTokens.delete(token);
    }
}

setInterval(limpiarTokensExpirados, 60 * 60 * 1000);

module.exports = { generateToken, csrfProtection };

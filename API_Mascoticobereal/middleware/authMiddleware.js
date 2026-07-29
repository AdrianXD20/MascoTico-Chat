const jwt = require('jsonwebtoken');

const secretKey = process.env.secretKey;

const tokenBlacklist = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [jti, exp] of tokenBlacklist) {
    if (exp * 1000 <= now) {
      tokenBlacklist.delete(jti);
    }
  }
}, 60 * 1000);

function verifyToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '').trim();
    if (!token) return res.status(403).json({ error: 'Token no proporcionado' });

    try {
        const decoded = jwt.verify(token, secretKey);
        if (tokenBlacklist.has(decoded.jti)) {
            return res.status(401).json({ error: 'Sesión cerrada. Inicia sesión de nuevo.' });
        }
        req.user = decoded;
        req.token = token;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' });
    }
}

function isAdmin(req,res,next){
    if (req.user.rol !== 'admin'){
        return res.status(403).json({error :"No tienes permisos para realizar esta acción"})
    }
    next();
};

function revocarToken(token) {
    try {
        const decoded = jwt.verify(token, secretKey);
        if (decoded.jti) {
            tokenBlacklist.set(decoded.jti, decoded.exp);
        }
    } catch (err) {
        // if token is already expired, no need to revoke
    }
}

module.exports = { verifyToken, isAdmin, revocarToken };
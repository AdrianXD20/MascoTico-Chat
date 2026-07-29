const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const body = require('body-parser');
const swaggerUI = require('swagger-ui-express');
const specs = require('./swagger/swagger.js');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = rateLimit;
const helmet = require('helmet');
const env = require('dotenv').config();
const sequelize = require('./database/conexion');
const RefreshToken = require('./Models/RefreshToken');

const { generateToken, csrfProtection } = require('./middleware/csrfMiddleware');
const { verifyToken } = require('./middleware/authMiddleware');
const { verifyRol } = require('./middleware/verifyRol');

const authController = require('./routes/authController.js');
const userController = require('./Controllers/userController');
const productoRoutes = require('./routes/productoRoutes.js')
const mascotasRoutes = require('./routes/mascotasRoutes.js')
const citasRoutes = require('./routes/citaRoutes.js')
const veterinarioRoutes = require('./routes/veterinariodRoutes.js')
const extraRoutes = require('./routes/extraRoutes.js')
const ventasRoutes = require('./routes/ventasRoutes.js')
const blogsRoutes= require('./routes/blogsRoutes.js')
const disponibilidadRoutes = require('./routes/disponibilidadRoutes.js')
const chatRoutes = require('./routes/chatRoutes.js')

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.removeHeader('ngrok-agent-ips');
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
      frameSrc: ["'self'", "https://www.google.com/recaptcha/"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

const allowed = [
    'https://AdrianXD20.github.io',
    'http://127.0.0.1:5501',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://api-mascoticos.onrender.com',
    'https://api-mascoticobereal.onrender.com',
    'https://mascotico-chat-web.onrender.com',
    'https://mascotico-chat.onrender.com',
    'https://talismanical-wormy-tonisha.ngrok-free.dev',
    /*IP de Alexander*/
    'http://192.168.0.104:8081',/*IP de Frenks*/
    'https://mascotico-luna.vercel.app',/*MascoTico WEB*/
    'https://mascotico-luna-pjzx81ixt-alexyah064s-projects.vercel.app', /*Front de Admin */
    'https://mascotico-web.vercel.app',
    'https://mascotico-chat-web.onrender.com',
    'https://mascotico-chat.onrender.com',
];

app.use(cors({
    origin: function (origin, callback) {
        if (allowed.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Límite general para toda la API
const limiterGeneral = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: "Demasiadas peticiones, intenta de nuevo en un momento." },
});

// Límite estricto solo para login (previene fuerza bruta)
// Combina IP + email para evitar que un atacante bloquee a otros usuarios en la misma IP
const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    const email = req.body?.email || 'unknown';
    return `${ipKeyGenerator(req.ip)}_${email}`;
  },
  message: { message: "Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos." },
});

// Límite para refresh token
const limiterRefresh = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Demasiadas solicitudes de refresh. Intenta de nuevo en 15 minutos." },
});

// Límite específico para csrf-token (por si un atacante lo abuse)
const limiterCsrf = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
});

// Límite para registro de cuentas
const limiterRegistro = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,  // 24 horas
  max: 3,                          // máximo 3 cuentas por IP al día
  message: { message: "Has alcanzado el límite de registros. Intenta de nuevo mañana." },
});

// Body parsers antes de rate limiters para poder leer req.body.email en el keyGenerator
app.use(express.json());
app.use(body.urlencoded({ extended: false }));
app.use(body.json());

app.use(limiterGeneral);
app.use('/login', limiterLogin);
app.use('/veterinario/login', limiterLogin);
app.use('/register', limiterRegistro);
app.use('/refresh', limiterRefresh);
app.use('/veterinario/refresh', limiterRefresh);
app.get('/csrf-token', limiterCsrf, generateToken);

app.use("/docs", verifyToken, swaggerUI.serve, swaggerUI.setup(specs));
app.get("/openapi.json", verifyToken, (req, res) => {
    res.json(specs);
});
app.use(morgan('dev'));
app.use(express.static('images'));

app.use('/',productoRoutes)
app.use('/',mascotasRoutes)
app.use('/',citasRoutes)
app.use('/', extraRoutes)
app.use('/', veterinarioRoutes)
app.use('/', authController);
app.use('/', userController);
app.use('/', ventasRoutes);
app.use('/', blogsRoutes)
app.use('/',disponibilidadRoutes)
app.use('/', chatRoutes)

// Catch JSON parse errors sin exponer stack traces
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON inválido en el cuerpo de la solicitud' });
  }
  next();
});

const PORT = process.env.PORT;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
});
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getConnection, closeConnection } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const patientsRoutes = require('./routes/patients.routes');
const visitsRoutes = require('./routes/visits.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS - Manejo de múltiples orígenes
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/visits', visitsRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'iMedicAD API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor
async function startServer() {
  try {
    // Verificar conexión a base de datos
    await getConnection();
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   iMedicAD Backend Server              ║
║   Puerto: ${PORT}                       ║
║   Entorno: ${process.env.NODE_ENV}     ║
║   Estado: ✅ Funcionando               ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await closeConnection();
  process.exit(0);
});

startServer();

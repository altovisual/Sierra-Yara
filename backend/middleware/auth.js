const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Middleware para proteger rutas de administrador
 */
exports.protegerRuta = async (req, res, next) => {
  let token;

  // Verificar si hay token en headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar si existe el token
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado. Token no proporcionado.'
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sierra_yara_secret_key_2024');

    // Obtener admin del token
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado. Usuario no encontrado.'
      });
    }

    if (!admin.activo) {
      return res.status(401).json({
        success: false,
        error: 'Cuenta desactivada.'
      });
    }

    // Agregar admin al request
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado. Token inválido.'
    });
  }
};

/**
 * Middleware para verificar rol de superadmin
 */
exports.soloSuperAdmin = (req, res, next) => {
  if (req.admin && req.admin.rol === 'superadmin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de superadmin.'
    });
  }
};

module.exports = exports;

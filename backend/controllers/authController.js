const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generar JWT Token sin expiracion
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sierra_yara_secret_key_2024');
};

// @desc    Registrar nuevo admin (solo para setup inicial)
// @route   POST /api/auth/register
// @access  Public (debe protegerse después del primer registro)
exports.registrarAdmin = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si el email ya existe
    const adminExistente = await Admin.findOne({ email });
    if (adminExistente) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Crear admin
    const admin = await Admin.create({
      nombre,
      email,
      password,
      rol: rol || 'admin'
    });

    // Generar token
    const token = generarToken(admin._id);

    res.status(201).json({
      success: true,
      data: {
        id: admin._id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Error al registrar administrador',
      message: error.message
    });
  }
};

// @desc    Login de admin
// @route   POST /api/auth/login
// @access  Public
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor ingrese email y contraseña'
      });
    }

    // Buscar admin con password
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (!admin.activo) {
      return res.status(401).json({
        success: false,
        error: 'Cuenta desactivada. Contacte al administrador.'
      });
    }

    // Verificar password
    const passwordCorrecto = await admin.compararPassword(password);

    if (!passwordCorrecto) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Actualizar último acceso
    await admin.actualizarAcceso();

    // Generar token
    const token = generarToken(admin._id);

    res.json({
      success: true,
      data: {
        id: admin._id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión',
      message: error.message
    });
  }
};

// @desc    Obtener perfil del admin actual
// @route   GET /api/auth/me
// @access  Private
exports.obtenerPerfil = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    res.json({
      success: true,
      data: {
        id: admin._id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
        ultimoAcceso: admin.ultimoAcceso,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener perfil',
      message: error.message
    });
  }
};

// @desc    Cambiar contraseña
// @route   PUT /api/auth/cambiar-password
// @access  Private
exports.cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;

    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar la contraseña actual y la nueva'
      });
    }

    // Obtener admin con password
    const admin = await Admin.findById(req.admin.id).select('+password');

    // Verificar password actual
    const passwordCorrecto = await admin.compararPassword(passwordActual);

    if (!passwordCorrecto) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar password
    admin.password = passwordNuevo;
    await admin.save();

    // Generar nuevo token
    const token = generarToken(admin._id);

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
      data: {
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al cambiar contraseña',
      message: error.message
    });
  }
};

// @desc    Verificar token
// @route   GET /api/auth/verificar
// @access  Private
exports.verificarToken = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin || !admin.activo) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido o cuenta desactivada'
      });
    }

    res.json({
      success: true,
      data: {
        id: admin._id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
};

module.exports = exports;

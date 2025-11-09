const TasaBCV = require('../models/TasaBCV');
const axios = require('axios');

/**
 * Controlador para gestión de tasas BCV
 */

// @desc    Obtener tasa actual
// @route   GET /api/tasa-bcv/actual
// @access  Public
exports.obtenerTasaActual = async (req, res) => {
  try {
    const tasa = await TasaBCV.findOne({ activa: true }).sort({ createdAt: -1 });
    
    if (!tasa) {
      return res.status(404).json({
        success: false,
        error: 'No hay tasa configurada'
      });
    }

    res.json({
      success: true,
      data: tasa
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener tasa',
      message: error.message
    });
  }
};

// @desc    Obtener histórico de tasas
// @route   GET /api/tasa-bcv/historico
// @access  Private (Admin)
exports.obtenerHistorico = async (req, res) => {
  try {
    const { limite = 30 } = req.query;
    
    const tasas = await TasaBCV.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limite));

    res.json({
      success: true,
      count: tasas.length,
      data: tasas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener histórico',
      message: error.message
    });
  }
};

// @desc    Actualizar tasa manualmente
// @route   POST /api/tasa-bcv/actualizar
// @access  Private (Admin)
exports.actualizarTasaManual = async (req, res) => {
  try {
    const { valor, actualizadoPor = 'Admin', notas = '' } = req.body;

    if (!valor || valor <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor de tasa inválido'
      });
    }

    const nuevaTasa = await TasaBCV.actualizarTasa(
      valor,
      'manual',
      actualizadoPor,
      notas
    );

    res.json({
      success: true,
      message: 'Tasa actualizada exitosamente',
      data: nuevaTasa
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar tasa',
      message: error.message
    });
  }
};

// @desc    Actualizar tasa desde API externa
// @route   POST /api/tasa-bcv/actualizar-api
// @access  Private (Admin) o Cron Job
exports.actualizarTasaDesdeAPI = async (req, res) => {
  try {
    console.log('🔄 Actualizando tasa BCV desde API...');
    
    let tasaObtenida = null;
    
    // Intentar con ExchangeRate-API primero (más confiable)
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
        timeout: 15000,
        headers: {
          'User-Agent': 'Sierra-Yara-Cafe/1.0'
        }
      });
      
      if (response.data && response.data.rates && response.data.rates.VES) {
        tasaObtenida = parseFloat(response.data.rates.VES);
        console.log('✅ Tasa obtenida de ExchangeRate-API:', tasaObtenida);
      }
    } catch (apiError) {
      console.error('❌ Error al obtener de ExchangeRate-API:', apiError.message);
      
      // Fallback: Intentar con otra API
      try {
        const fallbackResponse = await axios.get('https://api.exchangerate.host/latest?base=USD&symbols=VES', {
          timeout: 15000
        });
        
        if (fallbackResponse.data && fallbackResponse.data.rates && fallbackResponse.data.rates.VES) {
          tasaObtenida = parseFloat(fallbackResponse.data.rates.VES);
          console.log('✅ Tasa obtenida de ExchangeRate.host (fallback):', tasaObtenida);
        }
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError.message);
      }
    }

    if (!tasaObtenida || tasaObtenida <= 0) {
      return res.status(500).json({
        success: false,
        error: 'No se pudo obtener la tasa de ninguna fuente'
      });
    }

    // Verificar si la tasa cambió significativamente (>1%)
    const tasaActual = await TasaBCV.obtenerTasaActual();
    const cambio = Math.abs((tasaObtenida - tasaActual) / tasaActual * 100);
    
    if (cambio > 1) {
      console.log(`⚠️ Cambio significativo detectado: ${cambio.toFixed(2)}%`);
    }

    const nuevaTasa = await TasaBCV.actualizarTasa(
      tasaObtenida,
      'api',
      'sistema',
      `Actualización automática. Cambio: ${cambio.toFixed(2)}%`
    );

    res.json({
      success: true,
      message: 'Tasa actualizada desde API',
      data: nuevaTasa,
      cambio: `${cambio.toFixed(2)}%`
    });
  } catch (error) {
    console.error('❌ Error al actualizar tasa desde API:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar tasa desde API',
      message: error.message
    });
  }
};

// @desc    Obtener estadísticas de tasas
// @route   GET /api/tasa-bcv/estadisticas
// @access  Private (Admin)
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const { dias = 30 } = req.query;
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - parseInt(dias));

    const tasas = await TasaBCV.find({
      createdAt: { $gte: fechaInicio }
    }).sort({ createdAt: 1 });

    if (tasas.length === 0) {
      return res.json({
        success: true,
        data: {
          promedio: 0,
          minima: 0,
          maxima: 0,
          actual: 0,
          cambioTotal: 0
        }
      });
    }

    const valores = tasas.map(t => t.valor);
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    const minima = Math.min(...valores);
    const maxima = Math.max(...valores);
    const actual = valores[valores.length - 1];
    const cambioTotal = ((actual - valores[0]) / valores[0] * 100);

    res.json({
      success: true,
      data: {
        promedio: promedio.toFixed(2),
        minima: minima.toFixed(2),
        maxima: maxima.toFixed(2),
        actual: actual.toFixed(2),
        cambioTotal: cambioTotal.toFixed(2) + '%',
        cantidadActualizaciones: tasas.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      message: error.message
    });
  }
};

const Joi = require('joi');

// Schemas de validação
const schemas = {
    // Cliente
    cliente: Joi.object({
        nome: Joi.string().min(2).max(100).required().messages({
            'string.min': 'Nome deve ter pelo menos 2 caracteres',
            'string.max': 'Nome deve ter no máximo 100 caracteres',
            'any.required': 'Nome é obrigatório'
        }),
        telefone: Joi.string().pattern(/^[0-9]{10,11}$/).required().messages({
            'string.pattern.base': 'Telefone deve conter 10 ou 11 dígitos',
            'any.required': 'Telefone é obrigatório'
        }),
        carro: Joi.string().min(2).max(50).required().messages({
            'string.min': 'Modelo do carro deve ter pelo menos 2 caracteres',
            'any.required': 'Carro é obrigatório'
        }),
        placa: Joi.string().pattern(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i).optional().messages({
            'string.pattern.base': 'Placa deve estar no formato ABC1234 ou ABC1D23'
        }),
        km_media_mensal: Joi.number().integer().min(0).max(10000).default(1000)
    }),

    // Serviço
    servico: Joi.object({
        cliente_id: Joi.number().integer().positive().required(),
        servicos: Joi.array().items(Joi.string()).min(1).required().messages({
            'array.min': 'Pelo menos um serviço deve ser informado'
        }),
        km_realizado: Joi.number().integer().positive().required(),
        valor: Joi.number().positive().optional(),
        observacoes: Joi.string().max(500).optional(),
        data_servico: Joi.date().iso().required()
    }),

    // Notificação manual
    notificacaoManual: Joi.object({
        cliente_id: Joi.number().integer().positive().required(),
        tipo_servico_id: Joi.number().integer().positive().required(),
        mensagem: Joi.string().max(1000).optional()
    }),

    // ID de parâmetro
    idParam: Joi.object({
        id: Joi.number().integer().positive().required()
    })
};

/**
 * Middleware de validação
 * @param {string} schemaName - Nome do schema a validar
 * @param {string} source - Fonte dos dados ('body', 'params', 'query')
 */
const validate = (schemaName, source = 'body') => {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        if (!schema) {
            return res.status(500).json({
                sucesso: false,
                erro: `Schema de validação '${schemaName}' não encontrado`
            });
        }

        const dataToValidate = req[source];
        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                campo: detail.path.join('.'),
                mensagem: detail.message
            }));

            return res.status(400).json({
                sucesso: false,
                erro: 'Dados inválidos',
                detalhes: errors
            });
        }

        // Substituir dados originais pelos validados/sanitizados
        req[source] = value;
        next();
    };
};

/**
 * Sanitiza string para prevenir XSS
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Middleware para sanitizar body
 */
const sanitizeBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeString(req.body[key]);
            }
        });
    }
    next();
};

module.exports = {
    validate,
    sanitizeBody,
    sanitizeString,
    schemas
};

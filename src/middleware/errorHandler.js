const AppError = require('../utils/AppError');
const { sendError } = require('../utils/apiResponse');

function normalizeError(err) {
    if (err instanceof AppError) return err;

    if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400)) {
        return new AppError('Request body must be valid JSON', 400, 'INVALID_JSON');
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        return new AppError('A record with that value already exists', 409, 'CONFLICT');
    }

    if (err.name === 'SequelizeValidationError') {
        return new AppError('Validation failed', 400, 'VALIDATION_ERROR', err.errors?.map((item) => item.message));
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return new AppError('Related record does not exist', 400, 'INVALID_REFERENCE');
    }

    return new AppError('Internal server error', 500, 'INTERNAL_ERROR');
}

function errorHandler(err, req, res, next) {
    const normalized = normalizeError(err);
    console.error('Error:', err);

    if (res.headersSent) {
        return next(err);
    }

    return sendError(res, {
        status: normalized.status,
        message: normalized.message,
        code: normalized.code,
        details: normalized.details
    });
}

module.exports = errorHandler;

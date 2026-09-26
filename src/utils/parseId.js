const AppError = require('./AppError');

function parseId(value, label = 'id') {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError(`Invalid ${label}`, 400, 'INVALID_ID');
    }
    return id;
}

module.exports = parseId;

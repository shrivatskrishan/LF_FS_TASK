function buildMeta(req, extra = {}) {
    const meta = {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    };

    if (Array.isArray(extra.data)) meta.count = extra.data.length;
    if (extra.meta) Object.assign(meta, extra.meta);
    return meta;
}

function sendSuccess(res, { status = 200, message = 'Success', data = null, meta } = {}) {
    return res.status(status).json({
        success: true,
        message,
        data,
        meta: buildMeta(res.req, { data, meta })
    });
}

function sendError(res, { status = 500, message = 'Internal server error', code = 'INTERNAL_ERROR', details = null } = {}) {
    return res.status(status).json({
        success: false,
        message,
        data: null,
        error: {
            code,
            status,
            details
        },
        meta: buildMeta(res.req, {})
    });
}

module.exports = { sendSuccess, sendError };

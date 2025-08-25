"use strict";

function success(res, message = "Success", data = null, status = 200, extra = {}) {
    return res.status(status).json({ success: true, message, data, ...extra });
}
function error(res, message = "Error", status = 500, err = null) {
    return res.status(status).json({ success: false, message, error: err });
}

function created(res, message = "Created", data = null) {
    return success(res, message, data, 201);
}
function accepted(res, message = "Accepted", data = null) {
    return success(res, message, data, 202);
}
function noContent(res) {
    return res.status(204).send();
}

function badRequest(res, message = "Bad request") {
    return error(res, message, 400);
}
function unauthorized(res, message = "Unauthorized") {
    return error(res, message, 401);
}
function forbidden(res, message = "Forbidden") {
    return error(res, message, 403);
}
function notFound(res, message = "Not found") {
    return error(res, message, 404);
}
function conflict(res, message = "Conflict") {
    return error(res, message, 409);
}
function unprocessable(res, message = "Unprocessable Entity", err = null) {
    return error(res, message, 422, err);
}
function tooManyRequests(res, message = "Too Many Requests") {
    return error(res, message, 429);
}

function serverError(res, message = "Internal Server Error", err = null) {
    return error(res, message, 500, err);
}

function parsePagination(query = {}, defaults = { page: 1, limit: 20, maxLimit: 100 }) {
    const page = Math.max(parseInt(query.page ?? defaults.page, 10) || defaults.page, 1);
    const limitRaw = Math.max(parseInt(query.limit ?? defaults.limit, 10) || defaults.limit, 1);
    const limit = Math.min(limitRaw, defaults.maxLimit ?? 100);
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}

function pageMeta({ page, limit, total }) {
    const pages = Math.max(Math.ceil(total / Math.max(limit, 1)), 1);
    return {
        page,
        limit,
        total,
        pages,
        hasPrev: page > 1,
        hasNext: page < pages,
    };
}

function paginated(res, result, pageInfo, message = "Fetched successfully", extra = {}) {
    const meta = pageMeta({ ...pageInfo, total: result.count || 0 });
    return success(res, message, result.rows || [], 200, { pagination: meta, ...extra });
}

module.exports = {
    success,
    error,
    created,
    accepted,
    noContent,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    unprocessable,
    tooManyRequests,
    serverError,
    parsePagination,
    pageMeta,
    paginated,
};

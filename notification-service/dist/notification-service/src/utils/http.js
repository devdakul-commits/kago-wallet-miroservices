export function sendJson(res, payload, status = 200) {
    res.status(status).json(payload);
}
export function sendError(res, status, message) {
    sendJson(res, { error: message }, status);
}

export function sendJson(res, payload) {
    res.status(200).json(payload);
}
export function sendError(res, status, message) {
    res.status(status).json({ error: message });
}

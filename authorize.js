/**
*
* @param {http.IncomingMessage} req
* @param {http.ServerResponse} res
* @param {*} next
*/
function authorize(req, res, next) {
    if (req.signedCookies.user) {
        req.user = req.signedCookies.user;
        next();
    } else {
        //res.redirect('/');
        next();
    }
}

module.exports = authorize;
/**
* Redirects to the mainpage every user without a cookie
* @param {http.IncomingMessage} req
* @param {http.ServerResponse} res
* @param {*} next
*/
function authorize(req, res, next) {
    if (req.signedCookies.cookie) {
        var userCookie = JSON.parse(req.signedCookies.cookie);
        if (userCookie.userType == 'loggedIn' | userCookie.userType == 'noAccount') {
            // jwt token
            next();
        } else {
        res.redirect('./waitroom');
        }
    } else {
        res.redirect('/');
    }
}

module.exports = authorize;
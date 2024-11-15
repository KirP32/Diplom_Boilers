const jwt = require('jsonwebtoken');
require("dotenv").config();

async function checkCookie(req, res, next) {
    const authcookie = req.headers['accesstoken'];
    if (!authcookie) {
        return res.sendStatus(401);
    }

    jwt.verify(authcookie, process.env.JWT_SECRET_KEY, (err, data) => {
        if (err) {
            return res.sendStatus(401);
        } else {
            //console.log("Checked successfully");
            req.user = data;
            next();
        }
    });
}

module.exports = checkCookie;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { checkTokenExists } = require("../controller/data_controller");

async function checkCookie(req, res, next) {
  const authcookie = req.headers["accesstoken"];
  const refreshToken = req.cookies["refreshToken"];

  if (!authcookie) {
    return res.sendStatus(401);
  }
  if ((await checkTokenExists(refreshToken)) === false) {
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

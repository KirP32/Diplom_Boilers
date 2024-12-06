const jwt = require("jsonwebtoken");
require("dotenv").config();
const { checkTokenExists } = require("../controller/data_controller");

async function checkCookie(req, res, next) {
  // #TODO: Не обновлять refreshtoken при генерации accessToken
  const accesstoken = req.headers["accesstoken"];
  const refreshToken = req.cookies["refreshToken"];

  if (!accesstoken) {
    return res.sendStatus(401);
  }
  if ((await checkTokenExists(refreshToken)) === false) {
    console.log("token not exist");
    return res.sendStatus(401);
  }
  jwt.verify(accesstoken, process.env.JWT_SECRET_KEY, (err, data) => {
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

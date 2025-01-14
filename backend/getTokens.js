const jwt = require("jsonwebtoken");
require("dotenv").config();

const getTokens = (login, access_level, RememberMe, token, userID) => {
  const accessTokenAge = 60 * 20;
  let refreshTokenAge = RememberMe ? 60 * 60 * 24 * 31 : 60 * 60;

  if (token) {
    const tokenData = jwt.decode(token);
    if (tokenData) {
      const currentTime = Math.floor(Date.now() / 1000);
      const timePassed = currentTime - tokenData.iat;
      const tokenLifeTime = tokenData.exp - tokenData.iat;
      refreshTokenAge = Math.max(tokenLifeTime - timePassed, 0);
    } else {
      // console.log("Невалидный токен.");
    }
  }
  // console.log(
  //   `Оставшееся время жизни Refresh-токена: ${refreshTokenAge} секунд`
  // );
  return {
    accessToken: jwt.sign(
      { login, access_level, userID },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: accessTokenAge,
      }
    ),
    refreshToken: jwt.sign(
      { login, access_level, userID },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: refreshTokenAge }
    ),
  };
};

module.exports = {
  getTokens,
};

const jwt = require("jsonwebtoken");
require("dotenv").config();

const getTokens = (login, access_level, isSession) => {
  const accessTokenAge = "1h";
  const refreshTokenAge = isSession ? "1h" : "31d";
  return {
    accessToken: jwt.sign({ login, access_level }, process.env.JWT_SECRET_KEY, {
      expiresIn: `${accessTokenAge}`,
    }),
    refreshToken: jwt.sign(
      { login, access_level },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: `${refreshTokenAge}` }
    ),
  };
};

module.exports = {
  getTokens,
};

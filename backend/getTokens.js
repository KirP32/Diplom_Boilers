const jwt = require('jsonwebtoken');
require("dotenv").config();

const accessTokenAge = '1h';
const refreshTokenAge = '31d';

const getTokens = (login) => (
    {
        accessToken: jwt.sign({ login }, process.env.JWT_SECRET_KEY, { expiresIn: `${accessTokenAge}` }),
        refreshToken: jwt.sign({ login }, process.env.JWT_REFRESH_KEY, { expiresIn: `${refreshTokenAge}` }),
    }
)


module.exports = {
    getTokens,
    refreshTokenAge,
};
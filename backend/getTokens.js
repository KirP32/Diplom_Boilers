const jwt = require('jsonwebtoken');
require("dotenv").config();

const accessTokenAge = '1.5h';
const refreshTokenAge = '31d';

const getTokens = (login, access_level) => {
    return {
        accessToken: jwt.sign({ login, access_level }, process.env.JWT_SECRET_KEY, { expiresIn: `${accessTokenAge}` }),
        refreshToken: jwt.sign({ login, access_level }, process.env.JWT_REFRESH_KEY, { expiresIn: `${refreshTokenAge}` }),
    };
};

module.exports = {
    getTokens,
    refreshTokenAge,
};

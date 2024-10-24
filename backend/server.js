const express = require('express');
const fs = require('fs');
const { getTokens, refreshTokenAge } = require('./getTokens');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');

require("dotenv").config();

const app = express();

const port = process.env.PORT || 8080;

// хочу открыть порт 5432 и 8080 на ubuntu, я до этого закрывал все порты через команды, вроде ufw denu ALL

// #key
const key = 'esptest';
// #key

app.use(cookieParser());

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:5173', 'http://185.46.10.111', 'http://frontend:3000'],
    methods: ['GET', 'POST', 'PUT'],
    credentials: true,
}));


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ADS_Line',
    password: '123',
    port: 5432,
    client_encoding: 'utf8',
});

pool.connect((err) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Connected to PostgreSQL');
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/changes', (req, res) => {
    const key = req.query.key;
    console.log(`Received key: ${key}`);

    let str = `SELECT temperature, id FROM boilerinfo WHERE key = $1`;
    pool.query(str, [key], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log(result.rows);
            res.json(result.rows);
        }
    });
});

app.get('/test', (req, res) => {
    console.log("Test route working");
    res.status(200).send("Test route working");
});

app.get('/devices', checkCookie, (req, res) => {
    const devices = [
        { id: 1, name: 'floor1', status: 'online', boilers: [{ name: 'Котёл основной', t: 65, online: '15h 5m 10s' }, { name: 'Котёл гараж', t: 100, online: '1h 4m 55s' }, { name: 'Крыша', t: 47, online: '6h 14m 31s' },] },
        { id: 2, name: 'bath2', status: 'error' }, { id: 3, name: 'garage', status: 'check' },
        { id: 4, name: 'bathroom', status: 'check' }, { id: 5, name: 'Pool', status: 'check' },
        { id: 6, name: 'hatch', status: 'error' },
    ];
    res.json(devices);
});

app.get('/refresh', async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            console.error('Refresh token not provided');
            return res.status(401).send('UnauthorizedError: No token provided');
        }

        let flag_token;
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_KEY);
            flag_token = userData;
        } catch (e) {
            flag_token = null;
            console.error('Error refreshing token:', e);
            return res.status(500).send('Internal Server Error');
        }

        if (!flag_token || !(await checkTokenExists(token))) {
            return res.status(401).send('UnauthorizedError');
        }

        const { accessToken, refreshToken } = getTokens(flag_token.login);
        await updateToken(flag_token.login, refreshToken); // в БД

        res.cookie('refreshToken', refreshToken, { maxAge: 31 * 24 * 60 * 60 * 1000, httpOnly: true });
        return res.send({ accessToken });
    } catch (error) {
        console.error('Error in refresh token route:', error);
        return res.status(500).send('Internal Server Error');
    }
});



app.post('/login', (req, res) => {
    const { login } = req.body;
    const { password } = req.body;
    console.log(req.body);
    const str = "SELECT password_hash FROM USERS WHERE username = $1";
    pool.query(str, [login], async (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const pass_hash = result.rows[0].password_hash;
        const isValid = await bcrypt.compare(password, pass_hash);

        if (isValid) {
            console.log('Validation passed')
            const { accessToken, refreshToken } = getTokens(login);
            console.log('getToken passed')
            await updateToken(login, refreshToken);
            res.cookie("refreshToken", refreshToken, { maxAge: 31 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.send({ accessToken });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

app.post('/sign_up', async (req, res) => {
    const { login, password, email } = req.body;
    const hash = bcrypt.hashSync(password);
    try {
        const userResult = await pool.query(
            'INSERT INTO users (username, phone_number, password_hash) VALUES ($1, $2, $3)',
            [login, '123456789', hash]
        );

        if (userResult.rowCount > 0) {
            res.send('OK');
        } else {
            res.status(500).json({ error: 'Не удалось создать пользователя' });
        }
    } catch (error) {
        res.status(500).send('Ошибка при создании пользователя');
        console.error('Ошибка запроса:', error);
    }
});

// middleware использует accessToken для проверки а не refreshToken
app.post('/logout', checkCookie, async (req, res) => {
    const { refreshToken } = req.cookies;
    await deleteCookieDB(refreshToken);
    res.clearCookie('refreshToken');
    res.status(200).send({ message: 'Logged out successfully' });
});


app.post('/info', (req, res) => {
    console.log(req.body);
    const { boiler_key } = req.body;
    const { id } = req.body;
    const { lastchanges } = req.body;
    console.log('Received POST request on /info');
    console.log(req.body);
    if (boiler_key == key) {
        console.log('--key accepted--');
        let str = 'UPDATE boilerinfo SET lastchanges = $1 WHERE id = $2'
        pool.query(
            str,
            [lastchanges, id],
            (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    console.log("Data added to DB");
                    console.log(req.body);
                    res.status(200).send("Данные успешно приняты");
                }
            }
        );
    } else {
        res.status(400).send("Некорректный ключ");
    }
});


async function checkCookie(req, res, next) {
    const authcookie = req.headers['accesstoken'];

    if (!authcookie) {
        return res.sendStatus(401);
    }

    jwt.verify(authcookie, process.env.JWT_SECRET_KEY, (err, data) => {
        if (err) {
            return res.sendStatus(401);
        } else {
            console.log("Checked successfully");
            req.user = data;
            next();
        }
    });
}

async function updateToken(login, refreshToken) {
    try {
        const getUserQuery = `SELECT id FROM users WHERE username = $1`;
        const userResult = await pool.query(getUserQuery, [login]);

        if (userResult.rows.length === 0) {
            console.log('User not found');
            return;
        }

        const userID = userResult.rows[0].id;

        const updateTokenQuery = `
            INSERT INTO refreshtokens (user_id, refreshtoken)
            VALUES ($1, $2)
            ON CONFLICT (user_id)
            DO UPDATE SET refreshtoken = EXCLUDED.refreshtoken;
        `;
        await pool.query(updateTokenQuery, [userID, refreshToken]);

        console.log('Token updated successfully');
    } catch (err) {
        console.error('Error updating token:', err);
    }
}

const checkTokenExists = async (refreshToken) => {
    try {
        const result = await pool.query(
            "SELECT EXISTS(SELECT 1 FROM refreshtokens WHERE refreshtoken = $1)",
            [refreshToken]
        );
        return result.rows[0].exists;
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
    }
};

async function deleteCookieDB(refreshToken) {
    try {
        const userResult = await pool.query('DELETE FROM refreshtokens WHERE refreshtoken = $1', [refreshToken]);
        console.log('deleted successfully');
        return userResult;
    } catch (error) {
        console.log(error);
    }
}

//let counter = 1;

app.get('/test_esp', async (req, res) => {

    const api = req.headers['authorization'];
    await axios.get('http://185.113.139.204:8000/module/get/0-00002', {
        headers: {
            Authorization: api,
            "Content-Type": 'application/json',
        }
    })
        .then((response) => {
            res.send(response.data);
        })
        .catch((error) => {
            console.log(error);
        })
});

app.put('/off_esp', async (req, res) => {
    const api = req.headers['authorization'];
    const { indicator } = req.body;
    const url = `http://185.113.139.204:8000/module/serial/0-00002/command=${indicator}`;
    await axios.put(url, {}, {
        headers: {
            Authorization: api,
            "Content-Type": 'application/json',
        }
    })
        .then((response) => {
            res.send(response.data);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send('Ошибка на сервере');
        });
});

const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 8080;
let counter = 0;

// #key
const key = 'esptest';
// #key

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT'],
    credentials: true
}));

const { Pool } = require('pg');

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

app.use(express.json());
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/changes', (req, res) => {
    const key = req.query.key;
    console.log(`Received key: ${key}`);

    let str = `SELECT temperature, id FROM boilerinfo WHERE key = '${key}'`;
    pool.query(str, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log(result.rows);
            res.json(result.rows);
        }
    });
});

app.post('/info', (req, res) => {
    console.log(req.body);
    const { boiler_key } = req.body;
    const { id } = req.body;
    const { lastchanges } = req.body;
    console.log('Post ');
    if (boiler_key == key) {
        console.log('--key accepted--');
        res.status(200).send("Данные успешно приняты");
        let str = 'UPDATE boilerinfo SET lastchanges = $1 WHERE id = $2'
        pool.query(
            str,
            [lastchanges, id],
            (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    res.status(200);
                }
            }
        );
    } else {
        res.status(400).send("Некорректный ключ");
    }
});

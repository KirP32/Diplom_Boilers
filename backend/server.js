const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const router = require('./routes/index');
const pool = require('./dataBase/pool');

const app = express();

const port = process.env.PORT || 8080;

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://185.46.10.111', 'http://frontend:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

pool.connect((err) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

app.use('/', router);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
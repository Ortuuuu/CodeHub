require('dotenv').config();

const PORT = process.env.PORT || 3000;
const TEACHER_KEY = process.env.TEACHER_KEY;
const FRONTEND_URL = "http://localhost:8080";

module.exports = {
    PORT,
    TEACHER_KEY,
    FRONTEND_URL
};
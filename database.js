const express = require('express')
const app = express()

const mysql = require('mysql2');


const connection = mysql.createConnection({
  host: 'mysql',
  port : '3306',
  user: 'root',
  password: 'duddbs',
  database: 'photoplace'
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL 연결 실패: ', err);
    throw err;
  }
  console.log('MySQL 연결 성공!');
});

module.exports = connection;
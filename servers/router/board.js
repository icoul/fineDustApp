const express = require('express');
const router = express.Router();
const moment = require('moment');
const connection = require("../connection");            // DB connection by connection.js

/* GET info page. */
router.get('/', (req, res, next) => {
    const query = 'SELECT nums, title, views, date, autor From y_board';
    connection.query(query, (err, rows, fields) => {
        if (!err) {
            console.log('wow');
            res.render('content/board', {
                'boardDatas': rows.map(data => {
                    return {
                        nums: data.nums,
                        title: data.title,
                        views: data.views,
                        date: moment(data.date).format('YYYY.MM.DD HH:mm'),
                        autor: data.autor
                    }
                })
            });
        } else {
            console.log(err);
            res.render('content/board', err);
        }
    })
})

/* GET info page. */
module.exports = router;

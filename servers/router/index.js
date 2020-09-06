const express = require('express');
const router = express.Router();
const moment = require('moment');
const connection = require("../connection");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

const nvl = (value) => {
  return (value === null || value === void 0) ? 0 : value;
}

const getDustStatus = (value) => {              // 미세먼지 그래프 시각화 (파 -> 초 -> 노 -> 빨, 예외 파랑)
  if (value <= 30) {
    return '#187FCC'
  } 
  else if (value > 30 && value <= 80) {
    return '#8EC641'
  }
  else if (value > 80 && value <= 150) {
    return '#FFD014'
  }
  else if (value > 150 && value <= 600) {
    return '#ff1414'
  }
  else {
    return '#187FCC'
  }
}

const getUltraFineDustStatus = (value) => {     // 미세먼지 남침반 시각화 (파 -> 초 -> 노 -> 빨, 예외 파랑) => 실 표현 값
  if (value <= 15) {
    return '#187FCC'
  } 
  else if (value > 15 && value <= 35) {
    return '#8EC641'
  }
  else if (value > 35 && value <= 75) {
    return '#FFD014'
  }
  else if (value > 75 && value <= 500) {
    return '#ff1414'
  }
  else {
    return '#187FCC'
  }
}

router.get('/api/get/chartdata', function(req, res, next) {
  const query = `
    SELECT A.*
    FROM 
    (
      SELECT MAX(pm10_0) AS dust, MAX(pm2_5) AS ultrafine, rgst_dt
      FROM finedust_tb 
      GROUP BY SUBSTR(rgst_dt, 1, 13)
      ORDER BY rgst_dt DESC 
      LIMIT 10
    ) A
    ORDER BY rgst_dt ASC`;

  connection.query(query, (err, rows, fields) => {
    if (!err) {
      res.send(rows.length > 0 ? {
        dustData: rows[0].dust, 
        ultrafineData: rows[0].ultrafine, 
        lineGraphData: rows.map(data => {
          return {'rgstDt': moment(data.rgst_dt).format('MM-DD hh'), 'dust': data.dust, 'ultrafine': data.ultrafine, 'status': getUltraFineDustStatus(data.ultrafine)}
        })
      } : {});
    }
    else {
      console.log(err);
      res.send(err);
    }
  })
});

router.get('/api/get/pm/now', function(req, res, next) {
  const queryForHour = `
    SELECT MAX(pm10_0) AS ultrafineHour, MAX(pm2_5) AS dustHour, temperature, SUBSTR(rgst_dt, 6, 13) AS rgstDt  
    FROM finedust_tb 
    WHERE rgst_dt LIKE '${moment().format('YYYY-MM-DD HH')}%'
    GROUP BY SUBSTR(rgst_dt, 1, 13) 
    ORDER BY rgst_dt DESC 
  `;
  
  const queryForToday = `
    SELECT MAX(pm10_0) AS ultrafineDay, MAX(pm2_5) AS dustDay, temperature, SUBSTR(rgst_dt, 6, 13) AS rgstDt 
    FROM finedust_tb 
    WHERE rgst_dt LIKE '${moment().format('YYYY-MM-DD')}%'
    GROUP BY SUBSTR(rgst_dt, 1, 10) 
    ORDER BY rgst_dt DESC 
  `;

  connection.query(queryForHour, (err, rows, fields) => {
    if (!err) {
      const rowsForHour = rows[0];

      connection.query(queryForToday, (err, rows, fields) => {
        if (!err) {
          const rowsForToday = rows[0];
          
          res.send({
            ...rowsForHour,
            ...rowsForToday,
            dustStatus: getDustStatus(nvl(rowsForHour) !== 0 && rowsForHour.length > 0 ? rowsForHour.dustHour : 0),
            ultrafineStatus: getUltraFineDustStatus(nvl(rowsForHour) !== 0 && rowsForHour.length > 0 ? rowsForHour.ultrafine : 0),
            temperature: nvl(rowsForHour) !== 0 ? rowsForHour.temperature : 0,
            today: moment().format('YYYY년 MM월 DD일 hh시')
          });
        }
        else {
          console.log(err);
          res.send(err);
        }
      })
    }
    else {
      console.log(err);
      res.send(err);
    }
  })
});

module.exports = router;

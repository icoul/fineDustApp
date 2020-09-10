const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const server = require('./servers/server');

const indexRouter = require('./servers/router/index');        // "실시간 자료조회" 상단 버튼 & 초기 화면
const infoRouter = require('./servers/router/info');          // "통계 정보" 상단 버튼
const supportRouter = require('./servers/router/support');    // "고객 지원" 상단 버튼
const boardRouter = require('./servers/router/board');        // "게시판" 상단 버튼
const addBoardRouter = require('./servers/router/addBoard');  // "게시판 글 작성"
const dataCheckRouter = require('./servers/router/dataCheck');

const app = express();
const config = require('./config.json')[app.get('env')];

app.set('config', config);
// view engine setup => 서버 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));        // (post 미들웨어)
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));        // (정적 미들웨어)파일의 경로 설정 => express.static(__dirname+'/public') 이런 식으로도 사용 하지만 '나 /같이 불필요한게 있으면 오류
app.use('/', indexRouter);
app.use('/info', infoRouter);
app.use('/support', supportRouter);
app.use('/board', boardRouter);                                 // 게시판 사용
app.use('/addBoard', addBoardRouter);                           // 글 작성 사용
app.use('/dataCheck', dataCheckRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// tcp ip server
server.listen(3002, function() {
  console.log('Server listening: ' + JSON.stringify(server.address()));
  server.on('close', function(){
      console.log('Server Terminated');
  });
  server.on('error', function(err){
      console.log('Server Error: ', JSON.stringify(err));
  });
});

module.exports = app;
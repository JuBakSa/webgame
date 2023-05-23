const express = require('express');
const app = express();

//DB연결
var dbConfig = require(__dirname + '/config/db.js');
var conn = dbConfig.init();

dbConfig.connect(conn);

//클라이언트에서 전송된 데이터를 파싱하는 body-parser 미들웨어를 사용
//SQL Injection 가능하도록 코드 작성하기 위함
const bodyParser = require('body-parser'); 
app.use(bodyParser.urlencoded({ extended: false }));

//세션 설정
const session = require('express-session');

app.use(
    session({
      secret: 'mySecretKey', // 세션을 암호화하기 위한 시크릿 키
      resave: false,
      saveUninitialized: true
    })
  );

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


app.listen(8000, console.log('8000포트로 시작'));

// 메인 페이지 라우트
app.get('/', function(req, res) {
  // 세션에서 로그인한 사용자 정보 가져오기
  const username = req.session.username; // 세션에서 이름 가져오기
  const userId = req.session.userId; // 세션에서 id 가져오기

  if (username) {
    res.render('index', { username: username, id: userId }); // 이름, id 변수 전달
  } else {
    res.render('index', { username: null, id: null }); // 이름, id 변수 전달
  }
});

  
// 로그인 페이지 라우트
app.get('/login', function(req, res){
    res.sendFile(__dirname + '/user/login.html');
});

// 회원가입 페이지 라우트
app.get('/register', function(req, res){
    res.sendFile(__dirname + '/user/register.html');
});

// 회원가입 처리 라우트
app.post('/register', (req, res) => {
    const { id, email, name, pw } = req.body;
  
    // 취약한 형태의 SQL 쿼리 (SQL 삽입 공격 가능)
    const sql = `INSERT INTO sign_tb (id, email, name, pw) VALUES ('${id}', '${email}', '${name}', '${pw}')`;
  
    conn.query(sql, (err, result) => {
      if (err) {
        console.error('MySQL 쿼리 에러:', err);
        res.send(`<script>alert('회원가입 오류 발생'); location.href = '/';</script>`);
      } else {
        console.log('회원가입 성공:', result);
        res.send(`<script>alert('회원가입 성공'); location.href = '/';</script>`);
      }
    });
  });

// 로그인 처리 라우트
app.post('/login', (req, res) => {
  const { id, pw } = req.body;

  // 입력된 아이디와 비밀번호를 사용하여 회원 정보 조회
  const sql = `SELECT * FROM sign_tb WHERE id = '${id}' AND pw = '${pw}'`;

  conn.query(sql, (err, result) => {
    if (err) {
      console.error('MySQL 쿼리 에러:', err);
      res.send(`<script>alert('로그인 오류 발생'); location.href = '/login';</script>`);
    } else {
      if (result.length > 0) {
        // 로그인 성공
        console.log('로그인 성공:', result);
        const username = result[0].name;

        // 세션에 사용자 이름과 아이디 저장
        req.session.username = username;
        req.session.userId = id;

        res.send(`<script>alert('로그인 성공'); location.href = '/';</script>`);
      } else {
        // 로그인 실패: 아이디 또는 비밀번호가 일치하지 않음
        console.log('로그인 실패');
        res.send(`<script>alert('아이디 또는 비밀번호가 일치하지 않습니다.'); location.href = '/login';</script>`);
      }
    }
  });
});

  
// 로그아웃 처리 라우트
app.get('/logout', function(req, res) {
    // 세션에서 사용자 정보 삭제
    req.session.destroy(function(err) {
      if (err) {
        console.error('세션 삭제 에러:', err);
        res.send(`<script>alert('로그아웃 오류 발생'); location.href = '/';</script>`);
      } else {
        res.send(`<script>alert('로그아웃 성공'); location.href = '/';</script>`);
      }
    });
  });
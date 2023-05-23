const mysql = require('mysql');
const dbInfo = {
    host: 'project-db-1', // MySQL 컨테이너의 서비스 이름을 호스트로 사용
    port: '3306',
    user: 'root',
    password: '1234',
    database: 'webgame'
};

module.exports = {
    init: function () {
        return mysql.createConnection(dbInfo);
    },
    connect: function(conn) {
        // 10초 대기 후 연결 시도
        setTimeout(function() {
            conn.connect(function(err) {
                if(err) console.error('mysql 연결 에러 : ' + err);
                else console.log('mysql 연결 성공');
            });
        }, 10000);
    }
};

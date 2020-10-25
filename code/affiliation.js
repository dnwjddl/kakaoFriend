affiliation.js

const express = require("express");
const affiliation = express.Router();
const defaultObj = require("./default_value.js");
const phoneBody = defaultObj.phoneBody;
const searchFaultMessage = defaultObj.searchFaultMessage;
const mysql = require("mysql");

const connection = mysql.createConnection({       // mysql 연결.
    host : "13.125.114.52",
    user : "root",
    password : "!d8h6ukja123",
    port : 3306,
    database : "kakao"
    })

function selectCourseInform(sql, ...value){
    return new Promise(async function(resolve, reject){

        const standard = ["과목명 : ", "강의 시간 : ", "교수명 : ", "학점 : ", "학수번호 : "];  // select한 수업정보를 화면에 출력할 때의 규격으로, "과목명 : 월드뮤직"과 같이 출력하기 위함. 
        const columnName= ["courseName", "period", "professorName", "credit", "academicNumber"];   // 컬럼명

        let result = "";   // 최종적으로 resolve할 데이터.
        
        const rows = await queryExec(sql, ...value);  

            for(let i = 0;  i < rows.length; i++) // select한 row의 개수만큼 실행
            {
                for(let j = 0; j < columnName.length; j++)    // 컬럼의 개수 만큼 실행 
                {
                    let data = rows[i][columnName[j]];
                        
                    if(standard[j] === "강의 시간 : ")
                        data = data.replace("\n", "\n                 ");

                    result += standard[j] + data;  // 규격과 컬럼의 데이터를 붙어서 returnValue에 붙인다.
                    
                        
                    if(!(i === rows.length - 1 && j === columnName.length - 1))   // 마지막 row의 마지막 컬럼이 아니라면 if문 실행(마지막row의 마지막 컬럼의 경우 개행을 붙여주지 않음.)
                    {
                        if(j === columnName.length -1)    // 마지막 컬럼의 경우 \n\n을 붙여줘서 각 row를 구분한다.
                            result += "\n\n";
                        else
                            result += "\n";          // 마지막 컬럼이 아니라면 \n로 컬럼을 구분한다.
                    }
                }
            }
        resolve(result);
    })
}

    function queryExec(sql, ...value)      // async, await을 사용하기 위해 프로미스를 반환한다.
{
    return new Promise(function(resolve, reject){
        connection.query(sql, value, function(err, rows){   // sql과 sql문에 사용될 속성과 값을 입력으로 받음.
            if(!err)    // 에러가 발생하지 않으면 select한 rows를 resolve
                resolve(rows);
            else        // 에러가 발생하면 err를 reject
                reject(err);
        })
    });
}

affiliation.post("/course_inform", function(req, res){     // 수업 정보
    const responseBody = defaultObj.searchBody;
    const params = req.body.action.detailParams;    
    const simpleText = responseBody.template.outputs[0].simpleText;

    (async function(){  
        const id = req.body.userRequest.user.id;     
        const sql = "SELECT * FROM user_inform WHERE id = ?"; // 사용자가 등록되어 있는지 확인하기 위한 sql문.
        const rows = await queryExec(sql, id);    // select문으로 user_inform 테이블을 검색한 후 결과 반환.

        if(rows.length === 0){
            const simpleText = defaultObj.enrollBody.template.outputs[0].simpleText;
            simpleText.text = defaultObj.notEnrolled;
            res.status(200).send(defaultObj.enrollBody);
        }
        else{
            const graduateSchool = rows[0].graduateSchool;    // 테이블에 저장되어 있는 대학원명을 graduateSchool에 저장.
            const major = rows[0].affiliation;
        
            let courseTableName = defaultObj.courseTableName;
            const tableName = courseTableName[graduateSchool];
            let result = "";

            if(params["sys_text"] === undefined){   // 사용자가 sys_text 아닌 필수 파라미터를 입력한 경우 
                try{
                    const informSql = `SELECT * FROM ?? WHERE affiliation = ? AND professorName LIKE ${connection.escape('%' + `${params["professor_name"].value}` +'%')}`;    // 입력받은 파라미터에 따라 SQL문을 다르게 할 수 있음.
                    result = await selectCourseInform(informSql, tableName, major);   // ??에는 입력 받은 파라미터에 대응하는 파라미터명이 대응됨.
                }catch(err){                                                                                                   // ?에는 입력받은 파라미터의 value가 대응됨.
                    console.log(err);
                }
            }
            else{   // 사용자가 "수업 정보"를 입력하고 필수 파라미터에 해당하는 정보를 입력하지 않은 경우 
                try{
                    let likeSql = `SELECT * FROM ${tableName} WHERE affiliation = ? AND courseName LIKE ${connection.escape('%' + `${params["sys_text"].value}` +'%')}`;  
                    // 다른 필수 파라미터에 대응되지 않아 sys_text가 입려되면 like 연산자를 사용해서 사용자가 입력한 발화가 포함된 과목명을 select.
                    // (학점, 교수명, 강의실, 학수번호의 경우 like 연산자가 사용될 필요가 없다고 판단함.)

                    if(params["sys_text"].value === "전체") // 전체를 입력할 경우 모든 수업 정보가 출력.
                        likeSql = `SELECT * FROM ${tableName} where affiliation = ?`;  

                        console.log(likeSql);
                    result = await selectCourseInform(likeSql, major);    // 정보를 찾지 못하는 경우에는 반환된 검색 결과를 사용자에게 전달하지 않고 기본 메시지를 전달.                     
                }catch(err){
                    console.log(err);
                }
            }

            if(result !== "")
                simpleText.text = result;
            else
                simpleText.text = searchFaultMessage;

            res.status(200).send(responseBody);
        }
    })();
})

function selectNotice(sql,...value)
{
    return new Promise(async function(resolve, reject){
        
        let rows = await queryExec(sql,value);    // 공지사항 select
        let returnValue = [];   

        if(rows.length === 0)
            resolve(null);

        for(let i = 0; i < rows.length; i++)    // select한 row 개수만큼 실행
        {
            const obj = {   
                "title" : rows[i].title,
                "description" : rows[i].writeDate,
                "link" : {
                    "web" : rows[i].url
                }
            }
            returnValue.push(obj);  // 배열에 push해서 listCard의 items 형식에 맞춤.
        }
        resolve(returnValue);    
    })
}

affiliation.post("/notice", function(req, res){     // 수업 정보
    (async function(){
        let id = req.body.userRequest.user.id;     
        let sql = "SELECT * FROM user_inform WHERE id = ?"; // 사용자가 등록되어 있는지 확인하기 위한 sql문.
        let rows = await queryExec(sql, id);    // select문으로 user_inform 테이블을 검색한 후 결과 반환.

        if(rows.length === 0){
            let simpleText = defaultObj.enrollBody.template.outputs[0].simpleText;
            simpleText.text = defaultObj.notEnrolled;
            res.status(200).send(defaultObj.enrollBody);
        }
        else{
            let graduateSchool = rows[0].graduateSchool;    // 테이블에 저장되어 있는 대학원명을 graduateSchool에 저장.
    
            const noticeTableName = defaultObj.noticeTableName; // 사용자가 등록한 대학원명에 따라 검색할 table을 달리하게 하기 위한 object
            const page = defaultObj.page;   // 사용자가 등록한 대학원명에 따라 공지사항 홈페이지 url을 달리하기 위한 object

            const noticeSql = "SELECT * FROM ?? WHERE id < 6 "   // 검색할 테이블은 사용자가 등록한 정보에 따라 다름.
            let noticeArr = await selectNotice(noticeSql, noticeTableName[graduateSchool]);  // sql문의 ?? 부분을 noticeTableName[graudateSchool]로 대체

            if(noticeArr === null)  // 새로운 공지사항이 없는 경우
            {   
                noNewNoticeBody = defaultObj.noNewNoticeBody;  
                noNewNoticeBody.template.outputs[0]["basicCard"]["buttons"][0]["webLinkUrl"] = page[graduateSchool];    

                res.status(200).send(noNewNoticeBody);  // simpleBody를 사용할 경우 enroll 블록에서 같은 object를 공유하면서 데이터를 덮어쓰는 문제 때문에 따로 만들어줌.
            }
            else{
                let noticeBody = defaultObj.noticeBody;
                noticeBody.template.outputs[0]["listCard"]["items"] = noticeArr;    
                noticeBody.template.outputs[0]["listCard"]["buttons"][0]["webLinkUrl"] = page[graduateSchool];

                res.status(200).send(noticeBody);
            }
        }
    })();
});


affiliation.post("/department_office", function(req, res){     // 수업 정보
    (async function(){
        const id = req.body.userRequest.user.id;     
        const sql = "SELECT * FROM user_inform WHERE id = ?"; // 사용자가 등록되어 있는지 확인하기 위한 sql문.
        const rows = await queryExec(sql, id);    // select문으로 user_inform 테이블을 검색한 후 결과 반환.
        const basicCard = phoneBody.template.outputs[0].basicCard;  

        if(rows.length === 0){
            const simpleText = defaultObj.enrollBody.template.outputs[0].simpleText;
            simpleText.text = defaultObj.notEnrolled;
            res.status(200).send(defaultObj.enrollBody);
        }
        else{
            const graduateSchool = rows[0].graduateSchool;    // 테이블에 저장되어 있는 대학원명을 graduateSchool에 저장.
            let major = rows[0].affiliation;

            const departmentSql = `select * from department_office where graduateSchool = ? AND affiliation = ? `;
            const departmentInform = await queryExec(departmentSql, graduateSchool, major);
            const phoneNumber = departmentInform[0].phoneNumber;
            const location = departmentInform[0].location;
            major = departmentInform[0].affiliation;

            let result = "😱 학기중 : 9:00-17:30\n" +
                         "😁 방학중 : 9:00-15:00\n\n";

            result += "🏢 " + major + "\n\n📞 전화번호 : " + phoneNumber + "\n" + "🌎 위치 : " + location;
            basicCard["description"] = result;

            phoneBody.template.outputs[0]["basicCard"]["buttons"][0]["phoneNumber"] = phoneNumber; 
            res.status(200).send(phoneBody);
        }

    })();
})
module.exports = affiliation;
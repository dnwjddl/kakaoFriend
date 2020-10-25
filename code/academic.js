academic.js

const express = require("express");
const academic = express.Router();
const defaultObj = require("./default_value.js");
const simpleBody = defaultObj.simpleBody;
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


const startYear = "2019", endYear = "2020"; // 하드코딩하지 않기 위해 변수로 잡아놓고 replace의 정규식에 사용하려고 햇지만 아직 수정하지 못함.

function selectCalendar(start, end, sql, ...params) // academic_calendar 테이블에서 start부터 end에 해당하는 달의 content들을 연결하여 반환한다. (sql문과 params에 따라 다르게 동작할 수 있다.)
{
    return new Promise(async function(resolve, reject){ // async, await을 사용하기 위해 프로미스를 반환한다.
        const rows = [];   // row가 여러개 select되는 경우 결과를 담는 배열
        let returnValue = null; // 각 row의 content를 개행으로 구분해서 붙인 전체 결과로, 최종적으로 resolve할 데이터이다.
    
        for(let i = start; i <= end; i++)   // start부터 end에 해당하는 month의 row를 select
            rows.push(await queryExec(sql, "month", i, ...params));   // row들을 배열에 push
    
        returnValue = rows.reduce((a, x, i) => {   // 첫번째 row를 제외한 각 row의 content에 개행을 붙이고, content들을 연결한 결과를 최종적으로 resolve할 returnValue 변수에 저장.
            if(i !== 0)
                a += "\n\n\n";
            return a += x[0].content}, ""); 
        resolve(returnValue);
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

academic.post("/calendar", function(req, res){
    
    const responseBody = defaultObj.searchBody;
    const params = req.body.action.detailParams;    
    const sql = `SELECT content FROM academic_calendar WHERE ?? = ?`;  
    const elseSql = `SELECT content FROM academic_calendar WHERE ?? = ? AND ??= ?`;   
    const simpleText = responseBody.template.outputs[0].simpleText;

    (async function(){  // 동기적 실행
    //connection.connect(); //주석 처리하지 않으면 Cannot enqueue Handshake after invoking quit.가 발생한다. 

  if(params["month"] !== undefined    // 월만 입력받은 경우.(그룹 파라미터이기 때문에 하나만 오지만 혹시 모를 상황에 대비하여 나머지 경우도 undefinded인지 체크)
    &&(params["month_period"] === undefined 
    && params["year_period"] === undefined))
    {
        try{
            let result = await queryExec(sql, "month", params["month"].value.replace("월", ""));    // 사용자가 입력한 달에 해당하는 row를 select하고, result에 resolve한 값이 저장된다.
            
            if(result.length > 1)   // 사용자가 2월을 입력한 경우 2019년과 2020년 둘다 보여주기 위해 쿼리문의 결과를 연결한다.
                simpleText.text = result.reduce((a, x, i) => {
                    if(i !== 0)
                        a += "\n\n\n";  // 첫번째 row를 제외하고 개행을 붙여서 구분되게 한다.
                    return a += x.content}, "");
            else
                simpleText.text = result[0].content; // 2월이 아닌 경우는 row가 하나 이므로 inform에 result[0].content를 저장.
        }catch(err){
            console.log(err);
        }
    }
    else if(params["month_period"] !== undefined    // 월, 기간을 입력받은 경우
    &&(params["month"] === undefined 
    && params["year_period"]=== undefined))
    {
        try{
            const remove = params["month_period"].value.replace(/월/gi, "").split("~"); // 5월 ~ 6월로 입력이 들어온 경우 remove에 ['5 ', ' 6']이 들어가게 끔 정리(공백은 아직 처리하지 않은 상태)

            for(let i = 0; i < remove.length; i++)
                remove[i] = remove[i].trim();   // 각 달의 양 끝부분의 공백을 제거한다.
            
            if(remove[0] === "1" && remove[1]==="2")
                simpleText.text = await selectCalendar(1, 2, elseSql, "year", endYear);   // ex. 5월 ~ 7월을 발화로 입력받은 경우 5는 remove[0], 7은 remove[1], 따라서 5는 start, 7은 end로 selectCalendar의 매개변수에 전달해서 각 content를 연결한 결과를 반환받는다. 
            else                
                simpleText.text = await selectCalendar(remove[0], remove[1], sql);   // ex. 5월 ~ 7월을 발화로 입력받은 경우 5는 remove[0], 7은 remove[1], 따라서 5는 start, 7은 end로 selectCalendar의 매개변수에 전달해서 각 content를 연결한 결과를 반환받는다. 
        }catch(err){
            console.log(err);
        }
    }
    else{   // 년도와 월을 입력 받은 경우.
        try{
            const removeMonth = params["year_period"].value.replace(/월/gi, "").replace(/2019년/gi, "").replace(/2020년/gi, "").split("~"); // 2019년 3월 ~ 2020년 1월을 받은 경우, 월만 남도록 처리
            //const removeYear = params["year_period"].value.replace(/.월/gi, "").replace(/년/gi, "").split("~");
            
            for(let i = 0; i < removeMonth.length; i++)
                removeMonth[i] = removeMonth[i].trim();   // 각 달의 양 끝부분의 공백을 제거한다.

            //for(let i = 0; i < removeYear.length; i++)
              //  removeYear[i] = removeYear[i].trim();   // 각 년도의 양 끝부분의 공백을 제거한다.    
            
            if(Number(removeMonth[0]) < Number(removeMonth[1])){ // 같은 년도인 경우(같은 년도의 경우 removeMonth[0]이 removeMonth[1] 보다 클 수 없도록 엔티티가 등록되어 있음.)
                simpleText.text = await selectCalendar(removeMonth[0], removeMonth[1], sql);
            }
            else{        // 사용자가 입력한 발화가 두 해에 걸치는 경우      
                simpleText.text = await selectCalendar(removeMonth[0], 12, sql); // ex. 2019년 10월 ~ 2020년 2월의 경우, 2019년 10월 ~ 2019년 12월의 content를 반환.
                simpleText.text += "\n\n\n" + await selectCalendar(1, removeMonth[1], elseSql, "year", endYear); // ex. 2019년 10월 ~ 2020년 2월의 경우, 2020년 1월 ~ 2020년 2월을 반환. 
            }
            
        }catch(err){
            console.log(err);
        }
    }

  
  //connection.end();   //주석 처리하지 않으면 Cannot enqueue Handshake after invoking quit.가 발생한다. 
  res.status(200).send(responseBody);
    })();
})

academic.post("/professor", function(req, res){
    (async function(){
        const id = req.body.userRequest.user.id;     
        const sql = "SELECT * FROM user_inform WHERE id = ?"; // 사용자가 등록되어 있는지 확인하기 위한 sql문.
        const rows = await queryExec(sql, id);    // select문으로 user_inform 테이블을 검색한 후 결과 반환.
        const simpleText = simpleBody.template.outputs[0].simpleText;  
        const basicCard = phoneBody.template.outputs[0].basicCard;  
        const params = req.body.action.detailParams;

        if(rows.length === 0){
            const simpleText = defaultObj.enrollBody.template.outputs[0].simpleText;
            simpleText.text = defaultObj.notEnrolled;
            res.status(200).send(defaultObj.enrollBody);
        }
        else{
            const selectSql = `SELECT * FROM professor WHERE professorName LIKE ${connection.escape('%' + `${params["sys_text"].value}` +'%')}`;
            const professorInform = await queryExec(selectSql);
            simpleText.text = "";
            basicCard.description = "";

            if(professorInform.length !== 0){
                
                const phoneNumber = professorInform[0].phoneNumber;
                for(let i = 0; i < professorInform.length; i++) {
                    basicCard.description += "👨 🏫" + professorInform[i]["inform"];   
                    
                    if(i !== professorInform.length - 1)
                        basicCard.description += "\n\n"; 
                }
                
                phoneBody.template.outputs[0]["basicCard"]["buttons"][0]["phoneNumber"] = phoneNumber; 
                res.status(200).send(phoneBody);
            }
            else{
                simpleText.text = searchFaultMessage;
                res.status(200).send(simpleBody);
            }
        }
    })();
});

module.exports = academic;
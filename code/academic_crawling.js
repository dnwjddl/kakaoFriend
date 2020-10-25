academic_crawling.js

const schedule = require("node-schedule");
const puppeteer = require("puppeteer");   
const mysql = require("mysql");

const YEARSTART = 0,YEAREND = 3; // ex) 2018년 02월에서 index 0~3는 year를  
const MONTHSTART = 6, MONTHEND = 7; // 6 ~ 7은 month를 나타냄. 

const scheduler = schedule.scheduleJob("0 0 15 * * 0", function(){

    (async function main()
    {
        let connection = mysql.createConnection({       // mysql 연결.
            host : "13.125.114.52",
            user : "root",
            password : "!d8h6ukja123",
            port : 3306,
            database : "kakao"
        })
        
        let browser = await puppeteer.launch();
        let page =  await browser.newPage();

        await page.goto("https://www.smu.ac.kr/gsct/calendar/schedule2.do?mode=list");  // 페이지 이동
        await page.waitFor("[class = 'smu-table pd-b-con'] tbody tr");  // 해당 selector에 해당하는 element가 페이지에 나타날 떄까지 대기를 한다.

        let calElem = await page.$("[class = 'smu-table pd-b-con']");   // 학사 일정 정보를 가져오기 위해 document.querySelector를 수행하여 class가 smu-table pd-b-con']인 DOM 엘리먼트의 EventHandle을 가져온다.

        let content = `${i}`+await calElem.$eval("tbody", function (el){   // 브라우저 컨텍스 상에서 함수를 실행하여 값을 돌려준다. 첫번째 인자는 selector
            return el.innerText;    // tbody와 그 자손의 렌더링된 텍스트를 반환
        }) 


        let organized = (content.replace(/\n/gi, "\n\n").replace(/\t/gi, "\n").replace(/2019년/gi, "zz2019년").replace(/2020년/gi, "zz2020년").substring(2).trim()).split("zz");   // 가져온 데이터를 년도와 월별로 나누어 배열제 저장하기 위한 작업.

        for(let i = 0; i < organized.length - 1; i++)
        {
            organized[i] = organized[i].replace("\n", "\n\n");   // 첫번째 개행문자를 \n\n로 바꿔서 사용자가 입력한 달이 구분되어 화면에 출력되도록 함.
            organized[i] = organized[i].substring(0, organized[i].length - 2);
        }
        
        browser.close();
        connection.connect();
        
        connection.query(`DELETE FROM academic_calendar`, function(err, rows, fields){    // 서버에서 주기적으로 크롤링하기 위해 테이블의 내용을 삭제함.
            if(!err)
                console.log("DELETE SUCCESS!");
            else
                console.log(err);
        });

        for(let i = 0; i < organized.length; i++)
        {
            const year = Number(organized[i].substring(YEARSTART, YEAREND +1));
            const month = Number(organized[i].substring(MONTHSTART, MONTHEND + 1));
            
            connection.query(`INSERT INTO academic_calendar(YEAR, MONTH, CONTENT) VALUES (${year}, ${month}, "${organized[i]}")`, function(err, rows, fields){
                if(!err)
                    console.log("INSERT SUCCESS!");
                else
                    console.log("error : " + err);
            });
        }
    
        connection.end();
    })();
});

notice_crawling.js

const schedule = require("node-schedule");
let puppeteer = require("puppeteer");
let mysql = require("mysql");


let pageArr = ["https://grad.smu.ac.kr/grad/board/notice.do",
    "https://grad.smu.ac.kr/edu/community/notice.do",
    "https://grad.smu.ac.kr/mft/board/notice.do",
    "https://grad.smu.ac.kr/gsct/community/notice.do",
    "https://grad.smu.ac.kr/cart/board/notice.do"];

let tableNameArr = ["normal_notice",
    "education_notice",
    "business_notice",
    "cultural_notice",
    "arts_notice"];

function crawling(noticePage, tableName) // academic_calendar 테이블에서 start부터 end에 해당하는 달의 content들을 연결하여 반환한다. (sql문과 params에 따라 다르게 동작할 수 있다.)
{
    return new Promise(async function(resolve, reject){ // async, await을 사용하기 위해 프로미스를 반환한다.
        let connection = mysql.createConnection({       // mysql 연결.
            host : "13.125.114.52",
            user : "root",
            password : "!d8h6ukja123",
            port : 3306,
            database : "kakao"
        })

        let browser = await puppeteer.launch();
        let page =  await browser.newPage();

        await page.goto(noticePage);  // 공지사항 페이지로 이동
        await page.waitFor("[class = 'board-name-thumb board-wrap']");      // 해당 selector에 해당하는 element가 페이지에 나타날 떄까지 대기

        let content = await page.evaluate(() => // 이차월 배열로, content[i]는 각 공지사항을 구분하고, content[i][0]은 title, content[i][1]는 url, content[i][2]는 작성일을 저장함.
        {                                       // 크롤링할 정보를 가지는 태그들을 따로 select하고, dt 태그의 자식에 클래스가 c-board-list-new인 태그가 있는지 확인한 후 있다면
                                                // 그 dt태그의 a태그로부터 title과 url을, dt의 형제인 dd태그의 자식인 class가 'board-thumb-content-date']인 태그로부터 작성일을 크롤링한다.

            const selectDt = document.querySelectorAll("[class = 'board-name-thumb board-wrap'] dl dt");    // 새로운 공지만 보여주기 위해 select해서 dt 태그의 자식에 클래스가 c-board-list-new인 태그가 있는지 확인.
            const selectA = document.querySelectorAll("[class = 'board-name-thumb board-wrap'] dl dt a");   // [class = 'board-name-thumb board-wrap'] dl dt a에 해당하는 DOM 엘리먼트의 innerText(title)와 href 속성값(url)에 개행을 붙여 리턴.
            const selectDdate = document.querySelectorAll("[class = 'board-name-thumb board-wrap'] dl dd [class = 'board-thumb-content-date']");    // 공지사항의 작성일을 가져오기 위해 select

            let addContent = "";   // 각 태그의 크롤링 정보를 연결하여 리턴한다.
            let childArray;

            for(let i = 0; i < selectDt.length; i++)
            {
                childArray = selectDt[i].childNodes;    // dt의 자식태그들을 저장.

                for(let j = 0; j < childArray.length; j++)  // dt의 자식태그 중에 클래스가 c-board-list-new인 태그가 있는지 확인하기 위한 반복문
                {
                    if(childArray[j].className === "c-board-list-new")  // 자식태그 중에 클래스가 c-board-list-new인 태그가 있으면
                    {
                        addContent += selectA[i].innerText + "\n"+ selectA[i].href + "\n";  // addContent에 a태그의 innerText(공지사항의 title)와 url을 붙여줌.
                        addContent += selectDdate[i].innerText.replace(/\n/gi, "") + "\n\n";    // 작성일을 붙여줌
                        break;
                    }
                }
            }
         return addContent;
        });

        content = content.trim().split("\n\n");

        for(let i =0; i < content.length; i++)
            content[i] = content[i].trim().split("\n");
        browser.close();

        /* test
        connection.query("INSERT INTO notice(id, title, url, writeDate) values(?, 'test', 'test', 'test')",[Math.floor(Math.random() * (3100 - 3001)) + 3001]);
        */

        let deleteSql = "DELETE FROM " + tableName;
        let insertSql = "INSERT INTO " + tableName + "(id, title, url, writeDate) values(?, ?, ?, ?)"; // 공지사항 테이블 INSERT SQL문

        connection.query(deleteSql, function(err, rows, fields){    // 서버에서 주기적으로 크롤링하기 위해 테이블의 내용을 삭제함.
            if(!err)
                console.log("DELETE SUCCESS!");
            else
                console.log(err);
        });

        if(content != "")
        {
            for(let i = 0; i < content.length; i++) // 공지사항의 개수만큼 삽입
            {
                connection.query(insertSql, [i+1, ...content[i]], function(err, rows){  // id는 i + 1이고, title url date는 content 배열에 spread 연산자 사용해서 매개변수 전달.
                    if(!err)
                        console.log(insertSql + "SUCCESS!");
                    else
                        console.log("error : " + err);
                });

            }
        }

        connection.end();
        resolve(1);
    })
}

const scheduler = schedule.scheduleJob("0 33 9 * * *", function(){   // 11시 2시 17시에 크롤링.
    (async function noticeFunc(){
        for(let i = 0; i < pageArr.length; i++)
        {
            await crawling(pageArr[i], tableNameArr[i]);
        }
    })();
});
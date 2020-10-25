default_vaule.js

const defaultValues = {
    "searchFaultMessage" : `요청하신 정보를 찾을 수 없습니다 😭\n\n`+
                           `🚑 사용법을 보고싶다면 "도움말" 또는\n` +
                           `     "도와주세요!"를 입력해주세요!🚑`,

    "noStudentMessage" : `현재 소설창작학과와 글로벌콘텐츠학과는\n` +
                         `재학생이 없어 수업 정보가 없습니다 ㅠㅠ 😭`,

    "noNewNotice" : "❌ 새로운 공지사항이 없습니다!\n\n" +
                    "🔽 홈페이지에서 확인해주세요 😁!",

    "enrollSuccessMessage" : `🎓 대학원 : graduateSchool \n` +
                             `🎒 전공/학과 : major\n`+
                             `등록되었습니다.` ,

    "enrollFailureMessage" : `❌ graduateSchool에 \n` +
                             `      major가(이) 없습니다! \n` +
                             `      다시 확인해주세요!`,

    "notEnrolled" : `❌ 사용자 정보가 입력되지 않았습니다! \n` +
                    `       아래 "등록" 버튼을 눌러서 정보를\n` +
                    `       입력해주세요!😁`,

    "enrollQuickReqlies"  : [
        {
            "label" : "🏠 홈",
            "action" : "message",
            "messageText" : "홈",
        },
        {
            "label" : "🚨 도움말",
            "action" : "message",
            "messageText" : "도움말",
        },
        {
            "label" : "📝 학과 등록/수정",
            "action" : "message",
            "messageText" : "학과 등록/수정",
        },
    ],              

    "quickReplies" : [
        {
            "label" : "🏠 홈",
            "action" : "message",
            "messageText" : "홈",
        },
        {
            "label" : "🚨 도움말",
            "action" : "message",
            "messageText" : "도움말",
        },
        {
            "label" : "📆 학사 일정",
            "action" : "message",
            "messageText" : "학사 일정",
        },
        {
            "label" : "📚 수업 정보",
            "action" : "message",
            "messageText" : "수업 정보",
        },
        {
            "label" : "🏢 학과 사무실 정보",
            "action" : "message",
            "messageText" : "학과 사무실 정보",
        },
        {
            "label" : "📢 공지사항",
            "action" : "message",
            "messageText" : "공지사항",
        },
        ,
        {
            "label" : "👴 교수님 정보",
            "action" : "message",
            "messageText" : "교수님 정보",
        },
        {
            "label" : "☕ 주변 가게",
            "action" : "message",
            "messageText" : "주변 가게",
        }
    ]
}
const standard = 
{
    "notEnrolled" : defaultValues.notEnrolled,

    "NoNewNotice" : defaultValues.NoNewNotice,

    "NoStudentMessage" : defaultValues.noStudentMessage,

    "searchFaultMessage" : defaultValues.searchFaultMessage,

    "enrollSuccessMessage" : defaultValues.enrollSuccessMessage,

    "enrollFailureMessage" : defaultValues.enrollFailureMessage,

    "simpleBody" : {
        "version": "2.0",
        "template": {
            "outputs" : [
                {
                    "simpleText" : {
                        "text" : ""
                    }
                }
            ],
            "quickReplies" : defaultValues.quickReplies
        }
    },

    "phoneBody" : {
        "version": "2.0",
        "template": {
            "outputs" : [
                {
                    "basicCard" : {
                        "description" : "",
                        "buttons" :[
                            {
                                "label" : "📞 전화 걸기",
                                "action" : "phone",
                                "phoneNumber" : ""
                            }
                        ]
                    }
                }
            ],
            "quickReplies" : defaultValues.quickReplies
        }
    },

    "enrollBody" : {
        "version": "2.0",
        "template": {
            "outputs" : [
                {
                    "simpleText" : {
                        "text" : ""
                    }
                }
            ],
            "quickReplies" : defaultValues.enrollQuickReqlies
        }
    },

    "noNewNoticeBody" : {
        "version": "2.0",
        "template": {
            "outputs" : [
                {
                    "basicCard" : {
                        "title" : defaultValues.noNewNotice,
                        
                        "buttons" :[
                            {
                                "label" : "공지사항 홈페이지 이동",
                                "action" : "webLink",
                                "webLinkUrl" : ""
                            }
                        ]
                    } 
                }
            ],
            "quickReplies" : defaultValues.quickReplies
        }
    },

    "noticeBody" : {
        "version": "2.0",
        "template": {
            "outputs" : [
                {
                    "listCard" : {   // listCard의 응답 형식
                    "header" : {
                        "title" : "📢 공지사항 📢",
                        "imageUrl" : "http://blogfiles.naver.net/20130416_169/spriner_13660765805086SE0y_JPEG/130416_%BB%F3%B8%ED%B4%EB_%BB%E7%BD%BF%C4%B6%B8%AE_%C7%A5%C1%F62.jpg"
                    },

                    "items" : [],  
                    "buttons" :[
                        {
                            "label" : "공지사항 홈페이지 이동",
                            "action" : "webLink",
                            "webLinkUrl" : ""
                        }
                    ]
                }
            }],
            "quickReplies" : defaultValues.quickReplies
        }
    } ,

    "searchBody" : {
        "version": "2.0",
        "template": {
            "outputs" : [
                {
                    "simpleText" : {
                        "text" : defaultValues.searchFaultMessage
                    }
                }
            ],
            "quickReplies" : defaultValues.quickReplies
        }
    },

    "noticeTableName" : {
        "일반대학원" : "normal_notice",
        "경영대학원" : "business_notice",
        "문화기술대학원" : "cultural_notice",
        "교육대학원" : "education_notice",
        "예술디자인대학원" : "arts_notice"
    }
    ,
    "courseTableName" : {
        "일반대학원" : "normal_course",
        "경영대학원" : "business_course",
        "문화기술대학원" : "cultural_course",
        "교육대학원" : "education_notice",
        "예술디자인대학원" : "arts_course"
    }
    ,
    "page": {
        "일반대학원" : "https://www.smu.ac.kr/grad/board/notice.do",
        "경영대학원" : "https://www.smu.ac.kr/mft/board/notice.do",
        "문화기술대학원" : "https://www.smu.ac.kr/gsct/community/notice.do",
        "교육대학원" : "https://www.smu.ac.kr/edu/community/notice.do",
        "예술디자인대학원" : "https://www.smu.ac.kr/cart/board/notice.do"
    }

}

module.exports = standard;
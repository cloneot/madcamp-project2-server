# madcamp-project2-server


```
/server에서

npm update
npm install
npm start
```

- public: 정적 파일(이미지, CSS 파일, JavaScript 파일 등)을 저장하는 폴더입니다. 클라이언트 측에서 접근 가능한 파일들을 이곳에 배치합니다.
- views: Express 애플리케이션에서 사용되는 템플릿 파일(HTML, EJS, Pug 등)을 저장하는 폴더입니다. 클라이언트에게 보여질 컨텐츠를 동적으로 생성하기 위해 이 폴더에 템플릿 파일을 작성합니다.
- routes: 애플리케이션의 라우팅 로직을 처리하는 파일들을 저장하는 폴더입니다. 클라이언트의 요청에 따라 적절한 핸들러 함수로 라우팅하기 위한 라우팅 파일을 이곳에 작성합니다.
- app.js: Express 애플리케이션의 진입점 파일입니다. 서버의 설정, 미들웨어, 라우팅 등의 기본 구성을 이 파일에서 수행합니다.
- package.json: 프로젝트에 대한 메타 정보와 종속성 관리를 위한 파일입니다. 프로젝트 설정, 스크립트, 사용되는 패키지 등을 기술합니다.

- controllers: 애플리케이션의 비즈니스 로직을 처리하는 컨트롤러 파일들을 저장하는 폴더입니다. 라우팅 로직에서 요청을 처리하고 데이터베이스와 상호작용하여 필요한 작업을 수행하는 함수들을 작성합니다.
- models: 데이터베이스 모델과 관련된 파일들을 저장하는 폴더입니다. 데이터베이스 스키마, 쿼리 메서드 등을 작성하여 데이터를 조작하는 로직을 이곳에 작성합니다.

# About Project
Project Title: WORDART

Team Member: HYU 22 junseo Kim, KAIST 22 mingyu Kim

Detail: This app is chatting based game. English word you chat is translated to number. 

By adding all alpabets by A is 1, B is 2, ... , and Z is 26.

Ex) apple -> 1+16+16+12+5 = 50

If you start game server tell target number and your goal is to find English word whose translated number is as close as target number.

Score is abs(translated number - target numeber). Smaller score is good.

Game end when someone find matching word or timeover.

When timeover, user who has the smallest score win.

## 1. Установка express и typescript
### Done:
1. npm init
2. npm i --save-dev typescript, ts-node, @types/express
3. npm i express nodemon
4. tsc --init
5. tc config es5 -> es6
6. package.json add script nodemon src/App.ts
7. npm run dev
8. share project on github
9. gitignore add .idea
10. commit and push
### Testing:
open browser on localhost:3000


## 2. Подключаем MongoDB
### Done:
1. Создаём конфигурационный файл с глобальными переменными (src->config->default.ts). Клиент будет работать на 3000 порту, сервер на 5000.
2. Устанавливаем локально MongoDB https://www.mongodb.com/try/download/community (MongoDBCompass идёт в комплекте) (версия автора 5.0.3)
3. Открываем MongoDBCompass, выполняем connect localhost:27017
4. Создаём новую базу данных messenger-express, collection users
5. Добавляем адрес БД в конфигурационный файл
6. Устанавливаем mongoose (типы идут в комплекте, не нужно устанавливать @types/mongoose)
7. Пишем код подключения к БД, src->db->connect.ts
8. Подключаемся к БД, и в случае успеха запускаем сервер
9. commit and push
### Testing:
open browser on localhost:5000

## 3. Создаём маршруты входа и регистрации
1. Создаём схему user для MongoDB (src->models->userModel.ts)
2. Используя схему создаём объект модели mongoose
3. Дальше необходимо создтаь контроллер user, контроллер будет получать данные от пользователя (например логин и пароль), если данные верны (например логин должен быть не меньше 3 символов, логин должен существовать в бд и т.д.), сервер вернёт ему данные из бд, иначе сервер вернёт сообщение об ошибке
4. Также во время работы сервера могут произойти непредвиденные ошибки, чтобы отличить непредвиденные ошибки от ошибок валидации создадим класс ошибки
5. Класс ошибки ApiError содержит статический метод BedRequest, который возвращает объект класса ApiError (данный класс следует вызыввать при ошибки валидации) (src->exceptions->ApiError.ts)
6. Создадим middleware для перехвата всех ошибок (в том числе непредвиденных) (src->middlewares->errorMiddleware.ts)
7. Подключим middleware
8. Создадим DAO для user (он нужен чтобы отделить интерфейс вызова методов базы данных от вида базы данных, с помощью DAO можно поменять БД (например на PostgreSQL, но интерфейс методов останется тот же)) (src->dao->userDAO.ts)
9. Создадим service для user (сервис реализует бизнес-логику приложения) (src->service->userService.ts)
10. Создадим контроллер user (контроллер выполняет валидацию данных, запускает сервисы, возврашает ответ пользователю) (src->controllers->userController.ts)
11. Для хэширования пароля пользователя установим bcrypt (npm i bcrypt, npm i --save-dev @types/bcrypt)
12. Для первичной валидации отправляемых пользователем данных установим express-validation (npm i express-validator); валидация происходит в middleware, но сообщение об ошибке возвращается пользователю в контролере
13. Чтобы получать данные от пользователя также подключим middleware express.json (этот плагин позволяет прочитать переданные пользователем поля из объекта req.body, без данного middleware у req не будет объекта body)
14. commit and push
### Testing:
1. Postman /auth/login (raw->json)
   Получаем сообщение с ошибкой валмдации, так-как пользователя с таким email нет в базе данных
2. Browser fetch auth/login (CORS error). Открываем консоль браузера со страницы learn.javascript.ru. Можно и сдругой, но необходимо проверить позволяет ли сайт выполнять запросы к другим источникам. (https://stackoverflow.com/a/53690821) Например yandex.ru не позволяет.
   Код запроса:
```javascript
fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({email: "mail@mail.ru", password: '12345'})
}).then(res => res.json())
  .then(res => console.log(res)).catch(err=>console.log(err));
```
Получаем TypeError: Failed to fetch
at <anonymous>:1:1 (из-за CORS)
3. Postman auth/registration
4. Browser auth/registration (CORS error)

## 4. router, CORS
1. Установим CORS и подключим его (npm i cors; npm i @types/cors --save-dev)
2. В свойство origin запишем: '*' (любые адреса) и выполним предыдущий fetch-запрос. Получим: {message: 'Ошибка при валидации', errors: Array(1)}
3. Изменим свойство origin на: 'https://learn.javascript.ru' (без / в конце) и выполним предыдущий fetch-запрос. Получим: {message: 'Ошибка при валидации', errors: Array(1)}
4. Подробнее про CORS можно прочитать в файле CORS.md
5. Выполним декомпозицию кода перенесём маршруты в отдельный файл, создадим router.
6. Добавим префикс для всех маршрутов: "api"
7. Изменим url на http://localhost:5000/api/auth/login и выполним предыдущий fetch-запрос. Получим: {message: 'Ошибка при валидации', errors: Array(1)}
8. Изменим свойство origin на: config.app.client_url
9. commit and push



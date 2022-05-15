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

## 5. Тестируем маршруты с помощью Jest
1. Установим Jest (npm install --save-dev jest)
2. Так как проект использует TS утснаовим модули @types/jest и ts-jest
3. Создадим конфигурационный файл для jest (jest.config.js)
4. Для тестирования MongoDB нам понадобиться пакет (mongodb-memory-server) установим его как dev зависимость. Данный пакет, каждый раз при запуске тестирования, создаёт виртуальную базу данных, которая никак не связана с нашей основной БД.
5. Для того чтобы выполнять запросы к нашему приложению, также нужно установим пакет supertest (dev) и типы к нему.
6. Добавим функцию disconnect для базы данных MongoDB (db->connect.ts). Это позволит каждому тестовому файлу, работать в пустой БД. Если в первым файле мы добавляем данные в БД, то во втором файле БД всё-равно будет пустой.
7. Изменим файл App.ts теперь метод listen не должен вызываться при тестировании. Это важно так как если у вас несколько файлов для тестирования, вы будете получать ошибку, что порт уже занят. (https://github.com/visionmedia/supertest/issues/568#issuecomment-575994602)
8. Запишем скрипт test в package.json. Чтобы определить в каком режиме запускается приложение (обычном или тестирования) мы устанавливаем переменную среды (NODE_ENV=test jest). Если при запуске етсирования (npm run test) вы получаете ошибку: "NODE_ENV" не является внутренней или внешней командой, исполняемой программой или пакетным файлом., установите пакет (npm install -g win-node-env) для поддержки переменных окружения.  
9. Все тесты приложения будут расположены в папке __test__
10. В файле jest.setup.ts находятся глобальные настройки тестирования. Они применяются не единыжды,а для КАЖДОГО файла тестирования (В нашем случае мы подключаем и отключаем БД).
11. commit and push
### Testing
1. npm run dev (проверим что приложение попрежнему работает)
2. Напишем первый файл для тестирования (api__auth__routes.test.ts)
3. Запустим тестирование (npm run test). Все тесты должны брыть пройдены
4. Копируем файл api__auth__routes.test.ts (изменим имя копии на api__auth__routes2.test.ts)
5. Запустим тестирование с двумя файлами (npm run test). Все тесты должны брыть пройдены. Это показывает что каждый тестовый файл независим, иначе произошла бы ошибки при повторной регистрации пользователя.
6. Можно открыть MongoDBCompass, и увидеть что наша БД осталась без изменений. При тестировании используется другая БД.
7. Удалим копию исходного файла

## 6. Аутентификация на основе сессий и cookie
1. Схему работы сессий и куки можно посмотреть здесь: https://www.youtube.com/watch?v=bvQah0k5-eA&list=PL1Nml43UBm6fPP7cW9pAFTdZ_9QX2mBn2
2. Для быстрого доступа к сессии пользователя, будем использовать redis. По-сути redis это кэш. (npm i redis, типы идут в комплекте). Также не забываем установить redis на компьютер. Для windows нет оффициального дистрибутива (у автора redis 3.2.100 скачанный отсюда: https://github.com/microsoftarchive/redis/releases).
3. Подключаемся к redis через его client (db->redis.ts). По-умолчанию используется localhost:6379.
4. Создадим session-middleware (middleware->sessionMiddleware.ts). Данное middleware, связывает cookie предоставленное пользователем c БД redis. В куки хранится только идентификатор сессии, redis использует этот id как ключ БД, и возвращает аднные пользователя если они есть. Установим пакет session-express и типы к нему (типы dev). Установим пакет connect-redis и типы к нему (типы dev). connect-redis реализует механизм хранения и обновления сессий на клиенте redis.
5. Изменим файл App.ts. Подключим session-middleware. Добавим в CORS credentials: true, чтобы браузер передавал нам cookie, с запросом от origin.
6. Теперь чтобы проверить аутентифицирован ли пользователь, нужно получить его сессию. Если сессия существует в БД redis и в сессии записаны данные пользователя, значит пользователь аутентифицирован.
7. Реализуем middleware, проверяющие аутентифицированн ли пользователь. (middleware->authMiddleware.ts). Добавим соотвествующую ошибку в ApiError. Данное middleware мы будем подключать не глобально (в App.ts), а для конкретных маршрутов (protected routes). В App.ts объявим тип данных пользователя, хранящихся в сессии (UserDto).
8. Реализуем два защищённых маршрута logout, user-data. 
9. Изменим методы userController. При регистрации и входе, сессия будет записываться, при выходе уничтожаться.
10. commit and push
### Testing
1. npm run dev
2. Открываем redis-cli
3. Выполняем команду ping, получаем ответ PONG.
4. Выполняем команду keys *, получаем: (empty list or set), БД пустая (по-умолчанию redis может содержать только 1 БД). Если БД не пустая, выполним команду flushall (удаление всех данных из БД).
5. Теперь БД redis пустая. 
6. Postman POST /api/auth/user-data, получаем ошибку: Пользователь не авторизован. Под кнопкой send нажимаем cookies. Cookie c нашим именем: sessionId__MD_Express, нет в списке.
7. Postman POST /api/auth/registration, выполняем регистрацию нового пользователя. `{
   "login":"first__user",
   "email":"first__user__mail@mail.ru",
   "password":"12345",
   "confirmPassword":"12345"
   }`
8. Нажимаем кнопку cookies в Postman. Видим cookie с нашим именем. Cookie содержит id сессии (зашифрован) и дату окончания действия сессии. `sessionId__Mongo__Express=s%3AgVO5EdHjpXsqAwtRd6rVP6aHd_RH8onO.5aeij2QYjknObGVNmgAAewdxZG4C5Jw%2FrwNGUqWyocY; Path=/; HttpOnly; Expires=Fri, 10 Jun 2022 17:55:25 GMT;`
9. Открываем командную строку redis. Выполняем команду keys *. Получаем: `1) "sess:gVO5EdHjpXsqAwtRd6rVP6aHd_RH8onO"` Это реальные, незашифрованные session id.
10. Выполним команду get sess:gVO5EdHjpXsqAwtRd6rVP6aHd_RH8onO. Получаем id пользователя, его login и email.
11. Postman POST /api/auth/user-data. Получаем данные пользователя.
12. Postman POST /api/auth/logout. В redis опять нет ключей. В postman cookie остался (так как оно (печенье) хранится на клиенте, а не на сервере)
13. Postman POST /api/auth/user-data, получаем ошибку: Пользователь не авторизован.
14. Postman POST /api/auth/login. Получаем данные пользователя. Видим что данные cookie обновились (мы получи новую печеньку, взамен старой)
15. Postman POST /api/auth/user-data. Получаем данные пользователя.
### Testing CORS
1. Изменяем origin в cors middleware на: https://learn.javascript.ru
2. В Chrome открываем консоль браузера со страницы learn.javascript.ru. 
   Код запроса:
```javascript
fetch('http://localhost:5000/api/auth/user-data', {
  method: 'POST',  
   credentials: 'include',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({email: "first__user__mail@mail.ru", password: '12345'})
}).then(res => res.json())
  .then(res => console.log(res)).catch(err=>console.log(err));
```
Получаем: Пользователь не авторизован. В Chrome открываем http://localhost:5000/ на вкладке Application->Storage->Cookies нажимаем на url нашего сайта. Ничего не отображается, значит cookie не найден. 
3. Меняем url на login. Выполняем запрос. Видим данные пользователя. В Chrome открываем http://localhost:5000/ на вкладке Application->Storage->Cookies нажимаем на url нашего сайта. Хотя открыв вкладку networks на сайте learn.js.ru, видим что куки пришли от сервера, но браузер их не сохранил.
4. Повторно выполняем запрос user-data. И снова получаем: пользователь не авторизован.
5. Создадим get маршрут /api. Откроем его в браузере. Заменим origin на config.app.api_url. и выполним предыдущие три запроса.
   1. /user-data -> Пользователь не авторизован
   2. /login -> Видим данные пользователя.
   3. /user-data -> Видим данные пользователя.
   4. Проверяем cookie, они установлены
6. Почему в первый раз cookie не были сохранены браузером, а втором слуае были?
7. Всё дело в атрибуте SameSite (https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite). Последние версии браузеров усилили защиту от CSRF атак, и теперь запросы с разных сайтов не сохраняют куки (с learn.js.ru на localhost). При запросе с одного и того же сайта куки сохраняются (с localhost на localhost). Подробнее: https://stackoverflow.com/a/61787597/10000274
### Testing Jest
1. Создадим файл __test__/api__auth__session.test.ts и в нём проведём тестирование механизма сессий.
2. Так как мы не используем memory-server для redis (не нашёл популярной реализации). То стоит очищать redis (flushall) после тестирования.

## 7. Переполнение Redis
While(True){  
a. Выполняем login в Chrome. Получаем session в redis.  
b. Удаляем файл cookie из Chrome.  
c. Выполняем login в Chrome (для того же пользователя). Получаем 2 session в redis для 1 одного пользователя.     
}  
Итого у нас 100500 сессий для одного пользователя.

Чтобы устраинить эту уязвимость напишем sessionService.
В config укажем максимальное количество сессий для одного пользователя, дальше будет перезапись предыдущих.
Теперь в redis у нас будут две структуры данных:
1. ключ: "sess:sessionId" значение: "userID" (запись для одной сессий, их может быть ограниченной количество для каждого пользователя (лимит задаётся в config, у нас 2 сессии на одного пользователя))
2. ключ: "userID" значение: {user: userDto, sessions: ["sess:sessionId"]} (данные пользователя, и список его сессий)
3. В sessionService 3 метода (добавить сессию для пользователя, удалить текущую сессию (logout), и clear (выйти со всех устройств, удалить се сессии пользователя))
4. Будем вызывать sessionService в userController
5. commit and push
## Testing
1. Протестируем приложение с помощью Postman и redis-cli.
2. Создадим файл __test__/api__auth__session__overflow.test.ts и в нём проведём тестирование переполнения redis одним пользователем.
3. Если запускать этот файл отдельно, то все тесты будут пройдены. Однако если выполнить команду npm run test, результаты могут отличаться: могут быть не пройдены 2 теста, 4, или пройдены все. Это связано с тем что тесты (it, test) в блоках describe выполняются последовательно, однако саи тестовые файлы выполняются паралельно и возникает гонка в БД redis. 
4. Чтобы это исправить, пропишем в конфигурации jest, свойство: maxWorkers: 1. Оно означает сколько паралельных потоков будет запускаться. Файлы будут выполняться последовательно, но порядок их выполнения может быть различным.
5. Также добавим опцию --forceExit в package.json. Чтобы сервер express (зарущенный supertest) закрывался, после прохождения всех тестов. 
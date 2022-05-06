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
2. Устанавливаем локально MongoDB и MongoDBCompass
3. Открываем MongoDBCompass, выполняем connect localhost:27017
4. Создаём новую базу данных messenger-express, collection users
5. Добавляем адрес БД в конфигурационный файл
6. Устанавливаем mongoose (типы идут в комплекте, не нужно устанавливать @types/mongoose)
7. Пишем код подключения к БД, src->db->connect.ts
8. Подключаемся к БД, и в случае успеха запускаем сервер
9. commit and push
### Testing:
open browser on localhost:5000
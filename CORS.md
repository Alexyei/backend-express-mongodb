## без CORS
1. Вы авторизуетесь на сайте my.gmail.com, получаете cookie (чтобы быстро повторно войти, без необходимости заново вводить логин и пароль)
2. Вы заходите на сайт www.evil.com
3. Сайт www.evil.com делает запрос на my.gmail.com
4. Браузер видит, что у вас есть cookie для my.gmail.com и прикрепляет его к запросу
5. Сайт www.evil.com получает доступ к вашей личной почте
## с CORS
1. Вы авторизуетесь на сайте my.gmail.com, получаете cookie (чтобы быстро повторно войти, без необходимости заново вводить логин и пароль)
2. Вы заходите на сайт www.evil.com
3. Сайт www.evil.com делает запрос на my.gmail.com
4. Браузер сначала выполняет запрос-проверку OPTIONS (в реальности немоного сложнее, см. полезные ссылки),  и получает от сайта my.gmail.com заголовок Access-Control-Allow-Origin
5. Если сайт www.evil.com есть в заголовоке Access-Control-Allow-Origin, изначальный запрос выполняется, но куки прикрепляются только в том случае если на сайте my.gmail.com также указан заголовк credential: true
6. Так как сайта www.evil.com нет в заголовоке Access-Control-Allow-Origin, изначальный запрос отклоняется, в консоле на сайте www.evil.com выводится соотвествующая ошибка
## postman и CORS
CORS рабоатет только в браузерах.
postman (и другие аналогичные программы) не отправляет запрос-проверку OPTIONS.
в postman нет сторонних скриптов которые могут отправить запрос вместо нас, мы сами указываем url и сакми выбираем когда прикреплять cookie а когда нет.
## Полезные ссылки:
https://stackoverflow.com/a/27365516/10000274
https://stackoverflow.com/a/58760390/10000274
https://stackoverflow.com/a/10636765/10000274
https://stackoverflow.com/a/40396102/10000274

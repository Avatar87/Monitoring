# Monitoring
------------

Инструкция по развертыванию приложения:

start.cmd - запуск приложения, получение списка групп из файла groups.json. массив групп выглядит так:
[ {"title": <string>"Название", "monitorings": <string>["id мониторинга", ...]} ]

deploy.cmd - создание базы данных MongoDB и запись данных по событиям и лицам за месяц

cron.cmd - нужно поставить на ежедневное выполнение в планировщик или crontab для обновления данных за предыдущий день

файл config.js:
dbUrl - урл для подключения к базе данных MongoDB;
apiUrl - урл для получения данных из Облика;
configStartDate - пока нигде не используется. можно настроить для получения данных с какой-то определенной даты в конфиге

------------
Monitoring Node.js app to visualize data from MongoDB

run start.cmd to start the app, then
run deploy.cmd to start the database

You will have to install node.js and mongodb server

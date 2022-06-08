export default {
    app: {
        port: 5000,
        host: "localhost",
        api_url: 'http://localhost:5000',
        client_url: 'http://localhost:3000'
    },
    db: {
        dbUri: "mongodb://localhost:27017/messenger-express",
    },
    session: {
        // количество сессий доступных одному пользователю, при превышении перезапись старых
        limitPerUser: 2
    },
    userLimits:{
        //небудем вводить абсолютные лимиты, ограничемся дневными
        // publicRoomsMaxCount: 10000,
        // Не будем ограничивать количество приватных комнат, та как это потребует реализыации дополнительной функциональности
        // Например у пользователя 10000 закрытых приватных комнат, нужно предложить ему удалить часть из них, перед добавлением
        // privateRoomsMaxCount: 10000
        messages:{
            //максимальная длина сообщений
            maxLength: 2000,
            publicMessagesInDay: 500,
            privateMessagesInDay: 500
        },
        publicRoom:{
            //максимальное количество пользователей в комнате
            maxUsersCount: 500,
            publicRoomCreateInDay: 5,
            publicRoomJoinInDay: 50
        },
        privateRoom:{
            privateRoomCreateInDay: 50
        }

    }
}
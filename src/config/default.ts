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
    }
}
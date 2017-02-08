var environnement_server = {
	db : process.env.MONGO_URL,
	socket : "https://lnchat.scalingo.io/socket.io/socket.io.js",
	localhost : "https://lnchat.scalingo.io",
	port: process.env.PORT
}

module.exports = environnement_server;
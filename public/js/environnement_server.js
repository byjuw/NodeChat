var environnement = {
	db : process.env.MONGO_URL,
	socket : "http://lnchat.scalingo.io/socket.io/socket.io.js",
	localhost : "http://lnchat.scalingo.io",
	port: process.env.PORT
}

module.exports = environnement;
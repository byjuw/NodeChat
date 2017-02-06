var app = require('express')()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)
var ent = require('ent')

var MongoClient = require('mongodb').MongoClient;

app.get('/', function(request, response){
	response.sendFile(__dirname + '/index.html')
})

var users = []
var messages_collection = null
var database = null

MongoClient.connect("mongodb://lnchat-4700:Le-b00F6ALEKaiRLRXdS@lnchat-4700.mongo.dbs.appsdeck.eu:31135/lnchat-4700", function(err, db) {

	if(err) {
		console.log(err)
		return
	}

	messages_collection = db.collection('Messages')

	io.sockets.on('connection', function(socket) {

		socket.on('nouveau_client', function(data){

			for(id in users){
				if(data == users[id].pseudo){
					socket.emit('not_OK_user', {})
					return
				}
			}
			socket.emit('OK_user', {})
			
			messages_collection.find().sort({time:-1}).limit(20).toArray(function(err, item){

				if(err){
					console.log(err)
					return
				}

				socket.emit('old_messages', item)
			})

			socket.pseudo = ent.encode(data)
			users.push({pseudo:socket.pseudo, userid:socket.id})

			socket.emit('utilisateurs', users)

			socket.broadcast.emit('nouveau_client', {pseudo:socket.pseudo, userid:socket.id})

		})

		socket.on('envoi_message', function(data){
			var eMessage = ent.encode(data)

			messages_collection.insert({
				message:eMessage,
				user:socket.pseudo,
				time: new Date()
			}, function(err, result){
				if(err){
					console.log(err)
					return
				}
				console.log(result)
			})

			socket.broadcast.emit('reception_message', {message:eMessage, pseudo:socket.pseudo, time:new Date()})
		})

		socket.on('disconnect', function(){
			for(id in users){
				if(users[id].pseudo == socket.pseudo){
					users.splice(id, 1)
				}
			}
			socket.broadcast.emit('disconnected', {pseudo:socket.pseudo})
			socket.broadcast.emit('utilisateurs', users)

		})

		socket.on('message_prive', function(data){
			socket.broadcast.to(data.receiver).emit('new_mp', data);
		})
	})
})

server.listen(process.env.PORT)
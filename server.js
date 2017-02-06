var app = require('express')()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)
var ent = require('ent')

var MongoClient = require('mongodb').MongoClient;

app.get('/', function(request, response){
	response.sendFile(__dirname+'/index.html')
})

var users = []
var messages_collection = null

MongoClient.connect('mongodb://localhost:27017/Chat', function(err, db){
	if(!err){
		console.log("Connecté à la DB")
		messages_collection = db.collection('Messages')
	}
})

io.sockets.on('connection', function(socket){

	socket.on('nouveau_client', function(data){

		messages_collection.find().sort({time:-1}).limit(20).toArray(function(err, item){
			if(err){
				console.log(err)
				return
			}
			socket.emit('old_message', item)
		})

		console.log(data + ' vient de rejoindre le chat')
		socket.pseudo = ent.encode(data)
		users.push({pseudo:socket.pseudo})
		socket.emit('users', users)
		socket.broadcast.emit('nouveau_client', {pseudo:data})
	})

	socket.on('envoi_message', function(data){
		var message = ent.encode(data)
		messages_collection.insert({message:message, user:socket.pseudo, time: new Date()}, function(err, result){
			if(err){
				console.log(err)
				return
			}
			console.log(result)
		})

		socket.broadcast.emit('reception_message', {message:message, pseudo:socket.pseudo})
	})

	socket.on('disconnect', function(){
		for(id in users){
			if(users[id].pseudo == socket.pseudo){
				users.splice(id, 1)
			}
		}
		socket.broadcast.emit('users', users)
		socket.broadcast.emit('disconnected', {pseudo:socket.pseudo})
	})
})

server.listen(1337)
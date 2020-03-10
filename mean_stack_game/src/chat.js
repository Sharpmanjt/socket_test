$(function() {
    var socket = io.connect('http://localhost:3000')

    var message = $("#message")
    var username = $("#username")
    var send_message = $("#send_message")
    var send_username = $("send_username")
    var room = $("#room")
    var user = ''

    send_message.click(function(){
        socket.emit('new_message', { message: message.val() });
    })

    socket.on("new_message", (data) => {
        console.log(data);
        room.append("<p class='message'><i>" + user + "</i>: " + data.message + "</p>");
        message.val("");
    })

    socket.on('set_user', (username)=>{
        console.log("set_user in chat.js: "+username);
        user = username;
    })
    send_username.click(function(){
        console.log(username.val())
        socket.emit('change_username', { username: username.val() })
    })    
});
const socket = io();

const welcome = document.getElementById("welcome");
const nickForm = welcome.querySelector("#nickForm");
const enterForm = welcome.querySelector("#enterForm");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.prepend(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = '';
}

function handleNameSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    const value = input.value;
    socket.emit("nickname", input.value);
};
nickForm.addEventListener("submit",handleNameSubmit);

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = enterForm.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}
enterForm.addEventListener("submit",handleRoomSubmit);

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ［${roomName}］`;
    const msgForm = room.querySelector("form");
    msgForm.addEventListener("submit",handleMessageSubmit);
}  

socket.on("welcome", (user) => {
    addMessage(`${user } arrived!😀`);
});

socket.on("bye", (left) => {
    addMessage(`${left} left ㅠㅠ😂`);
});

socket.on("new_message", (msg) => {addMessage(msg)});

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0) {
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});
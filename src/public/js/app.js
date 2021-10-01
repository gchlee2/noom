const socket = io();

const welcome = document.getElementById("welcome");
const nickForm = welcome.querySelector("#nickForm");
const enterForm = welcome.querySelector("#enterForm");
const room = document.getElementById("room");
const btnLeaveRoom = document.getElementById("btnLeaveRoom");

room.hidden = true;

let roomName;

window.onload = function () {
    const input = nickForm.querySelector("input");
    let value = prompt("NickName을 설정해 주세요!\n 미입력시 익명으로 표시됩니다.");
    value = value === null ? '익명' : (value.trim() === '' ? '익명' : value);
    input.value = value;
    socket.emit("nickname", value , () => {
        alert(`NickName이 ${value}로 설정 되었습니다!🙂`);
    });
}

function addMessage(){
    const msType = arguments[1]; 
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    if(msType === 'myChat'){
        li.classList.add("myChat");
    } else if(msType === 'other'){
        li.classList.add("otherChat");
    } else if(msType === 'notice'){
        li.classList.add("notice");
        li.classList.add(arguments[2]);
    }
    const chatDiv = document.createElement("div");

    if(msType === 'other'){
        const nameSpan = document.createElement("span");
        nameSpan.classList.add("name");
        nameSpan.innerText = arguments[2];
        chatDiv.append(nameSpan);
    }

    const textSpan = document.createElement("span");
    textSpan.classList.add("txt");
    textSpan.innerText = arguments[0];
    chatDiv.append(textSpan);

    li.append(chatDiv);
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`${value}`,'myChat','You');
    });
    input.value = '';
}

function handleNameSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    const value = input.value;
    socket.emit("nickname", input.value , () => {
        alert(`NickName이 ${value}로 설정 되었습니다!🙂`);
    });
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

function showRoom(roomCount) {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ［${roomName}］(${roomCount})`;
    const msgForm = room.querySelector("form");
    msgForm.addEventListener("submit",handleMessageSubmit);
}  

function hideRoom(){
    welcome.hidden = false;
    room.hidden = true;
    roomName = "";
}

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ［${roomName}］ (${newCount})`;
    addMessage(`${user } arrived!😀`,'notice','in');
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ［${roomName}］ (${newCount})`;
    addMessage(`${left} left ㅠㅠ😂`,'notice','out');
});

socket.on("new_message", (name,msg) => {addMessage(msg,'other',name)});

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0) {
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `javascript:enterRoom('${room}');`;
        a.innerText = room;
        li.append(a);
        roomList.append(li);
    });
});

function handleLeaveRoomSubmit(){
    socket.emit("leave_room",roomName,() => {
        hideRoom();
    })
}

btnLeaveRoom.addEventListener("click", handleLeaveRoomSubmit);

function enterRoom(room){
    const input = enterForm.querySelector("input");
    input.value = room;
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}
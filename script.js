const socket = io();

const usernameInput = document.getElementById('username');
const joinButton = document.getElementById('joinButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessageButton');
const userListDiv = document.getElementById('userList');
const messageContainer = document.getElementById('messageContainer');

let username = '';

joinButton.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username !== '') {
        socket.emit('join', username);
        joinButton.disabled = true;
        callButton.disabled = false;
        sendMessageButton.disabled = false;
        usernameInput.disabled = true;
    }
});

callButton.addEventListener('click', () => {
    const targetId = prompt('Enter the ID of the user you want to call:');
    if (targetId) {
        socket.emit('call', { targetId });
    }
});

sendMessageButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message !== '') {
        socket.emit('message', { message, sender: username });
        messageInput.value = '';
    }
});

hangupButton.addEventListener('click', () => {
    // Add hangup functionality here
});

socket.on('updateUserList', (userList) => {
    userListDiv.innerHTML = '';
    userList.forEach(user => {
        const listItem = document.createElement('div');
        listItem.textContent = user;
        userListDiv.appendChild(listItem);
    });
});

socket.on('incomingCall', (data) => {
    const confirmCall = confirm(`${data.caller} is calling you. Do you want to answer?`);
    if (confirmCall) {
        // Add answer call functionality here
    }
});

socket.on('newMessage', (data) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.sender}: ${data.message}`;
    messageContainer.appendChild(messageElement);
});

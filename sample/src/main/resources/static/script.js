var username=null
var stompClient =null
function connect(){
        let socket = new SockJS("/server1")
        stompClient = Stomp.over(socket)
        stompClient.connect({},function(frame){
        console.log("connected ...: "+frame)
        $("#login-container").css("display", "none");
        $("#chat-page-setup").css("display", "flex");
         $("#login-user-container").css("display", "block");

        LoginToServer(username)

         //subscribe login user group
        stompClient.subscribe("/topic/currently-loginUsers", function(response){
            console.log("message recived :"+ response.body)
            updateLoginUserList(JSON.parse(response.body))
        })

        //subscribe public group
        stompClient.subscribe("/topic/sharing-katta", function(response){
            console.log("message recived :"+ JSON.parse(response.body))
            showMessage(JSON.parse(response.body))
        })

         //subscribe private chat
        stompClient.subscribe(`/user/${username}/private`, function(response){
            showMessage(JSON.parse(response.body))
        })

        //subscribe logout user group
       stompClient.subscribe("/topic/currently-logoutUser", function(response){
           console.log("message recived :"+ response.body)
           updateLoginUserList(JSON.parse(response.body))
       })

    })
}

function  LoginToServer(username){
  stompClient.send("/chatapp/login",{}, JSON.stringify({user:username}))
}
function updateLoginUserList(userData){
       const itemList = document.getElementById("itemList");
       itemList.innerHTML = ''; // Clear the list before adding new items

       for (const user of userData) {
           const listItem = document.createElement("li");
           listItem.textContent = user.user;
            listItem.addEventListener("click", function() {
                $("#reciver-name").val(user.user);
                $("#send-msg").val("");
                $("#reciver-name").css("display", "block");
            });
           itemList.appendChild(listItem);
       }

}

function showMessage(message){
   const table = document.getElementById("chat-message");
//if(message.reciver == "sharing-katta"  || message.reciver == username || message.sender == username ){
       const row = document.createElement("tr");
       const cell = document.createElement("td");

       if(message.sender == localStorage.getItem("username")){
         cell.innerHTML = `<b> You:</b><br>${message.content}`;
          cell.className = "right";
       }
       else{
         cell.innerHTML = `<b>${message.sender}:</b><br>${message.content}`;
          cell.className = "left";
       }
       row.appendChild(cell);
       table.appendChild(row);
  //  }
   // Scroll to the bottom of the table container
      const tableContainer = document.getElementById("table-container");
      tableContainer.scrollTop = tableContainer.scrollHeight;
}


$(document).ready(function() {
  $("#chat-page-setup").css("display", "none");
    $("#login").click(function() {
        username = $("#username").val()
        localStorage.setItem("username" ,username)
        connect()
    });


 $("#public-send").click(function() {
      $("#reciver-name").val("sharing-katta");
      $("#reciver-name").css("display", "none");

 });

 $("#private-send").click(function() {
       $("#reciver-name").val();
       $("#send-msg").val("");
       $("#reciver-name").css("display", "block");
  });

     $("#send-msg").click(function() {
          let message = $("#message").val()
          let reciver = $("#reciver-name").val();
          sendMessage(message,reciver)

     });

      $("#logout").click(function() {
         alert("logout")
         stompClient.send("/chatapp/logout",{}, JSON.stringify({user:localStorage.getItem("username")}))
          $("#login-container").css("display", "flex");
          $("#chat-page-setup").css("display", "none");
      });
});

function sendMessage(message,reciver){
    let JsonObject ={
      sender:localStorage.getItem("username"),
      reciver:reciver,
      content:message
    }
    if(reciver == "sharing-katta"){
       stompClient.send("/chatapp/send",{}, JSON.stringify(JsonObject))  //send on public grp
    }
    else{
        stompClient.send("/chatapp/send-private",{}, JSON.stringify(JsonObject)) //send on private-grp
        showMessage(JsonObject)
    }

}

package com.example.sample.controller

import com.example.sample.DTO.loginuserDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/chatapp")

class Controller {

    @Autowired
    private val simpMessagingTemplate: SimpMessagingTemplate? = null
    var currentlyLoginUsers :MutableSet<loginuserDto> = mutableSetOf()

    @MessageMapping("/login")
    @SendTo("/topic/currently-loginUsers")
    fun loginUser(@RequestBody message : loginuserDto):MutableSet<loginuserDto>{
        println("new login user  : $message")
        currentlyLoginUsers.add(message)
        return currentlyLoginUsers;
    }

    @MessageMapping("/send")
    @SendTo("/topic/sharing-katta")
    fun getMessage(@RequestBody message : ChatMessage):ChatMessage{
        println("public message  : $message")
        return message;
    }

    @MessageMapping("/send-private")
    fun privateMessages(@RequestBody message: ChatMessage):ChatMessage{
        println("private message  : $message")
        simpMessagingTemplate?.convertAndSendToUser(message.reciver ,"private",message )//user/reciver_name/private
      return message
    }

    @MessageMapping("/logout")
    @SendTo("/topic/currently-logoutUser")
    fun logoutUser(@RequestBody message : loginuserDto):MutableSet<loginuserDto>{
        println("recently logout user  : $message")
        currentlyLoginUsers.remove(message)
        return currentlyLoginUsers;
    }
}
import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router'
import { allUsersRoute, host } from '../utils/APIRoutes'
import Contacts from '../components/Contacts'
import Welcome from '../components/Welcome'
import ChatContainer from '../components/ChatContainer'
import { io } from 'socket.io-client'
import SideDrawer from '../components/miscellaneous/SideDrawer'
import { FormControl } from '@chakra-ui/react'
import { ChatState } from '../Context/ChatProvider'
import GroupChatModal from '../components/miscellaneous/GroupChatModal'
import ChatLoading from '../components/ChatLoading'

function Chat() {
  const socket = useRef(null)
  const navigate = useNavigate()
  const { currentUser, setCurrentUser, selectedChat, setSelectedChat } =
    ChatState()
  const [isLoaded, setIsLoaded] = useState(false)
  const [fetchAgain, setFetchAgain] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)

  useEffect(() => {
    async function userCheck() {
      if (!localStorage.getItem('chat-app-user')) {
        navigate('/login')
      } else {
        setCurrentUser(await JSON.parse(localStorage.getItem('chat-app-user')))
        setIsLoaded(true)
      }
    }
    userCheck()
  }, [])

  useEffect(() => {
    if (currentUser) {
      if (socket.current == null) {
        socket.current = io(host)
      }
      const { current: socketRef } = socket
      try {
        socketRef.open()
        socketRef.emit('setup', currentUser)
      } catch (e) {
        console.log('setup error: ' + e)
      }
    }
  }, [currentUser])

  useEffect(() => {
    async function imageCheck() {
      if (!JSON.parse(localStorage.getItem('chat-app-user')).isAvatarImageSet) {
        navigate('/setavatar')
      }
    }
    imageCheck()
  }, [currentUser])

  const handleChatChange = (chat) => {
    setSelectedChat(chat)
  }

  return (
    <>
      <Container>
        {isLoaded && (
          <FormControl display='flex' justifyContent='center'>
            <SideDrawer />
            <GroupChatModal>
              <button className='create-group'>New Group Chat</button>
            </GroupChatModal>
          </FormControl>
        )}
        <div className='container'>
          {isLoaded ? (
            <Contacts fetchAgain={fetchAgain} changeChat={handleChatChange} />
          ) : (
            <ChatLoading />
          )}
          {isLoaded && selectedChat === undefined ? (
            <Welcome currentUser={currentUser} />
          ) : (
            <ChatContainer
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
              socket={socket}
            />
          )}
        </div>
      </Container>
    </>
  )
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
  .create-group {
    background-color: #997af0;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    &:hover {
      background-color: #4e0eff;
    }
  }
`

export default Chat

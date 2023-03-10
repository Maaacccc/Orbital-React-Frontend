import { Button } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { Input } from '@chakra-ui/input'
import { Box, Text } from '@chakra-ui/layout'
import styled from 'styled-components'
import { Menu, MenuButton, Tooltip, MenuList, MenuItem } from '@chakra-ui/react'
import { BellIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import axios from 'axios'
import { useToast } from '@chakra-ui/toast'
import { Spinner } from '@chakra-ui/spinner'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/modal'
import { ChatState } from '../../Context/ChatProvider'
import ChatLoading from '../ChatLoading'
import UserListItem from '../UserAvatar/UserListItem'
import NotificationBadge, { Effect } from 'react-notification-badge'
import { allUsersRoute, fetchAllChatsRoute } from '../../utils/APIRoutes'

function SideDrawer() {
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const {
    currentUser,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const getSender = (currUser, users) => {
    return users[0]._id === currUser._id ? users[1] : users[0]
  }

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: 'Please Enter something in search',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-left',
      })
      return
    }
    try {
      setLoading(true)

      // const config = {
      //   headers: {
      //     // Authorization: `Bearer ${currentUser.token}`,
      //   },
      // }

      const { data } = await axios.get(`${allUsersRoute}?search=${search}`, {
        params: { user: { _id: currentUser._id } },
      })

      setLoading(false)
      setSearchResult(data)
    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: 'Failed to Load the Search Results',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      })
    }
  }

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true)
      // const config = {
      //   headers: {
      //     'Content-type': 'application/json',
      //     // Authorization: `Bearer ${currentUser.token}`,
      //   },
      // }

      // const { data } = await axios.post(fetchAllChatsRoute, {
      //   userId,
      //   data: { user: { _id: currentUser._id } },
      // })

      const { data } = await axios.post(
        fetchAllChatsRoute,
        { userId },
        {
          params: { user: { _id: currentUser._id } },
        }
      )
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats])
      }
      setSelectedChat(data)
      setLoadingChat(false)
      onClose()
    } catch (error) {
      toast({
        title: 'Error fetching the chat',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      })
    }
  }
  return (
    <>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        bg='dark'
        w='70%'
        p='5px 10px 5px 10px'
        borderWidth='4px'
        borderRadius='lg'
      >
        <Tooltip label='Search Users to chat' hasArrow placement='bottom-end'>
          <Button variant='ghost' onClick={onOpen} color='white'>
            <i className='fas fa-search'></i>
            <Text d={{ base: 'none', md: 'flex' }} px={4} color='white'>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize='2xl' m={1} color='white' />
            </MenuButton>
            <MenuList paddingLeft={2}>
              {!notification.length && 'No New Messages'}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat)
                    setNotification(
                      notification.filter((n) => n.chat._id !== notif.chat._id)
                    )
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${
                        getSender(currentUser, notif.chat.users).username
                      }`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth='1px'>Search Users</DrawerHeader>
          <DrawerBody>
            <Box display='flex' pb={2}>
              <Input
                placeholder='Search by name or email'
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml='auto' display='flex' />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SideDrawer

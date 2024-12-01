import * as React from 'react';
import { useState, useEffect } from 'react';

import {
  BbbPluginSdk,
  PluginApi,
  ActionButtonDropdownSeparator,
  ActionButtonDropdownOption,
  GenericContentMainArea,
} from 'bigbluebutton-html-plugin-sdk';
import { SampleServerCommandsPluginProps, Message } from './types';
import { GenericContentExample } from '../generic-content-example/component';
import * as ReactDOM from 'react-dom/client';
import axios from 'axios';

export interface DataExampleType {
  first_example_field: number;
  second_example_field: string;
}

function SampleServerCommandsPluginItem(
  { pluginUuid: uuid, pluginName }: SampleServerCommandsPluginProps,
): React.ReactNode {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);

  // Fetch current user information
  const currentUser = pluginApi.useCurrentUser();

  const isAuthorizedUser = currentUser.data?.name === 'BOT';

  // Log authorization status for debugging
  console.log("Is Authorized User:", isAuthorizedUser);

  const [
    chatMessagesToApplyStyle,
    setChatIdsToApplyStyle,
  ] = useState<Message[]>([]);
  const [
    showingGenericContentInPresentationArea,
    setShowingGenericContentInPresentationArea,
  ] = useState(false);

  const loadedMessages = pluginApi.useLoadedChatMessages();   // Fetch loaded chat messages
  const loadedUserList = pluginApi.useLoadedUserList();       // Fetch loaded user list

  // Function to send chat messages and user data to Flask backend
  const sendData = async () => {
    console.log("Loaded Messages: ", loadedMessages.data);  // Debugging
    console.log("Loaded User List: ", loadedUserList.data);  // Debugging
  
    const chatData = loadedMessages.data?.map((message) => {
      const user = loadedUserList.data?.find((user) => user.userId === message.senderUserId);
      return {
        username: user?.name,
        message: message.message
      };
    }) || [];
  
    console.log("Payload to be sent: ", chatData);

    if (chatData.length === 0) {
      console.log("No chat data to send.");
      return;
    }
  
    const payload = { chatData };
  
    try {
      const response = await axios.post('https://<bbb_server_hostname>:5000/receive', payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
        withCredentials: true,
      });
  
      const gptMessage = response.data.response;
      pluginApi.serverCommands.chat.sendPublicChatMessage({
        textMessageInMarkdownFormat: gptMessage,
        pluginCustomMetadata: uuid,
      });
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      console.log('An error occurred while sending the request.');
    }
  };
  
  const handleChangePresentationAreaContent = () => {
    if (!showingGenericContentInPresentationArea) {
      pluginApi.setGenericContentItems([
        new GenericContentMainArea({
          contentFunction: (element: HTMLElement) => {
            const root = ReactDOM.createRoot(element);
            root.render(
              <React.StrictMode>
                <GenericContentExample
                  uuid={uuid}
                />
              </React.StrictMode>,
            );
            return root;
          },
        }),
      ]);
    } else {
      pluginApi.setGenericContentItems([]);
    }
    setShowingGenericContentInPresentationArea(!showingGenericContentInPresentationArea);
  };

  useEffect(() => {
    if (isAuthorizedUser) {
      pluginApi.setActionButtonDropdownItems([
        new ActionButtonDropdownSeparator(),
        new ActionButtonDropdownOption({
          label: 'Generative AI Moderation',
          icon: 'chat',
          tooltip: 'This is a button to send chat message and display chats in presentation area',
          allowed: true,
          onClick: () => {
            pluginApi.serverCommands.chat.sendPublicChatMessage({
              textMessageInMarkdownFormat: 'How are you? Welcome to Generative AI Moderated discussion',
              pluginCustomMetadata: uuid,
            });
            sendData();
            handleChangePresentationAreaContent();
          },
        }),
      ]);
    }
  }, [isAuthorizedUser]);

  useEffect(() => {
    if (isAuthorizedUser && loadedMessages.data && loadedUserList.data) {
      sendData();  // Call sendData to send chat messages to the Flask backend
      
      const messagesToStyle = loadedMessages.data.filter(
        (message) => {
          if (!message.messageMetadata) return false;

          const messageMetadata = JSON.parse(message.messageMetadata);
          if (!messageMetadata.pluginName) return false;

          return (
            (messageMetadata.pluginName === pluginName) && messageMetadata.custom
          );
        },
      ).map((message) => ({
        messageId: message.messageId,
        text: message.message,
      }));
      setChatIdsToApplyStyle(messagesToStyle);
    }
  }, [isAuthorizedUser, loadedMessages, loadedUserList]);

  const messageIds = chatMessagesToApplyStyle.map((message) => message.messageId);
  const chatMessagesDomElements = pluginApi.useChatMessageDomElements(messageIds);

  useEffect(() => {
    chatMessagesDomElements?.map((chatMessageDomElement) => {
      const { parentElement } = chatMessageDomElement;
      if (parentElement.getAttribute('already-styled') === 'true') return false;
      parentElement.setAttribute('already-styled', 'true');
      parentElement.style.paddingTop = '0.5rem';
      const messageIdFromUi = chatMessageDomElement.getAttribute('data-chat-message-id');
      const div = document.createElement('div');
      div.style.backgroundColor = 'gray';
      div.innerHTML = chatMessagesToApplyStyle.find((message) => (
        message.messageId === messageIdFromUi
      )).text;
      chatMessageDomElement.appendChild(div);
      return true;
    });
  }, [chatMessagesDomElements]);

  return null;
}

export default SampleServerCommandsPluginItem;

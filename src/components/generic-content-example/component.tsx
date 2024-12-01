import { BbbPluginSdk, PluginApi } from 'bigbluebutton-html-plugin-sdk';
import * as React from 'react';

interface GenericContentExampleProps {
    uuid: string;
}

export function GenericContentExample(props: GenericContentExampleProps) {
  const {
    uuid,
  } = props;
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);
// Fetch the loaded chat messages instead of the user list
  const loadedChatMessages = pluginApi.useLoadedChatMessages();
  const loadedUserList = pluginApi.useLoadedUserList();
  
  return (
    <div style={{
      background: 'white',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
    }}
    >
      <h1>Generative AI Facilitated chat</h1>
      <ul style={{
        maxHeight: '1000px', // Set a maximum height for the chat container
        overflowY: 'auto',  // Enable vertical scrolling
        padding: '10px',
        border: '1px solid #ddd', // Optional border for clearer sectioning
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
      }}
      >
        {/* Loop over chat messages */}
        {loadedChatMessages.data?.map((message) => {
          // Find the user associated with the message senderUserId
          const user = loadedUserList.data?.find((user) => user.userId === message.senderUserId);
          
          return (
            <li key={message.messageId} style={{
              marginBottom: '8px',
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0',
            }}>
              {/* Display user name in blue and the chat message */}
              <strong style={{ color: '#1a73e8', fontWeight: 'bold' }}>
                {user?.name || "Unknown User"}:
              </strong>
              <span style={{ color: '#555', marginLeft: '4px' }}>{message.message}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}



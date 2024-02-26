require("dotenv").config();

async function fetchChats(offset, limit) {
  const rawResponse = await fetch(
    `https://chat.openai.com/backend-api/conversations?offset=${offset}&limit=${limit}&order=updated`,
    {
      method: "GET",
      headers: {
        Authorization: process.env.Authorization,
        Referer: "https://chat.openai.com/",
        "User-Agent": process.env.UserAgent,
      },
    },
  );
  const content = await rawResponse.json();

  return content;
}

async function fetchChat(chatId) {
  const rawResponse = await fetch(
    `https://chat.openai.com/backend-api/conversation/${chatId}`,
    {
      method: "GET",
      headers: {
        Authorization: process.env.Authorization,
        Referer: "https://chat.openai.com/",
        "User-Agent": process.env.UserAgent,
      },
    },
  );
  const content = await rawResponse.json();

  return content;
}

async function main() {
  let chats = await fetchChats(0, 1);

  let totalChats = chats.total;

  let allChats = [];

  const LIMIT = 99;
  let offset = 0;
  while (offset < totalChats) {
    let chats = await fetchChats(offset, LIMIT);
    allChats = allChats.concat(chats.items);
    offset += LIMIT;
  }

  let firstChat = allChats[0];
  let chat = await fetchChat(firstChat.id);
  let currentNode = chat.current_node;

  const mapping = chat.mapping;

  let message = mapping[currentNode];

  let messages = [];

  while (message.parent != null) {
    messages.push({
      role: message.message.author.role,
      text: message.message.content.parts[0],
    });
    currentNode = message.parent;
    message = mapping[currentNode];
  }

  for (let message of messages.reverse()) {
    console.log(`${message.role}:`);
    console.log(message.text);
    console.log("");
  }
}

main().catch(console.error);

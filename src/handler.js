import { imageSticker, videoSticker } from "./sticker.js";
import { addQueue } from "./queue.js";

export default async function messageHandler(sock, msg) {

  if (!msg.message || msg.key.fromMe) return;

  const from = msg.key.remoteJid;

  const command =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    "";

  const text = command.toLowerCase();

  if (text === "menu") {

    return sock.sendMessage(from, {
      text: `=== WELCOME TO KUROBOT ===

1. info
2. !sticker (reply image/video)

🤖`
    });

  }

  if (text === "info") {

    return sock.sendMessage(from, {
      text: `KuroBot is a sticker generator bot`
    });

  }

  if (text === "!sticker") {

    const quoted =
      msg.message.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {

      return sock.sendMessage(from, {
        text: "Reply image or video with !sticker"
      });

    }

    addQueue(async () => {

      if (quoted.imageMessage) {
        await imageSticker(sock, msg, quoted);
      }

      if (quoted.videoMessage) {
        await videoSticker(sock, msg, quoted);
      }

    });

  }

}
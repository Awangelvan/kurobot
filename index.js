import {
   makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  downloadMediaMessage
} from "@whiskeysockets/baileys";

import qrcode from 'qrcode-terminal'
import pino from 'pino';
import fs from 'fs'
import path from 'path';
import sharp from 'sharp';

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });

    if (connection === "open") {
      console.log("=== KuroBot is active! ===");
    }

    if (connection === "close") {
      if (
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        startBot();
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    messages.toLocaleString().toLocaleLowerCase();
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if(text == "menu"){
        return sock.sendMessage(from,{
            text :
`===WELLCOME TO KUROBOT===
type :
1. info
2. *!sticker* reply to photo
to generate sticker            
🤖kurobot 
`
        })
    }

 if(text == "info"){
        return sock.sendMessage(from,{
            text :
`===WELLCOME TO KUROBOT===
this is a wabot to generate photo to sticker
how to use it :
--reply photo with *!sticker*
🤖KUROBOT
`
        })}

    // ===== STICKER COMMAND =====
    if (text === "!sticker") {
      const quoted =
        msg.message.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted || !quoted.imageMessage) {
        return sock.sendMessage(from, {
          text: "⚠️ Reply foto dengan *!sticker*"
        });
      }

      // download image
      const buffer = await downloadMediaMessage(
        {
          message: quoted,
          key: msg.key
        },
        "buffer",
        {},
        {
          logger: pino({ level: "silent" }),
          reuploadRequest: sock.updateMediaMessage
        }
      );

      const inputPath = path.join("temp", "input.png");
      const outputPath = path.join("temp", "sticker.webp");

      fs.writeFileSync(inputPath, buffer);

      // convert to webp
      await sharp(inputPath)
        .resize(512, 512, { fit: "contain" })
        .toFormat("webp")
        .toFile(outputPath);

      const stickerBuffer = fs.readFileSync(outputPath);

      await sock.sendMessage(from, {
        sticker: stickerBuffer
      });

      // cleanup
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    }
  });
}

startBot();

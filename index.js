import {
   makeWASocket,
   downloadContentFromMessage,
  useMultiFileAuthState,
  DisconnectReason,
  downloadMediaMessage
} from "@whiskeysockets/baileys";

import ffmpegPath from "ffmpeg-static";
import Ffmpeg from "fluent-ffmpeg";
import qrcode from 'qrcode-terminal'
import pino from 'pino';
import fs from 'fs'
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
    const msg = messages[0];
    const id =  Date.now()
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const command =
      msg.message.conversation||
      msg.message.extendedTextMessage?.text;
    const text = command.toLocaleLowerCase();

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
`====WELLCOME TO KUROBOT====

this is a wabot to generate photo 
to sticker
how to use it :
--reply photo with *!sticker*

🤖KUROBOT
`
        })}

// =======GENERATE STICKER FROM VIDEO OR GIF========
if(msg.message?.videoMessage && msg.message.videoMessage.caption == "!sticker"){
  const videoPath = `temp/${id}.mp4`;
      const stickerGifPath = `temp/${id}.webp`;
      
        const inputMedia = await downloadContentFromMessage(msg.message.videoMessage ,'video')
        //download short video or gif 
        let buffer = Buffer.from([])
        for await(const chunk of inputMedia){
          buffer = Buffer.concat([buffer,chunk])
        }

        fs.writeFileSync(videoPath,buffer)

        //generate sticker
        Ffmpeg.setFfmpegPath(ffmpegPath)
        
        await new Promise ((resolve ,reject) => {
        Ffmpeg(videoPath).outputOptions([
        "-vf fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
       "-an",
        "-loop 0",
        "-t 3"
        ]).toFormat('webp').save(stickerGifPath)
          .on('end',resolve)
          .on('error',reject)        
        })
        //send sticker
        const gifSticker = fs.readFileSync(stickerGifPath)
        await sock.sendMessage(from,{sticker:gifSticker})


fs.unlinkSync(videoPath)
fs.unlinkSync(stickerGifPath)
      }

    // ===== STICKER COMMAND PHOTO=====
    if(msg.message?.imageMessage && msg.message?.imageMessage.caption == "!sticker"){
        const inputMedia = await downloadContentFromMessage(msg.message.imageMessage ,'image')
        //download image 
        let buffer = Buffer.from([])
        for await(const chunk of inputMedia){
          buffer = Buffer.concat([buffer,chunk])
        }

        //generate sticker
        const stickerBuffer = await sharp(buffer).resize(512,512,{fit : 'contain'}).toFormat('webp').toBuffer()

        //send sticker
        await sock.sendMessage(from,{sticker:stickerBuffer})
      }

      // reply command
      if (text === "!sticker") {
      
      const quoted =
        msg.message.extendedTextMessage?.contextInfo?.quotedMessage ;

        // reply gif or short video
      if(quoted.videoMessage){

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

      const inputPath = `temp/${id}.mp4`;
      const outputPath = `temp/${id}.webp`;
      
      fs.writeFileSync(inputPath, buffer);
      
      //convert fo ffmpeg
      Ffmpeg.setFfmpegPath(ffmpegPath)
      
      await new Promise ((resolve ,reject) => {
        Ffmpeg(inputPath).outputOptions([
          "-vf fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
          "-an",
          "-loop 0",
          "-t 3"
        ]).toFormat('webp').save(outputPath)
        .on('end',resolve)
        .on('error',reject)        
      })
        //send sticker
        const gifSticker = fs.readFileSync(outputPath)
        await sock.sendMessage(from,{sticker:gifSticker})


      fs.unlinkSync(inputPath)
      fs.unlinkSync(outputPath)
      }

      // reply for image
      if(quoted.imageMessage){
      
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

      const inputPath = `temp/${id}.png`;
      const outputPath = `temp/${id}.webp`;
      
      fs.writeFileSync(inputPath, buffer);
      
      

      // convert to webp
      await sharp(inputPath)
        .resize(512, 512, { fit: "contain" })
        .toFormat("webp")
        .toFile(outputPath);

      const stickerBuffer = fs.readFileSync(outputPath);

      await sock.sendMessage(from, {
        sticker: stickerBuffer
      }
    );

      // cleanup
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath); 


      }
      // no media send
      if (!quoted && !quoted.imageMessage && !quoted.videoMessage) {
        return sock.sendMessage(from, {
          text: "⚠️ Reply foto dengan *!sticker*"
        });
      }


      // download image
          }
  });
}

startBot();

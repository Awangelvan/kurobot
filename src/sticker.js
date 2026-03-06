import sharp from "sharp";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";
import Ffmpeg from "fluent-ffmpeg";

Ffmpeg.setFfmpegPath(ffmpegPath);

export async function imageSticker(sock, msg, quoted) {

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
        .resize(512, 512, { fit: 'contain' })
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

}

export async function videoSticker(sock, msg, quoted) {

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

      // reply command
      if (text === "!sticker") {
        

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

    }
}
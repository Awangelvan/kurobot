const { Client, MessageMedia, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const FormData = require("form-data");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const client = new Client();

client.on("qr", (qr) => {});

client.on("ready", () => {
  console.log("===KuroBot siap digunakan!===");
});

client.on("message", async (msg) => {
  const input = msg.body.toLowerCase();

  // ===== MENU =====
  if (input === "menu") {
    return msg.reply(
`👋 *WELLCOME TO KUROBOT*
============================
Type:
1️⃣ info
2️⃣ !rmbg (reply photo)
2️⃣ !sticker (reply photo) or caption
============================
🤖 KuroBot`
    );
  }

  // create sticker
if(input == "!sticker"){
  let mediaMessage = msg;
  if(msg.hasQuotedMsg){
    const quoted = await msg.getQuotedMessage()
    if (quoted.hasMedia){
     mediaMessage = quoted
    }
  }
  const media = await mediaMessage.downloadMedia();
  await client.sendMessage(msg.from , media , {
    sendMediaAsSticker:true,
    stickerAuthor : "kurobot",
    stickerName : 'Sticker by kurobot'
  })
  if(!mediaMessage){
    msg.reply('⚠️ send or reply photo with *!sticker*')
  }
}


  // ===== INFO =====
  if (input === "info") {
    return msg.reply(
`🤖 *KUROBOT*
This is a bot to remove background
photo and generate photo => sticker

📌 Step to remove background:
1. send a photo
2. Reply that photo with:
   *!rmbg*

📌 Step to generate a sticker:
1. send photo with caption *!sticker* or
2. Reply photo with command *!sticker*`
    );
  }
  const quotedMsg = await msg.getQuotedMessage();
  // ===== REMOVE BG =====
  if (input === "!rmbg") {
    if (!quotedMsg || !quotedMsg.hasMedia) {
      return msg.reply("❌ Reply photo with command *!rmbg*");
    }


    const media = await quotedMsg.downloadMedia();
    const buffer = Buffer.from(media.data, "base64");

    const formData = new FormData();
    formData.append("image_file", buffer, "image.png");
    formData.append("size", "auto");

    try {
      msg.reply("⏳ removing background...");

      const response = await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            "X-Api-Key": process.env.RMBG_API_KEY,
          },
          responseType: "arraybuffer",
        }
      );

      const output = new MessageMedia(
        "image/png",
        Buffer.from(response.data).toString("base64")
      );

      await msg.reply(output);
    } catch (error) {
      console.error(error.response?.data || error.message);
      msg.reply("❌ Failed to remove background the day limit has been reached");
    }
    return;
  }


  // ===== DEFAULT =====
  if (!msg.fromMe) {
    msg.reply("type *menu* to see a command 🤖");
  }

});

client.initialize();

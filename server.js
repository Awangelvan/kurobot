const { Client, MessageMedia, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const FormData = require("form-data");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Scan QR untuk login");
});

client.on("ready", () => {
  console.log("===KuroBot siap digunakan!===");
});

client.on("message", async (msg) => {
  const input = msg.body.toLowerCase();

  // ===== MENU =====
  if (input === "menu") {
    return msg.reply(
`👋 *SELAMAT DATANG DI KUROBOT*
============================
Ketik:
1️⃣ info
2️⃣ !rmbg (reply foto)
2️⃣ !sticker (reply foto) atau caption
============================
🤖 KuroBot`
    );
  }

  // create sticker
if(input == "!sticker"){
  if(msg.hasQuotedMsg){
    const quoted = await msg.getQuotedMessage()
    if (quoted.hasMedia){
     mediaMessage = quoted
    } else{
      mediaMessage = msg
    }
  }
  if(!mediaMessage){
    msg.reply('⚠️ kirim atau reply foto dengan !sticker')
  }
  const media = await mediaMessage.downloadMedia();
  await client.sendMessage(msg.from , media , {
    sendMediaAsSticker:true,
    stickerAuthor : "kurobot",
    stickerName : 'Sticker from kurobot'
  })
}


  // ===== INFO =====
  if (input === "info") {
    return msg.reply(
`🤖 *KUROBOT*
Bot untuk menghapus background foto.
dan mengenerate foto => sticker

📌 Cara pakai hapus background:
1. Kirim foto
2. Reply foto tersebut dengan:
   *!rmbg*

📌 Cara pakai hapus background:
1. Kirim foto dengan caption *!sticker* atau
2. Reply foto tersebut dengan *!sticker*`
    );
  }
  const quotedMsg = await msg.getQuotedMessage();
  // ===== REMOVE BG =====
  if (input === "!rmbg") {
    if (!quotedMsg || !quotedMsg.hasMedia) {
      return msg.reply("❌ Reply ke *foto* dengan perintah *!rmbg*");
    }


    const media = await quotedMsg.downloadMedia();
    const buffer = Buffer.from(media.data, "base64");

    const formData = new FormData();
    formData.append("image_file", buffer, "image.png");
    formData.append("size", "auto");

    try {
      msg.reply("⏳ Sedang menghapus background...");

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
      msg.reply("❌ Gagal menghapus background (cek API key / limit)");
    }
    return;
  }


  // ===== DEFAULT =====
  if (!msg.fromMe) {
    msg.reply("Ketik *menu* untuk melihat perintah 🤖");
  }

});

client.initialize();

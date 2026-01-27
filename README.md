# KuroBot – WhatsApp Sticker Bot

KuroBot is a WhatsApp bot built with **Node.js** and **Baileys** that allows users to convert **images, videos, and GIFs** into WhatsApp stickers.

---

## ✨ Features

- Convert image to sticker
- Convert video to animated sticker
- Convert GIF to animated sticker
- Support direct media and reply media
- Auto resize to 512×512 (WhatsApp standard)
- WA-friendly animated sticker settings
- Automatic temporary file cleanup

---

## 🛠 Tech Stack

- Node.js
- @whiskeysockets/baileys
- Sharp (image processing)
- FFmpeg (video & GIF processing)
- fluent-ffmpeg
- ffmpeg-static
- pino (logger)

---

## 📦 Requirements

Before running this bot, make sure you have:

- **Node.js v18 or higher**
- **FFmpeg installed** (or use ffmpeg-static)
- A **WhatsApp account** to scan QR code

Check FFmpeg installation:

```bash
ffmpeg -version
```
## INSTALATION
```bash
git clone https://github.com/yourusername/kurobot.git
cd kurobot
npm install
```

## RUN BOT
```bash
node index
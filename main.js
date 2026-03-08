import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys"
import qrcode from "qrcode-terminal"

async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState("session")

  const sock = makeWASocket({
    auth: state,
    browser: ["Windows", "Chrome", "122.0.0"],
    syncFullHistory: false
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {

    console.log("connection:", update)

    const { connection, qr } = update

    if (qr) {
      console.log("Scan QR:")
      qrcode.generate(qr, { small: true })
    }

    if (connection === "open") {
      console.log("Bot connected ✅")
    }

    if (connection === "close") {
      console.log("Connection closed, retrying...")
      startBot()
    }

  })

}

startBot()
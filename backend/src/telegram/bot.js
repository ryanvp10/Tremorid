// Telegram bot — Telegraf webhook handler
// TODO: integrate Telegraf bot with webhook mode

function getBotWebhookHandler() {
  return (req, res) => {
    console.log('Telegram webhook received')
    res.sendStatus(200)
  }
}

module.exports = { getBotWebhookHandler }

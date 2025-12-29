@echo off
REM Zalo Bot API - cURL Examples Script for Windows
REM Thay thế các giá trị dưới đây bằng thông tin thực tế của bạn

set BOT_TOKEN=YOUR_BOT_TOKEN
set CHAT_ID=YOUR_CHAT_ID
set WEBHOOK_URL=https://your-webhook-url.com/webhook
set SECRET_TOKEN=your_secret_token_8_to_256_chars

echo === Zalo Bot API cURL Examples ===
echo.

REM 1. getMe
echo 1. Testing getMe API...
curl -X GET "https://bot-api.zaloplatforms.com/bot%BOT_TOKEN%/getMe" -H "Content-Type: application/json"
echo.

REM 2. getUpdates
echo 2. Testing getUpdates API...
curl -X GET "https://bot-api.zaloplatforms.com/bot%BOT_TOKEN%/getUpdates"
echo.

REM 3. setWebhook
echo 3. Testing setWebhook API...
curl -X POST "https://bot-api.zaloplatforms.com/bot%BOT_TOKEN%/setWebhook" -H "Content-Type: application/json" -d "{\"url\": \"%WEBHOOK_URL%\", \"secret_token\": \"%SECRET_TOKEN%\"}"
echo.

REM 4. getWebhookInfo
echo 4. Testing getWebhookInfo API...
curl -X GET "https://bot-api.zaloplatforms.com/bot%BOT_TOKEN%/getWebhookInfo" -H "Content-Type: application/json"
echo.

REM 5. sendMessage
echo 5. Testing sendMessage API...
curl -X POST "https://bot-api.zaloplatforms.com/bot%BOT_TOKEN%/sendMessage" -H "Content-Type: application/json" -d "{\"chat_id\": \"%CHAT_ID%\", \"text\": \"Xin chao! Day la tin nhan test tu bot.\"}"
echo.

REM 6. sendPhoto
echo 6. Testing sendPhoto API...
curl -X POST "https://bot-api.zaloplatforms.com/bot%BOT_TOKEN%/sendPhoto" -H "Content-Type: application/json" -d "{\"chat_id\": \"%CHAT_ID%\", \"photo\": \"https://example.com/image.jpg\", \"caption\": \"Hinh anh test\"}"
echo.

REM 7. sendSticker
echo 7. Testing sendSticker API...
curl -X POST "https://bot-api.zaloplatforms.com/bot%BOT_TOKEN%/sendSticker" -H "Content-Type: application/json" -d "{\"chat_id\": \"%CHAT_ID%\", \"sticker_id\": \"STICKER_ID_HERE\"}"
echo.

REM 8. sendChatAction
echo 8. Testing sendChatAction API...
curl -X POST "https://bot-api.zaloplatforms.com/bot%BOT_TOKEN%/sendChatAction" -H "Content-Type: application/json" -d "{\"chat_id\": \"%CHAT_ID%\", \"action\": \"typing\"}"
echo.

REM 9. deleteWebhook
echo 9. Testing deleteWebhook API...
curl -X POST "https://bot-api.zaloplatforms.com/bot%BOT_TOKEN%/deleteWebhook" -H "Content-Type: application/json"
echo.

echo === Done ===
pause




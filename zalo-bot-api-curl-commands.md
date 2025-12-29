# Zalo Bot API - cURL Commands

File này chứa các lệnh cURL cho tất cả các API cần thiết để phát triển node n8n cho Zalo Bot.

**Base URL**: `https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}`

**Lưu ý**: Thay thế `{BOT_TOKEN}` bằng token thực tế của bot Zalo của bạn.

---

## 1. getMe - Lấy thông tin Bot

Lấy thông tin về bot hiện tại.

```bash
curl -X GET "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/getMe" \
     -H "Content-Type: application/json"
```

---

## 2. getUpdates - Lấy các cập nhật mới nhất

Lấy danh sách các cập nhật mới nhất (tin nhắn, sự kiện) từ Zalo.

```bash
curl -X GET "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/getUpdates"
```

**Với tham số tùy chọn** (offset, limit):

```bash
curl -X GET "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/getUpdates?offset=0&limit=100"
```

---

## 3. setWebhook - Cấu hình Webhook URL

Cấu hình URL để nhận thông báo từ Zalo Bot Platform.

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-webhook-url.com/webhook",
       "secret_token": "your_secret_token_8_to_256_chars"
     }'
```

**Tham số**:
- `url` (required): URL nhận thông báo dạng HTTPS
- `secret_token` (required): Khóa bí mật từ 8 tới 256 ký tự, được gửi trong header `X-Bot-Api-Secret-Token`

---

## 4. deleteWebhook - Xóa Webhook

Xóa cấu hình Webhook hiện tại.

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/deleteWebhook" \
     -H "Content-Type: application/json"
```

---

## 5. getWebhookInfo - Lấy thông tin Webhook

Lấy thông tin về Webhook hiện tại đã được cấu hình.

```bash
curl -X GET "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/getWebhookInfo" \
     -H "Content-Type: application/json"
```

---

## 6. sendMessage - Gửi tin nhắn văn bản

Gửi tin nhắn văn bản đến người dùng.

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/sendMessage" \
     -H "Content-Type: application/json" \
     -d '{
       "chat_id": "{CHAT_ID}",
       "text": "Xin chào! Đây là tin nhắn từ bot."
     }'
```

**Tham số**:
- `chat_id` (required): ID của cuộc trò chuyện/người dùng
- `text` (required): Nội dung tin nhắn

---

## 7. sendPhoto - Gửi hình ảnh

Gửi hình ảnh đến người dùng.

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/sendPhoto" \
     -H "Content-Type: application/json" \
     -d '{
       "chat_id": "{CHAT_ID}",
       "photo": "https://example.com/image.jpg",
       "caption": "Chú thích cho hình ảnh"
     }'
```

**Tham số**:
- `chat_id` (required): ID của cuộc trò chuyện/người dùng
- `photo` (required): URL hoặc file_id của hình ảnh
- `caption` (optional): Chú thích cho hình ảnh

---

## 8. sendSticker - Gửi Sticker

Gửi sticker đến người dùng.

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/sendSticker" \
     -H "Content-Type: application/json" \
     -d '{
       "chat_id": "{CHAT_ID}",
       "sticker_id": "{STICKER_ID}"
     }'
```

**Tham số**:
- `chat_id` (required): ID của cuộc trò chuyện/người dùng
- `sticker_id` (required): ID của sticker

---

## 9. sendChatAction - Gửi hành động Chat

Gửi trạng thái hành động (ví dụ: "đang gõ") đến người dùng.

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/sendChatAction" \
     -H "Content-Type: application/json" \
     -d '{
       "chat_id": "{CHAT_ID}",
       "action": "typing"
     }'
```

**Tham số**:
- `chat_id` (required): ID của cuộc trò chuyện/người dùng
- `action` (required): Loại hành động (ví dụ: "typing", "upload_photo", "upload_video", "upload_document", "find_location", "record_video", "record_audio", "upload_audio")

---

## Danh sách API cần thiết cho n8n Node

### API Quản lý Bot & Webhook:
1. ✅ **getMe** - Lấy thông tin bot
2. ✅ **getUpdates** - Lấy cập nhật (polling method)
3. ✅ **setWebhook** - Cấu hình webhook (webhook method)
4. ✅ **deleteWebhook** - Xóa webhook
5. ✅ **getWebhookInfo** - Lấy thông tin webhook

### API Gửi tin nhắn:
6. ✅ **sendMessage** - Gửi tin nhắn văn bản
7. ✅ **sendPhoto** - Gửi hình ảnh
8. ✅ **sendSticker** - Gửi sticker
9. ✅ **sendChatAction** - Gửi hành động chat

---

## Cách sử dụng trong n8n

Khi phát triển node n8n, bạn sẽ cần:

1. **Webhook Trigger Node**: Sử dụng `setWebhook` để cấu hình webhook URL của n8n
2. **Action Nodes**: 
   - Send Message node (sử dụng `sendMessage`)
   - Send Photo node (sử dụng `sendPhoto`)
   - Send Sticker node (sử dụng `sendSticker`)
3. **Utility Nodes**:
   - Get Bot Info (sử dụng `getMe`)
   - Get Webhook Info (sử dụng `getWebhookInfo`)

---

## Response Format

Tất cả các API trả về JSON với format:

**Success**:
```json
{
  "ok": true,
  "result": {
    // Dữ liệu kết quả
  }
}
```

**Error**:
```json
{
  "ok": false,
  "error_code": 400,
  "description": "Mô tả lỗi"
}
```

---

## Authentication

Tất cả các request cần:
- **Header**: `Content-Type: application/json`
- **URL**: Chứa `{BOT_TOKEN}` trong path

Đối với webhook từ Zalo gọi về:
- **Header**: `X-Bot-Api-Secret-Token` chứa `secret_token` đã cấu hình trong `setWebhook`

---

**Tài liệu tham khảo**: https://bot.zaloplatforms.com/docs/




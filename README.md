# n8n-nodes-zalo-bot-stephen

Custom n8n nodes for integrating with Zalo Bot Platform.

## Installation

### Via npm

```bash
npm install n8n-nodes-zalo-bot-stephen
```

### Install directly in n8n

1. Go to Settings > Community Nodes
2. Click "Install a community node"
3. Enter: `n8n-nodes-zalo-bot-stephen`
4. Click "Install"

**Note:** The package name is `n8n-nodes-zalo-bot-stephen` (not `n8n-nodes-zalo-bot`). Make sure to use the correct package name when installing.

## Nodes

### Zalo Bot Trigger

A webhook trigger node that starts your workflow when Zalo Bot receives a message.

**Features:**
- Automatically configures webhook URL when activated
- Validates incoming webhook requests using secret token
- Handles webhook lifecycle (add, check, remove)
- **Two webhook modes:**
  - **Default Webhook**: Single output for all message types
  - **Smart Webhook**: Intelligent routing to 5 different outputs based on message type

**Webhook Modes:**

#### Default Webhook
- Single output for all incoming messages
- Simple setup for basic workflows
- All message types routed to the same output

#### Smart Webhook (NEW!)
- **5 intelligent outputs** for different message types:
  1. **Text Message** - Text-only messages
  2. **Photo Only** - Images without captions
  3. **Photo + Message** - Images with captions (perfect for e-commerce queries)
  4. **Sticker** - Sticker messages
  5. **Unsupported/Other** - Files, locations, and unsupported message types
- Automatic routing based on message content
- Perfect for complex workflows requiring different handling per message type

**Configuration:**
1. Add your Zalo Bot API credentials
2. Choose webhook mode (Default or Smart)
3. The node will automatically set up the webhook when activated
4. Incoming messages will trigger the workflow and route to appropriate outputs (Smart mode)

### Zalo Bot

An action node for sending messages and interacting with Zalo Bot.

**Resources:**
- **Message**: Send text messages, photos, stickers, and chat actions
- **Bot**: Get bot information
- **Webhook**: Manage webhook configuration

**Operations:**

#### Message Operations
- **Send Message**: Send a text message to a chat
- **Send Photo**: Send a photo (supports URL or binary data)
- **Send Sticker**: Send a sticker by sticker ID
- **Send Chat Action**: Send typing indicators or upload status

#### Bot Operations
- **Get Me**: Get information about your bot

#### Webhook Operations
- **Get Webhook Info**: Get current webhook configuration
- **Set Webhook**: Configure webhook URL manually
- **Delete Webhook**: Remove webhook configuration

## Credentials

### Zalo Bot API

1. Go to [Zalo Bot Platform](https://bot.zaloplatforms.com/)
2. Create a bot and get your Bot Token
3. Add the credential in n8n with your Bot Token

## Usage Examples

### Example 1: Simple Message Echo Bot (Default Webhook)

1. Add **Zalo Bot Trigger** node (use Default webhook)
2. Add **Zalo Bot** node
3. Configure Zalo Bot node:
   - Resource: Message
   - Operation: Send Message
   - Chat ID: `{{ $json.message.chat.id }}`
   - Text: `{{ $json.message.text }}`

### Example 1b: Smart Routing Bot (Smart Webhook)

1. Add **Zalo Bot Trigger** node (use Smart webhook)
2. Connect different outputs to different workflows:
   - **Output 0 (Text)**: Connect to AI chatbot for text processing
   - **Output 1 (Photo Only)**: Connect to image storage (Google Drive, etc.)
   - **Output 2 (Photo + Message)**: Connect to e-commerce handler (process product queries with images)
   - **Output 3 (Sticker)**: Connect to sticker reply handler
   - **Output 4 (Unsupported)**: Connect to auto-reply: "Sorry, this format is not supported"

### Example 2: E-commerce Bot with Smart Routing

1. Add **Zalo Bot Trigger** node (Smart webhook)
2. Connect **Output 2 (Photo + Message)** to:
   - Extract caption text: `{{ $json.message.caption }}`
   - Extract photo URL: `{{ $json.message.photo_url }}`
   - Process product query with image
   - Reply with product information
3. Connect **Output 0 (Text)** to:
   - AI chatbot for general questions
4. Connect **Output 1 (Photo Only)** to:
   - Save image to storage

### Example 3: Send Photo from URL

1. Add **Zalo Bot** node
2. Configure:
   - Resource: Message
   - Operation: Send Photo
   - Chat ID: `123456789`
   - Photo: `https://example.com/image.jpg`
   - Caption: `Check out this image!`

### Example 4: Send Photo from Binary Data

1. Add a node that provides binary data (e.g., HTTP Request to download image)
2. Add **Zalo Bot** node
3. Configure:
   - Resource: Message
   - Operation: Send Photo
   - Chat ID: `123456789`
   - Binary Data: `true`
   - Binary Property: `data` (or your binary property name)
   - Caption: `Image from workflow`

## Smart Webhook Routing Logic

The Smart Webhook automatically routes messages based on `event_name` and message content:

| Event Type | Condition | Output |
|------------|-----------|--------|
| `message.text.received` | Text message | Output 0: Text Message |
| `message.image.received` | Image with empty/null caption | Output 1: Photo Only |
| `message.image.received` | Image with caption text | Output 2: Photo + Message |
| `message.sticker.received` | Sticker message | Output 3: Sticker |
| `message.unsupported.received` | Unsupported type | Output 4: Unsupported/Other |
| Any other event | Fallback | Output 4: Unsupported/Other |

**Message Structure:**
```json
{
  "event_name": "message.image.received",
  "message": {
    "caption": "Mẫu này còn không?",
    "photo_url": "https://...",
    "chat": { "id": "..." },
    "from": { "display_name": "..." }
  }
}
```

## API Reference

For detailed API documentation, visit: [Zalo Bot Platform Docs](https://bot.zaloplatforms.com/docs/)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Lint
npm run lint
```

## License

MIT

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/your-username/n8n-nodes-zalo-bot).

## Package Information

- **Package Name:** `n8n-nodes-zalo-bot-stephen`
- **Current Version:** `0.2.0`
- **npm Registry:** [https://www.npmjs.com/package/n8n-nodes-zalo-bot-stephen](https://www.npmjs.com/package/n8n-nodes-zalo-bot-stephen)



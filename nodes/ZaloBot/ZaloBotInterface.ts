/**
 * Zalo Bot API Response Structure
 */
export interface ZaloApiResponse<T = any> {
	ok: boolean;
	result?: T;
	error_code?: number;
	description?: string;
}

/**
 * Bot Information from getMe
 */
export interface ZaloBotInfo {
	id: string;
	is_bot: boolean;
	first_name?: string;
	last_name?: string;
	username?: string;
	can_join_groups?: boolean;
	can_read_all_group_messages?: boolean;
	supports_inline_queries?: boolean;
}

/**
 * Webhook Information
 */
export interface ZaloWebhookInfo {
	url?: string;
	has_custom_certificate?: boolean;
	pending_update_count?: number;
	last_error_date?: number;
	last_error_message?: string;
	max_connections?: number;
	allowed_updates?: string[];
	updated_at?: number;
}

/**
 * Message from Zalo
 */
export interface ZaloMessage {
	message_id: number;
	from?: {
		id: number;
		is_bot: boolean;
		first_name?: string;
		last_name?: string;
		username?: string;
	};
	chat: {
		id: number;
		type: 'private' | 'group' | 'supergroup' | 'channel';
		title?: string;
		username?: string;
		first_name?: string;
		last_name?: string;
	};
	date: number;
	text?: string;
	location?: {
		latitude: number;
		longitude: number;
	};
	photo?: Array<{
		file_id: string;
		file_unique_id: string;
		width: number;
		height: number;
		file_size?: number;
	}>;
	sticker?: {
		file_id: string;
		file_unique_id: string;
		width: number;
		height: number;
		emoji?: string;
		set_name?: string;
		file_size?: number;
	};
	document?: {
		file_id: string;
		file_unique_id: string;
		file_name?: string;
		mime_type?: string;
		file_size?: number;
	};
}

/**
 * Update from getUpdates or Webhook
 */
export interface ZaloUpdate {
	update_id: number;
	message?: ZaloMessage;
	edited_message?: ZaloMessage;
	channel_post?: ZaloMessage;
	edited_channel_post?: ZaloMessage;
}

/**
 * Request Interfaces for API Calls
 */
export interface SendMessageRequest {
	chat_id: string | number;
	text: string;
	parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
	disable_web_page_preview?: boolean;
	disable_notification?: boolean;
	reply_to_message_id?: number;
}

export interface SendPhotoRequest {
	chat_id: string | number;
	photo: string; // URL or file_id
	caption?: string;
	parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
	disable_notification?: boolean;
	reply_to_message_id?: number;
}

export interface SendStickerRequest {
	chat_id: string | number;
	sticker_id: string;
	disable_notification?: boolean;
	reply_to_message_id?: number;
}

export interface SendChatActionRequest {
	chat_id: string | number;
	action:
		| 'typing'
		| 'upload_photo'
		| 'upload_video'
		| 'upload_document'
		| 'find_location'
		| 'record_video'
		| 'record_audio'
		| 'upload_audio';
}

export interface SetWebhookRequest {
	url: string;
	secret_token: string;
	allowed_updates?: string[];
}


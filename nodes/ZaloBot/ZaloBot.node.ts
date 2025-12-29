import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
} from 'n8n-workflow';
import FormData from 'form-data';
import {
	ZaloApiResponse,
	ZaloBotInfo,
	ZaloWebhookInfo,
	SendMessageRequest,
	SendPhotoRequest,
	SendStickerRequest,
	SendChatActionRequest,
	SetWebhookRequest,
} from './ZaloBotInterface';

// Helper function for making requests with retry logic
async function makeRequestWithRetry(
	executeFunctions: IExecuteFunctions,
	url: string,
	method: 'GET' | 'POST',
	body?: IDataObject | FormData,
	isMultipart = false,
	maxRetries = 3,
): Promise<ZaloApiResponse> {
	let lastError: Error | null = null;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const options: any = {
				method,
				url,
				headers: {},
			};

			if (isMultipart && body instanceof FormData) {
				options.body = body;
				options.headers = body.getHeaders();
			} else if (body) {
				options.body = body;
				options.headers['Content-Type'] = 'application/json';
				options.json = true;
			} else {
				options.headers['Content-Type'] = 'application/json';
			}

			const response = await executeFunctions.helpers.httpRequest(options);
			return response as ZaloApiResponse;
		} catch (error) {
			lastError = error;

			// Don't retry on client errors (4xx)
			if (error.response?.status >= 400 && error.response?.status < 500) {
				throw error;
			}

			// Retry on network errors or server errors (5xx)
			if (attempt < maxRetries) {
				// Exponential backoff: wait 1s, 2s, 4s
				await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
				continue;
			}
		}
	}

	throw lastError || new Error('Request failed after retries');
}

export class ZaloBot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zalo Bot',
		name: 'zaloBot',
		icon: 'file:zalo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + "/" + $parameter["operation"]}}',
		description: 'Send messages and interact with Zalo Bot',
		defaults: {
			name: 'Zalo Bot',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'zaloApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'Bot',
						value: 'bot',
					},
					{
						name: 'Webhook',
						value: 'webhook',
					},
				],
				default: 'message',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				options: [
					{
						name: 'Send Message',
						value: 'sendMessage',
						description: 'Send a text message',
						action: 'Send a text message',
					},
					{
						name: 'Send Photo',
						value: 'sendPhoto',
						description: 'Send a photo',
						action: 'Send a photo',
					},
					{
						name: 'Send Sticker',
						value: 'sendSticker',
						description: 'Send a sticker',
						action: 'Send a sticker',
					},
					{
						name: 'Send Chat Action',
						value: 'sendChatAction',
						description: 'Send a chat action (typing, uploading, etc.)',
						action: 'Send a chat action',
					},
				],
				default: 'sendMessage',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['bot'],
					},
				},
				options: [
					{
						name: 'Get Me',
						value: 'getMe',
						description: 'Get bot information',
						action: 'Get bot information',
					},
				],
				default: 'getMe',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
					},
				},
				options: [
					{
						name: 'Get Webhook Info',
						value: 'getWebhookInfo',
						description: 'Get webhook information',
						action: 'Get webhook information',
					},
					{
						name: 'Set Webhook',
						value: 'setWebhook',
						description: 'Set webhook URL',
						action: 'Set webhook URL',
					},
					{
						name: 'Delete Webhook',
						value: 'deleteWebhook',
						description: 'Delete webhook',
						action: 'Delete webhook',
					},
				],
				default: 'getWebhookInfo',
			},
			{
				displayName: 'Chat ID',
				name: 'chatId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendMessage', 'sendPhoto', 'sendSticker', 'sendChatAction'],
					},
				},
				default: '',
				description: 'The chat ID to send the message to',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendMessage'],
					},
				},
				default: '',
				description: 'The message text',
			},
			{
				displayName: 'Photo',
				name: 'photo',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendPhoto'],
					},
				},
				default: '',
				description: 'Photo URL or file_id. Leave empty to use binary data.',
			},
			{
				displayName: 'Binary Data',
				name: 'binaryData',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendPhoto'],
					},
				},
				default: false,
				description: 'Whether to use binary data from previous node',
			},
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendPhoto'],
						binaryData: [true],
					},
				},
				default: 'data',
				description: 'Name of the binary property containing the image',
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendPhoto'],
					},
				},
				default: '',
				description: 'Photo caption',
			},
			{
				displayName: 'Sticker ID',
				name: 'stickerId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendSticker'],
					},
				},
				default: '',
				description: 'The sticker ID to send',
			},
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendChatAction'],
					},
				},
				options: [
					{
						name: 'Typing',
						value: 'typing',
					},
					{
						name: 'Upload Photo',
						value: 'upload_photo',
					},
					{
						name: 'Upload Video',
						value: 'upload_video',
					},
					{
						name: 'Upload Document',
						value: 'upload_document',
					},
					{
						name: 'Find Location',
						value: 'find_location',
					},
					{
						name: 'Record Video',
						value: 'record_video',
					},
					{
						name: 'Record Audio',
						value: 'record_audio',
					},
					{
						name: 'Upload Audio',
						value: 'upload_audio',
					},
				],
				default: 'typing',
				description: 'The chat action to send',
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['setWebhook'],
					},
				},
				default: '',
				description: 'The webhook URL to set',
			},
			{
				displayName: 'Secret Token',
				name: 'secretToken',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['setWebhook'],
					},
				},
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Secret token (8-256 characters) for webhook validation',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const executeFunctions = this;
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('zaloApi');
		const botToken = credentials.botToken as string;
		const baseUrl = `https://bot-api.zaloplatforms.com/bot${botToken}`;

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let response: ZaloApiResponse;

				if (resource === 'message') {
					if (operation === 'sendMessage') {
						const chatId = this.getNodeParameter('chatId', i) as string;
						const text = this.getNodeParameter('text', i) as string;

						const body: SendMessageRequest = {
							chat_id: chatId,
							text,
						};

						// @ts-ignore - Type mismatch with IDataObject
						response = await makeRequestWithRetry(
							executeFunctions,
							`${baseUrl}/sendMessage`,
							'POST',
							// @ts-ignore
							body,
						);
					} else if (operation === 'sendPhoto') {
						const chatId = this.getNodeParameter('chatId', i) as string;
						const useBinary = this.getNodeParameter('binaryData', i, false) as boolean;
						const caption = this.getNodeParameter('caption', i, '') as string;

						let photoData: string | Buffer;
						let isMultipart = false;
						let filename = 'photo.jpg';
						let contentType = 'image/jpeg';

						if (useBinary) {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i, 'data') as string;
							const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
							photoData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							
							// Get filename and contentType dynamically from binary data properties
							// Support both fileName/file and mimeType/mime properties
							// @ts-ignore - Type mismatch string | number
							filename = (binaryData.fileName || binaryData.file || 'photo.jpg') as string;
							// @ts-ignore - Type mismatch string | number
							contentType = (binaryData.mimeType || binaryData.mime || 'image/jpeg') as string;
							
							isMultipart = true;
						} else {
							photoData = this.getNodeParameter('photo', i) as string;
						}

						if (isMultipart) {
							const formData = new FormData();
							formData.append('chat_id', chatId);
							formData.append('photo', photoData, {
								filename: filename,
								contentType: contentType,
							});
							if (caption) {
								formData.append('caption', caption);
							}

							response = await makeRequestWithRetry(
								executeFunctions,
								`${baseUrl}/sendPhoto`,
								'POST',
								formData,
								true,
							);
						} else {
							const body: SendPhotoRequest = {
								chat_id: chatId,
								photo: photoData as string,
							};
							if (caption) {
								body.caption = caption;
							}

							// @ts-ignore - Type mismatch with IDataObject
							response = await makeRequestWithRetry(
								executeFunctions,
								`${baseUrl}/sendPhoto`,
								'POST',
								// @ts-ignore
								body,
							);
						}
					} else if (operation === 'sendSticker') {
						const chatId = this.getNodeParameter('chatId', i) as string;
						const stickerId = this.getNodeParameter('stickerId', i) as string;

						const body: SendStickerRequest = {
							chat_id: chatId,
							sticker_id: stickerId,
						};

						// @ts-ignore - Type mismatch with IDataObject
						response = await makeRequestWithRetry(
							executeFunctions,
							`${baseUrl}/sendSticker`,
							'POST',
							// @ts-ignore
							body,
						);
					} else if (operation === 'sendChatAction') {
						const chatId = this.getNodeParameter('chatId', i) as string;
						const action = this.getNodeParameter('action', i) as string;

						const body: SendChatActionRequest = {
							chat_id: chatId,
							action: action as SendChatActionRequest['action'],
						};

						// @ts-ignore - Type mismatch with IDataObject
						response = await makeRequestWithRetry(
							executeFunctions,
							`${baseUrl}/sendChatAction`,
							'POST',
							// @ts-ignore
							body,
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
						);
					}
				} else if (resource === 'bot') {
					if (operation === 'getMe') {
						response = await makeRequestWithRetry(
							executeFunctions,
							`${baseUrl}/getMe`,
							'GET',
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
						);
					}
				} else if (resource === 'webhook') {
					if (operation === 'getWebhookInfo') {
						response = await makeRequestWithRetry(
							executeFunctions,
							`${baseUrl}/getWebhookInfo`,
							'GET',
						);
					} else if (operation === 'setWebhook') {
						const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;
						const secretToken = this.getNodeParameter('secretToken', i) as string;

						const body: SetWebhookRequest = {
							url: webhookUrl,
							secret_token: secretToken,
						};

						// @ts-ignore - Type mismatch with IDataObject
						response = await makeRequestWithRetry(
							executeFunctions,
							`${baseUrl}/setWebhook`,
							'POST',
							// @ts-ignore
							body,
						);
					} else if (operation === 'deleteWebhook') {
						response = await makeRequestWithRetry(
							executeFunctions,
							`${baseUrl}/deleteWebhook`,
							'POST',
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
						);
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown resource: ${resource}`,
					);
				}

				if (!response.ok) {
					throw new NodeOperationError(
						this.getNode(),
						response.description || 'API request failed',
					);
				}

				returnData.push({
					json: response.result || response,
					pairedItem: {
						item: i,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}


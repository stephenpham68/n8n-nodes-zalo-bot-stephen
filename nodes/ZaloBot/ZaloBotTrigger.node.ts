import {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { ZaloApiResponse, ZaloUpdate, ZaloWebhookInfo, SetWebhookRequest } from './ZaloBotInterface';
import * as crypto from 'crypto';

export class ZaloBotTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zalo Bot Trigger',
		name: 'zaloBotTrigger',
		icon: 'file:zalo.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts workflow when Zalo Bot receives a message',
		defaults: {
			name: 'Zalo Bot Trigger',
		},
		inputs: [],
		outputs: ['main', 'main', 'main', 'main', 'main'],
		outputNames: ['Text Message', 'Photo Only', 'Photo + Message', 'Sticker', 'Unsupported/Other'],
		credentials: [
			{
				name: 'zaloApi',
				required: true,
			},
		],
		// @ts-ignore - smart webhook type not in base type definition
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
			{
				name: 'smart' as any,
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook-smart',
			},
		] as any,
		properties: [
			{
				displayName: 'Webhook Path',
				name: 'path',
				type: 'string',
				default: 'default',
				required: true,
				description: 'The path to listen for webhooks. This will be part of the webhook URL.',
			},
			{
				displayName: 'Register Automatically',
				name: 'registerAutomatically',
				type: 'boolean',
				default: true,
				description: 'Whether to automatically register/unregister the webhook with Zalo API. If disabled, you can manually copy the webhook URL and configure it in Zalo dashboard.',
			},
		],
	};

	// @ts-ignore - webhookMethods type mismatch with IWebhookFunctions vs IHookFunctions
	webhookMethods = {
		default: {
			async checkExists(this: IWebhookFunctions): Promise<boolean> {
				const registerAutomatically = (this.getNodeParameter('registerAutomatically', 0) ?? true) as boolean;

				// If registerAutomatically is false, always return false to allow manual registration
				if (!registerAutomatically) {
					return false;
				}

				const credentials = await this.getCredentials('zaloApi');
				const botToken = credentials.botToken as string;

				try {
					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: `https://bot-api.zaloplatforms.com/bot${botToken}/getWebhookInfo`,
						headers: {
							'Content-Type': 'application/json',
						},
					}) as ZaloApiResponse<ZaloWebhookInfo>;

					if (response.ok && response.result?.url) {
						const webhookUrl = this.getNodeWebhookUrl('default');
						return response.result.url === webhookUrl;
					}

					return false;
				} catch (error) {
					return false;
				}
			},

			async create(this: IWebhookFunctions): Promise<boolean> {
				const registerAutomatically = (this.getNodeParameter('registerAutomatically', 0) ?? true) as boolean;
				const webhookUrl = this.getNodeWebhookUrl('default');

				// Generate secret token (32-64 characters, alphanumeric + special chars)
				const secretToken = crypto
					.randomBytes(32)
					.toString('base64')
					.replace(/[^a-zA-Z0-9]/g, '')
					.substring(0, 48);

				// Store secret token in node state for validation
				const nodeState = this.getWorkflowStaticData('node');
				nodeState.secretToken = secretToken;

				// If registerAutomatically is false, skip API call and just return true
				if (!registerAutomatically) {
					return true;
				}

				const credentials = await this.getCredentials('zaloApi');
				const botToken = credentials.botToken as string;

				const body: SetWebhookRequest = {
					url: webhookUrl,
					secret_token: secretToken,
				};

				try {
					const response = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zaloplatforms.com/bot${botToken}/setWebhook`,
						headers: {
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					}) as ZaloApiResponse;

					if (!response.ok) {
						throw new NodeOperationError(
							this.getNode(),
							`Failed to set webhook: ${response.description || 'Unknown error'}`,
						);
					}

					return true;
				} catch (error) {
					if (error instanceof NodeOperationError) {
						throw error;
					}
					throw new NodeOperationError(
						this.getNode(),
						`Failed to set webhook: ${error.message || 'Unknown error'}`,
					);
				}
			},

			async delete(this: IWebhookFunctions): Promise<boolean> {
				const registerAutomatically = (this.getNodeParameter('registerAutomatically', 0) ?? true) as boolean;

				// If registerAutomatically is false, skip API call and just return true
				if (!registerAutomatically) {
					// Clear secret token from node state
					const nodeState = this.getWorkflowStaticData('node');
					delete nodeState.secretToken;
					return true;
				}

				const credentials = await this.getCredentials('zaloApi');
				const botToken = credentials.botToken as string;

				try {
					const response = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zaloplatforms.com/bot${botToken}/deleteWebhook`,
						headers: {
							'Content-Type': 'application/json',
						},
					}) as ZaloApiResponse;

					if (!response.ok) {
						throw new NodeOperationError(
							this.getNode(),
							`Failed to delete webhook: ${response.description || 'Unknown error'}`,
						);
					}

					// Clear secret token from node state
					const nodeState = this.getWorkflowStaticData('node');
					delete nodeState.secretToken;

					return true;
				} catch (error) {
					if (error instanceof NodeOperationError) {
						throw error;
					}
					throw new NodeOperationError(
						this.getNode(),
						`Failed to delete webhook: ${error.message || 'Unknown error'}`,
					);
				}
			},
		},
		smart: {
			async checkExists(this: IWebhookFunctions): Promise<boolean> {
				const registerAutomatically = (this.getNodeParameter('registerAutomatically', 0) ?? true) as boolean;

				// If registerAutomatically is false, always return false to allow manual registration
				if (!registerAutomatically) {
					return false;
				}

				const credentials = await this.getCredentials('zaloApi');
				const botToken = credentials.botToken as string;

				try {
					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: `https://bot-api.zaloplatforms.com/bot${botToken}/getWebhookInfo`,
						headers: {
							'Content-Type': 'application/json',
						},
					}) as ZaloApiResponse<ZaloWebhookInfo>;

					if (response.ok && response.result?.url) {
						const webhookUrl = this.getNodeWebhookUrl('smart' as any);
						return response.result.url === webhookUrl;
					}

					return false;
				} catch (error) {
					return false;
				}
			},

			async create(this: IWebhookFunctions): Promise<boolean> {
				const registerAutomatically = (this.getNodeParameter('registerAutomatically', 0) ?? true) as boolean;
				const webhookUrl = this.getNodeWebhookUrl('smart' as any);

				// Generate secret token (32-64 characters, alphanumeric + special chars)
				const secretToken = crypto
					.randomBytes(32)
					.toString('base64')
					.replace(/[^a-zA-Z0-9]/g, '')
					.substring(0, 48);

				// Store secret token in node state for validation
				const nodeState = this.getWorkflowStaticData('node');
				nodeState.secretToken = secretToken;

				// If registerAutomatically is false, skip API call and just return true
				if (!registerAutomatically) {
					return true;
				}

				const credentials = await this.getCredentials('zaloApi');
				const botToken = credentials.botToken as string;

				const body: SetWebhookRequest = {
					url: webhookUrl,
					secret_token: secretToken,
				};

				try {
					const response = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zaloplatforms.com/bot${botToken}/setWebhook`,
						headers: {
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					}) as ZaloApiResponse;

					if (!response.ok) {
						throw new NodeOperationError(
							this.getNode(),
							`Failed to set webhook: ${response.description || 'Unknown error'}`,
						);
					}

					return true;
				} catch (error) {
					if (error instanceof NodeOperationError) {
						throw error;
					}
					throw new NodeOperationError(
						this.getNode(),
						`Failed to set webhook: ${error.message || 'Unknown error'}`,
					);
				}
			},

			async delete(this: IWebhookFunctions): Promise<boolean> {
				const registerAutomatically = (this.getNodeParameter('registerAutomatically', 0) ?? true) as boolean;

				// If registerAutomatically is false, skip API call and just return true
				if (!registerAutomatically) {
					// Clear secret token from node state
					const nodeState = this.getWorkflowStaticData('node');
					delete nodeState.secretToken;
					return true;
				}

				const credentials = await this.getCredentials('zaloApi');
				const botToken = credentials.botToken as string;

				try {
					const response = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zaloplatforms.com/bot${botToken}/deleteWebhook`,
						headers: {
							'Content-Type': 'application/json',
						},
					}) as ZaloApiResponse;

					if (!response.ok) {
						throw new NodeOperationError(
							this.getNode(),
							`Failed to delete webhook: ${response.description || 'Unknown error'}`,
						);
					}

					// Clear secret token from node state
					const nodeState = this.getWorkflowStaticData('node');
					delete nodeState.secretToken;

					return true;
				} catch (error) {
					if (error instanceof NodeOperationError) {
						throw error;
					}
					throw new NodeOperationError(
						this.getNode(),
						`Failed to delete webhook: ${error.message || 'Unknown error'}`,
					);
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const headers = this.getHeaderData();
		const body = this.getBodyData();

		// Determine which webhook was called by checking the request path
		const requestUrl = req.url || '';
		const isSmartWebhook = requestUrl.includes('webhook-smart');

		// Validate secret token from header
		const nodeState = this.getWorkflowStaticData('node');
		const expectedSecretToken = nodeState.secretToken as string | undefined;

		if (expectedSecretToken) {
			const receivedSecretToken = headers['x-bot-api-secret-token'] as string | undefined;

			if (!receivedSecretToken) {
				throw new NodeOperationError(
					this.getNode(),
					'Missing secret token in webhook request',
				);
			}

			// Use timing-safe comparison to prevent timing attacks
			// Convert strings to Buffers for timingSafeEqual
			const expectedBuffer = Buffer.from(expectedSecretToken, 'utf8');
			const receivedBuffer = Buffer.from(receivedSecretToken, 'utf8');

			// timingSafeEqual requires buffers of equal length
			if (expectedBuffer.length !== receivedBuffer.length) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid secret token in webhook request',
				);
			}

			if (!crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid secret token in webhook request',
				);
			}
		}

		// Parse incoming body
		let payload: any;
		
		if (typeof body === 'object' && body !== null) {
			payload = body;
		} else if (typeof body === 'string') {
			try {
				payload = JSON.parse(body);
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid JSON in webhook body',
				);
			}
		} else {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid webhook body format',
			);
		}

		// Handle default webhook (single output, existing behavior)
		if (!isSmartWebhook) {
			const update = payload as unknown as ZaloUpdate;
			return {
				workflowData: [
					[
						{
							json: update as any,
						},
					],
				],
			};
		}

		// Handle smart webhook (5 outputs with routing logic)
		// Extract event_name and message from payload
		const eventName = payload?.event_name as string | undefined;
		const message = payload?.message || {};
		const caption = message?.caption as string | undefined;

		// Determine output index based on event type and message content
		let outputIndex = 4; // Default to Unsupported/Other

		if (eventName === 'message.text.received') {
			outputIndex = 0; // Text Message
		} else if (eventName === 'message.image.received') {
			// Check if caption exists and has content
			// Handle empty string, null, undefined, or whitespace-only strings
			if (caption && typeof caption === 'string' && caption.trim().length > 0) {
				outputIndex = 2; // Photo + Message
			} else {
				outputIndex = 1; // Photo Only
			}
		} else if (eventName === 'message.sticker.received') {
			outputIndex = 3; // Sticker
		} else if (eventName === 'message.unsupported.received') {
			outputIndex = 4; // Unsupported/Other
		}
		// else: outputIndex remains 4 (Unsupported/Other)

		// Create output arrays (5 outputs)
		const outputData: any[][] = [[], [], [], [], []];

		// Place data in the correct output index
		outputData[outputIndex].push({
			json: payload,
		});

		return {
			workflowData: outputData,
		};
	}
}


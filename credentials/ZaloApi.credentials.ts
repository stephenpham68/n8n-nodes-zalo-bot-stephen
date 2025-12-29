import {
	ICredentialType,
	INodeProperties,
	IHttpRequestOptions,
	ICredentialsDecrypted,
	ICredentialDataDecryptedObject,
	INodeCredentialTestRequest,
	INodeCredentialTestResult,
} from 'n8n-workflow';

export class ZaloApi implements ICredentialType {
	name = 'zaloApi';

	displayName = 'Zalo Bot API';

	documentationUrl = 'https://bot.zaloplatforms.com/docs/';

	properties: INodeProperties[] = [
		{
			displayName: 'Bot Token',
			name: 'botToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Zalo Bot API token',
		},
	];


	// @ts-ignore - test method signature mismatch with ICredentialType interface
	async test(this: INodeCredentialTestRequest, credentials: ICredentialsDecrypted): Promise<INodeCredentialTestResult> {
		const botToken = (credentials.data as any)?.botToken as string;

		if (!botToken) {
			return {
				status: 'Error',
				message: 'Bot Token is required',
			};
		}

		const options: IHttpRequestOptions = {
			url: `https://bot-api.zaloplatforms.com/bot${botToken}/getMe`,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		};

		try {
			// @ts-ignore - helpers property exists at runtime
			const response = await this.helpers.httpRequest(options);
			
			if (response.ok) {
				return {
					status: 'OK',
					message: 'Authentication successful',
				};
			} else {
				return {
					status: 'Error',
					message: response.description || 'Authentication failed',
				};
			}
		} catch (error: any) {
			return {
				status: 'Error',
				message: error?.message || 'Failed to authenticate',
			};
		}
	}
}


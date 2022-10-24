<svelte:options tag="oda-ui" />

<script>
	//svelte
	import { onMount, tick } from "svelte";

	import "./lib/sdk/web-sdk.js";

	//Global
	let isMounted = false;
	let Bots;
	let isClientAuthEnabled = false;
	/**
	 * SDK configuration settings
	 *
	 * Other than URI, all fields are optional with two exceptions for auth modes:
	 *
	 * In client auth disabled mode, 'channelId' must be passed, 'userId' is optional
	 * In client auth enabled mode, 'clientAuthEnabled: true' must be passed
	 */
	const chatWidgetSettings = {
        URI: 'fbda2-fishbowl.botmxp.ocp.oraclecloud.com',                               // ODA URI, only the hostname part should be passed, without the https://
        clientAuthEnabled: isClientAuthEnabled,     // Enables client auth enabled mode of connection if set true, no need to pass if set false
        channelId: '65c0abf0-546d-4fbf-ab46-0c349313a749',                   // Channel ID, available in channel settings in ODA UI, optional if client auth enabled
		enableHeadless: true,
		userId: 'sim',                      // User ID, optional field to personalize user experience
        enableAutocomplete: true,                   // Enables autocomplete suggestions on user input
        enableBotAudioResponse: true,               // Enables audio utterance of skill responses
        enableClearMessage: true,                   // Enables display of button to clear conversation
        enableSpeech: true,                         // Enables voice recognition
        showConnectionStatus: true,                 // Displays current connection status on the header
        i18n: {                                     // Provide translations for the strings used in the widget
            en: {                                   // en locale, can be configured for any locale
                chatTitle: 'Oracle Assistant'       // Set title at chat header
            }
        },
        timestampMode: 'relative',                  // Sets the timestamp mode, relative to current time or default (absolute)
        theme: window.WebSDK.THEME.REDWOOD_DARK,           // Redwood dark theme. The default is THEME.DEFAULT, while older theme is available as THEME.CLASSIC
        icons: {
            logo: null,
            avatarAgent: '<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32"><path fill="black" d="M12 2c5.523 0 10 4.477 10 10a9.982 9.982 0 01-3.804 7.85L18 20a9.952 9.952 0 01-6 2C6.477 22 2 17.523 2 12S6.477 2 12 2zm2 16h-4a2 2 0 00-1.766 1.06c1.123.6 2.405.94 3.766.94s2.643-.34 3.765-.94a1.997 1.997 0 00-1.616-1.055zM12 4a8 8 0 00-5.404 13.9A3.996 3.996 0 019.8 16.004L10 16h4c1.438 0 2.7.76 3.404 1.899A8 8 0 0012 4zm0 2c2.206 0 4 1.794 4 4s-1.794 4-4 4-4-1.794-4-4 1.794-4 4-4zm0 2c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z" fill="#100f0e" fill-rule="evenodd"/></svg>',
            avatarUser: '<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32"><path fill="black" d="M12 2c5.523 0 10 4.477 10 10a9.982 9.982 0 01-3.804 7.85L18 20a9.952 9.952 0 01-6 2C6.477 22 2 17.523 2 12S6.477 2 12 2zm2 16h-4a2 2 0 00-1.766 1.06c1.123.6 2.405.94 3.766.94s2.643-.34 3.765-.94a1.997 1.997 0 00-1.616-1.055zM12 4a8 8 0 00-5.404 13.9A3.996 3.996 0 019.8 16.004L10 16h4c1.438 0 2.7.76 3.404 1.899A8 8 0 0012 4zm0 2c2.206 0 4 1.794 4 4s-1.794 4-4 4-4-1.794-4-4 1.794-4 4-4zm0 2c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z" fill="#100f0e" fill-rule="evenodd"/></svg>',
            avatarBot: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none"><path d="M0 0h36v36H0V0z" fill="#C74634"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.875 8.625a2.25 2.25 0 00-2.25 2.25v16c0 .621.504 1.125 1.125 1.125h.284c.298 0 .585-.119.796-.33l2.761-2.76a2.25 2.25 0 011.59-.66h15.944a2.25 2.25 0 002.25-2.25V10.875a2.25 2.25 0 00-2.25-2.25H7.875zM24.75 18a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm-4.5-2.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-9 2.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" fill="#fff"/></svg>'
        }
    };
	
	
	/**
	 *
	 */
	onMount(async () => {
		initBot();
	});

	/**
	 * Function to generate JWT tokens. It returns a Promise to provide tokens.
	 * The function is passed to SDK which uses it to fetch token whenever it needs
	 * to establish connections to chat server
	 *
	 * @returns {Promise} Promise to provide a signed JWT token
	 */
	function generateToken() {
		return new Promise(function(resolve) {
			mockApiCall('https://mockurl').then(function(token) {
				resolve(token);
			});
		});
	}

	/**
	 * A function mocking an endpoint call to backend to provide authentication token
	 * The recommended behaviour is fetching the token from backend server
	 *
	 * @returns {Promise} Promise to provide a signed JWT token
	 */
	function mockApiCall() {
		return new Promise(function(resolve) {
			setTimeout(function() {
				const now = Math.floor(Date.now() / 1000);
				const payload = {
					iat: now,
					exp: now + 3600,
					channelId: '<channelID>',
					userId: '<userID>'
				};
				const SECRET = '<channel-secret>';

				// An unimplemented function generating signed JWT token with given header, payload, and signature
				const token = generateJWTToken({ alg: 'HS256', typ: 'JWT' }, payload, SECRET);
				resolve(token);
			}, Math.floor(Math.random() * 1000) + 1000);
		});
	}

	/**
	 * Unimplemented function to generate signed JWT token. Should be replaced with
	 * actual method to generate the token on the server.
	 *
	 * @param {object} header
	 * @param {object} payload
	 * @param {string} signature
	 */
	function generateJWTToken(header, payload, signature) {
		throw new Error('Method not implemented.');
	}


	/**
	 * initBot
	*/
	function initBot() {
		console.log('[initBot]')
		// Initialize SDK
		if (isClientAuthEnabled) {
			Bots = new window.WebSDK(chatWidgetSettings, generateToken);
		} else {
			Bots = new window.WebSDK(chatWidgetSettings);
		}

		let isFirstConnection = true;
		//Bots.on(window.WebSDK.EVENT.WIDGET_OPENED, () => {
			console.info('[Connecting...]')
			if (isFirstConnection) {
				Bots.connect().then(() => {
					console.log('[Connection Successful]');
					Bots.sendMessage('hi');
				}).catch((reason) => {
					console.log('[Connection failed]');
					console.log(reason);
				});

				Bots.on('message:received', (msg) => {
					console.log('msg',msg);

				});

				Bots.on('networkstatuschange', (state) => {
					const deineState = [
						'Connecting',
						'Open',
						'Closing',
						'Closed',
					] 
					console.info('[Connection State]',`[${deineState[state]}][${state}]`)
				});

				isFirstConnection = false;
			}
		//});

		window['Bots'] = Bots;
	}

</script>

<!-- Wrapper -->
<section>
	<article>
		<div class="container mx-auto">
			<div class="max-w-2xl border rounded">
			  <div>
				<div class="w-full">
				  <div class="relative flex items-center p-3 border-b border-gray-300">
					<img class="object-cover w-10 h-10 rounded-full"
					  src="https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg" alt="username" />
					<span class="block ml-2 font-bold text-gray-600">Emma</span>
					<span class="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3">
					</span>
				  </div>
				  <div class="relative w-full p-6 overflow-y-auto h-[40rem]">
	  
					<ul class="space-y-2">
					  <li class="flex justify-start">
						<div class="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
						  <span class="block">Hi</span>
						</div>
					  </li>
					  <li class="flex justify-end">
						<div class="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
						  <span class="block">Hiiii</span>
						</div>
					  </li>
					  <li class="flex justify-end">
						<div class="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
						  <span class="block">how are you?</span>
						</div>
					  </li>
					  <li class="flex justify-start">
						<div class="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
						  <span class="block">Lorem ipsum dolor sit, amet consectetur adipisicing elit. </span>
						</div>
					  </li>
					</ul>
	  
				  </div>
	  
				  <div class="flex items-center justify-between w-full p-3 border-t border-gray-300">
	  
					<button>
					  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24"
						stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					  </svg>
					</button>
					<button>
					  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24"
						stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
					  </svg>
					</button>
	  
					<input type="text" placeholder="Message"
					  class="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
					  name="message" required />
					<button>
					  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24"
						stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
					  </svg>
					</button>
					<button type="submit">
					  <svg class="w-5 h-5 text-gray-500 origin-center transform rotate-90" xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20" fill="currentColor">
						<path
						  d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
					  </svg>
					</button>
				  </div>
				</div>
			  </div>
			</div>
		  </div>

	</article>
</section>

<!-- xWrapper -->
<style>
	
</style>

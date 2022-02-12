// todo: is there anything we can do to bypass CORS here?

// bypass content security policy altogether
chrome.webRequest.onHeadersReceived.addListener((details) => {
	const headers = details.responseHeaders;
	const idx = headers.findIndex((header) => header.name === 'content-security-policy');

	if (idx >= 0) {
		headers.splice(idx, 1);
	}

	return { responseHeaders: headers };
}, {
	urls: [
		'*://*.discord.com/*'
	]
}, ['blocking', 'responseHeaders']);

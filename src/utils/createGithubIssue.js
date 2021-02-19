export function createGithubIssue(options = {}) {
	let repoUrl;
	if (options.repoUrl) {
		repoUrl = options.repoUrl;
	} else if (options.user && options.repo) {
		repoUrl = `https://github.com/${options.user}/${options.repo}`;
	} else {
		throw new Error('You need to specify either the `repoUrl` option or both the `user` and `repo` options');
	}

	const url = new URL(`${repoUrl}/issues/new`);

	const types = [
		'body',
		'title',
		'labels',
		'template',
		'milestone',
		'assignee',
		'projects'
	];

	for (const type of types) {
		let value = options[type];
		if (value === undefined) {
			continue;
		}

		if (type === 'labels' || type === 'projects') {
			if (!Array.isArray(value)) {
				throw new TypeError(`The \`${type}\` option should be an array`);
			}

			value = value.join(',');
		}

		url.searchParams.set(type, value);
	}

	return url.toString();
};


// const url = newGithubIssueUrl({
// 	user: 'open-wc',
// 	repo: 'custom-elements-manifest',
// 	body: '\n\n\n---\nI\'m a human. Please be nice.'
// });
// //=> 'https://github.com/sindresorhus/new-github-issue-url/issues/new?body=%0A%0A%0A---%0AI%27m+a+human.+Please+be+nice.'

const zipFileName = 'extension.zip';
module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		webstore_upload: { // eslint-disable-line
			accounts: {
				default: {
					cli_auth: true, // eslint-disable-line
					publish: true,
					client_id: process.env.CLIENT_ID, // eslint-disable-line
					client_secret: process.env.CLIENT_SECRET, // eslint-disable-line
					refresh_token: process.env.REFRESH_TOKEN // eslint-disable-line
				}
			},
			extensions: {
				refinedGitHub: {
					appID: 'hlepfoohegkhhmjieoechaddaejaokhf', // App ID from chrome webstore
					publish: true,
					zip: zipFileName
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-webstore-upload');
	grunt.registerTask('default', ['webstore_upload']);
};

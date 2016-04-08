var zipFileName = 'extension.zip';
module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		webstoreUpload: {
			accounts: {
				default: {
					cli_auth: true,
					publish: true,
					client_id: process.env.CLIENT_ID,
					client_secret: process.env.CLIENT_SECRET,
					refresh_token: process.env.REFRESH_TOKEN
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
	grunt.registerTask('default', ['webstoreUpload']);
};

module.exports = {
	apps: [
		{
			name: "growkapital-admin",
			script: ".next/standalone/server.js",
			cwd: "/var/www/growkapital/admin",
			env: {
				NODE_ENV: "production",
				PORT: 3003,
				NEXT_PUBLIC_API_URL: "https://kredit.my",
				NEXT_PUBLIC_SITE_URL: "https://admin.kredit.my",
			},
			instances: 1,
			exec_mode: "fork",
			max_memory_restart: "1G",
			error_file: "/root/.pm2/logs/growkapital-admin-error.log",
			out_file: "/root/.pm2/logs/growkapital-admin-out.log",
			log_file: "/root/.pm2/logs/growkapital-admin.log",
			time: true,
		},
	],
};

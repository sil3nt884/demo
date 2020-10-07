const chokidar = require('chokidar');
const config = require('./config')
const fs = require('fs')

const dirToWatch = config.getConfig().dirToWatch

chokidar.watch(dirToWatch, { awaitWriteFinish: true }).on('all', (event, path) => {
	  if(path.endsWith('.start')) {
			fs.writeFileSync(
					`${dirToWatch}/${new Date().toISOString().substring(0, 13)}-job.txt`, `${new Date().toISOString().substring(0, 13)}`)
		}
});

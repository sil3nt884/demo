const chokidar = require('chokidar');
const config = require('../config')
const fs = require('fs')

const dirToWatch = config.getConfig().dirToWatch

chokidar.watch(dirToWatch, { awaitWriteFinish: true }).on('all', (event, path) => {
	  if(path.includes('start')) {
		   try {
		   	   const date = path
				   .replace(dirToWatch, '')
				   .replace('\\', '')
				   .substring(0, 13)
			   fs.writeFileSync(
				   `${dirToWatch}/${date}-job.txt`, ``, {flag: 'wx'})
		   } catch (e) {
				console.log('job already exist did not create new job')
		   }}
});

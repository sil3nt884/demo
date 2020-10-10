const fs = require('fs')
const yaml = require('js-yaml')


const config = () => {
	let loadedYaml;
	const loadYaml = () => {
		return yaml.safeLoad(fs.readFileSync('src/config.yaml'))
	}
	return {
		 getConfig : () => {
		 	  if(!loadedYaml) {
		 	  	loadedYaml = loadYaml()
				}
		 	  return loadedYaml
		 }
	}
}


module.exports = config()

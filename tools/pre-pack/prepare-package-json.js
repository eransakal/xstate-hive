import {readFileSync, writeFileSync} from 'fs'
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
delete packageJson.devDependencies
delete packageJson.scripts
writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

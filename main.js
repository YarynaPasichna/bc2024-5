const {express} = require('express')
const { program } = require('commander');


program
    .requiredOption('-h, --host <host>', 'Address of the server')
    .requiredOption('-p, --port <port>', 'Port of the server')
    .requiredOption('-c, --cache <cachePath>', 'Path to the directory for cached files')
    .parse(process.argv);

const options = program.opts();
const app = express();

app.listen(options.port, options.host, () => {
    console.log(`Server is running at http://${options.host}:${options.port}`);
    console.log(`Cache directory: ${options.cache}`);
});
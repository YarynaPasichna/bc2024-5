const express = require('express');
const { program } = require('commander');
const path = require('path');

const app = express();
program
    .requiredOption('-h, --host <host>', 'Address of the server')
    .requiredOption('-p, --port <port>', 'Port of the server')
    .requiredOption('-c, --cache <cachePath>', 'Path to the directory for cached files')
    .parse(process.argv);

const options = program.opts();
if (!options.host || !options.port || !options.cache) {
    console.error("Не вказані обов'язкові параметри");
    process.exit(1);
}

let notes = {};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/notes/:name', (req, res) => {
    const name = req.params.name;
    const note = notes[name];
    if (note) {
        res.status(200).send(note.text);
    } else {
        res.status(404).send('Note not found');
    }
});

app.put('/notes/:name', (req, res) => {
    const name = req.params.name;
    const newText = req.body.text;
    const note = notes[name];
    if (note) {
        note.text = newText;
        res.status(200).send(`${name} was successfully updated`);
    } else {
        res.status(404).send('Note not found');
    }
});

app.delete('/notes/:name', (req, res) => {
    const name = req.params.name;
    const note = notes[name];
    if (note) {
        delete notes[name];
        res.status(200).send(`Note ${name} deleted`);
    } else {
        res.status(404).send('Note not found');
    }
});

app.get('/notes', (req, res) => {
    const result = Object.entries(notes).map(([name, { text }]) => ({ name, text }));
    res.status(200).json(result);
});

app.post('/write', (req, res) => {
    const { note_name, note } = req.body;
    if (notes[note_name]) {
        return res.status(400).json({ message: 'Note with this name already exists' });
    } else {
        notes[note_name] = { text: note };
        res.status(201).json({ message: `${note_name} was successfully created` });
    }
});

// Serve UploadForm.html as a static file
app.get('/UploadForm.html', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'UploadForm.html'));
});

app.listen(options.port, options.host, () => {
    console.log(`Server is running at http://${options.host}:${options.port}`);
    console.log(`Cache directory: ${options.cache}`);
});

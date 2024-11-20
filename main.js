const express = require('express');
const { program } = require('commander');
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let notes = {};

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
        res.status(200).send(`Note ${name} was successfully updated`);
    } else {
        res.status(404).send('Note not found');
    }
});

app.delete('/notes/:name', (req, res) => {
    const name = req.params.name;
    if (notes[name]) {
        delete notes[name];
        res.status(200).send(`Note ${name} deleted`);
    } else {
        res.status(404).send('Note not found');
    }
});

app.get('/notes', (req, res) => {
    const result = Object.entries(notes).map(([name, note]) => ({
        name,
        text: note.text,
    }));
    res.status(200).json(result);
});

app.post('/write', (req, res) => {
    const { note_name, note } = req.body;
    if (notes[note_name]) {
        return res.status(400).json({ message: 'Note with this name already exists' });
    }
    notes[note_name] = { text: note };
    res.status(201).json({ message: `Note ${note_name} was successfully created` });
});

app.get('/UploadForm.html', (req, res) => {
    const upload_form = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Upload Note</title>
        </head>
        <body>
            <h2>Upload Form</h2>
            <form method="post" action="/write" enctype="application/x-www-form-urlencoded">
                <label for="note_name_input">Note Name:</label><br>
                <input type="text" id="note_name_input" name="note_name"><br><br>
                <label for="note_input">Note:</label><br>
                <textarea id="note_input" name="note" rows="4" cols="50"></textarea><br><br>
                <button type="submit">Upload</button>
            </form>
            <p>
                If you click the "Upload" button, the form-data will be sent to the
                "/write" endpoint.
            </p>
        </body>
        </html>
    `;
    res.status(200).send(upload_form);
});
app.listen(options.port, options.host, () => {
    console.log(`Server is running at http://${options.host}:${options.port}`);
    console.log(`Cache directory: ${options.cache}`);
});


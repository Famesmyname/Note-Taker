// define all dependencies
const express = require('express');
const path = require('path');
const util = require('util');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use(express.static('public'));

//set up fs for asynchronous read and write
const fsRead = util.promisify(fs.readFile);
const fsWrite = util.promisify(fs.writeFile);


//GET request to show all notes
app.get('/api/notes', (req, res) => {
    fsRead('./db/db.json', 'utf8')
    .then(function(data) {
        let notes = [].concat(JSON.parse(data));
        res.json(notes)
    })
});

//POST request to add a note
app.post('/api/notes', (req, res) => {
    const note = req.body
    fsRead('./db/db.json', 'utf8')
    .then(function(data) {
        let notes = [].concat(JSON.parse(data));
        note.id = notes.length + 1
        notes.push(note);
        return notes
    })
    .then(function(notes) {
        fsWrite('./db/db.json', JSON.stringify(notes))
        res.json(note);
    })
});

//DELETE request 
app.delete('/api/notes/:id', (req, res) => {
    const targetID = parseInt(req.params.id)
    fsRead('./db/db.json', 'utf8')
    .then(function(data){
        const notes = [].concat(JSON.parse(data));
        const newNotes = [];
        for (let i = 0; i<notes.length; i++) {
            if (targetID !== notes[i].id) {
                newNotes.push(notes[i])
            }
        }
        return newNotes
    })
    .then(function(notes) {
        fsWrite('./db/db.json', JSON.stringify(notes))
        res.send(`Note # ${targetID} was removed.`)
    })
});

//HTML
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
})

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
})

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 💌🙂`)
);

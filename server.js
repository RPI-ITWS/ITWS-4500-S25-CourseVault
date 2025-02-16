// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const dummyData = require('./DummyDisplay.json');
const dummyWork = path.join(__dirname, 'assignments');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/AssignmentsStored', (req, res) => {
    res.json(dummyData);
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(dummyWork, filename);
    
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.status(404).send('File not found');
    }
});

if (!fs.existsSync(dummyWork)) {
    console.error(`Error: Directory ${dummyWork} does not exist`);
    process.exit(1);
}

app.listen(port, () => {
    console.log('Listening on *:3000');
    console.log(`Serving assignments from: ${dummyWork}`);
});
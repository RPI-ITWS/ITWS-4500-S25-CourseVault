const express = require('express');
const fs = require('fs');
const path = require('path');
const dummyData = require('./DummyDisplay.json');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/AssignmentsStored', (req, res) => {
    res.json(dummyData);
});

app.listen(port, () => {
    console.log('Listening on *:3000');
});
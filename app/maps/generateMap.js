const express = require('express');
const router = express.Router();
const db = require('../db');

// const ref = await db.collection('retailer').add(retailer)
//   console.log(ref.id)
//   const documentRef = db.collection('retailer').doc(ref.id)
//   const userRef = await db.collection('users').doc(uid).set({
//     username: retailer['username'],
//     ref: documentRef
//   })
// var addDoc = db
//     .collection('users')
//     .add({
//       name: 'Tokyo',
//       country: 'Japan'
//     })
//     .then(ref => {
//       console.log('Added document with ID: ', ref.id);
//     });

router.post('/get-map', async (req, res) => {
  const tiles = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 13, 1, 7, 8, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 10, 13, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 6, 8, 1031, 8, 0, 0, 0, 0, 0],
    [0, 0, 0, 6, 9, 6, 9, 0, 0, 0, 0, 0, 0],
    [0, 0, 6, 9, 6, 9, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 9, 6, 9, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 14, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

  const direction = 'NORTH';
  const position = [120, 360];
  const begin_position = [80, 360];
  const walkIndex = 0;

  const player = { direction, position, begin_position, walkIndex };

  return res.status(200).json({ tiles, player });
});

router.get('/catagory', async (req, res) => {
  console.log('123');
  return res.send('LOLLL');
});

module.exports = router;

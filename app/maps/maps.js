import { get_map } from './generate_map';

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
  const maps = get_map({ commandlength: 7 });

  const { player, ...tiles } = maps;

  // console.log(JSON.stringify(tiles));
  return res.status(200).json({ tiles, player });
});

router.get('/catagory', async (req, res) => {
  console.log('123');
  return res.send('LOLLL');
});

module.exports = router;

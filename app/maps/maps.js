import { get_map } from './generate_map';
import { if_else_path_condition_commands_with_loop } from './decisionMakingCommands';

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
  console.log(req.body.level);
  const documentRef = await db
    .collection('maps')
    .doc(req.body.level.toString())
    .get();
  const data = documentRef.data();

  const maps = get_map(data);

  const { player, blocks, ...tiles } = maps;

  return res.status(200).json({ tiles, player, blocks });
});

router.post('/testtest', async (req, res) => {
  const data = {
    condition_type: 'nested_if',
    condition_cate: 'path',
    number_of_iterations: 8
  };

  const commands = if_else_path_condition_commands_with_loop(data);

  const maps = get_map(data);
  // return res.status(200).json(commands);
  return res.status(200).json(maps);
});

router.get('/catagory', async (req, res) => {
  console.log('123');
  return res.send('LOLLL');
});

module.exports = router;

require('dotenv').config();
import { xxx } from './test2';

const app = require('./app');
const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
  console.log('Express server listening on port ' + port);
});

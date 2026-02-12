import { app } from './express-server/main';

const host = 'localhost';
const port = 3333;

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

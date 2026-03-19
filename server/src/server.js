import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL || '(not set)'}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '***set***' : '(NOT SET — DB will fail!)'}`);
});

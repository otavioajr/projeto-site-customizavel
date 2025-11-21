try {
  const cors = require('cors');
  console.log('Type of cors:', typeof cors);
  console.log('Value of cors:', cors);
} catch (e) {
  console.error('Error requiring cors:', e);
}

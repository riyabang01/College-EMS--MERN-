const bcrypt = require('bcryptjs');

const generateHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`Bcrypt hash for password "${password}": ${hash}`);
};

generateHash('123456'); // Replace 'yourpassword' with the actual password you want to hash
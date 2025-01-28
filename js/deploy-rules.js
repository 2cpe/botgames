const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Read rules from JSON file
const rules = JSON.parse(fs.readFileSync('./firestore.rules.json', 'utf8'));

// Deploy rules
admin.firestore().setRules(rules)
  .then(() => {
    console.log('Rules deployed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error deploying rules:', error);
    process.exit(1);
  }); 
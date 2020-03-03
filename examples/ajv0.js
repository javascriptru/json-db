// Simple validation
let db = require('../test/fixtures/db.json');
let schemas = require('../test/fixtures/schemas.js');
const Ajv = require('ajv');

let ajv = new Ajv({
  schemas: schemas,
  allErrors: true,
  verbose: true
});

let validate = ajv.getSchema(`category`);

if (!validate({
  id: 'test'
})) {
  console.error(validate.errors);
}

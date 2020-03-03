const Db = require('../');
const path = require('path');

describe("Db", function() {
  it("validates all", function() {
    const db = new Db({
      dataPath: path.resolve(__dirname, 'fixtures/db.json'),
      schemasPath: path.resolve(__dirname, 'fixtures/schemas.js')
    });

    db.validateAll();
  });
});

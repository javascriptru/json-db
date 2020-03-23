const path = require('path');
const fs = require('fs');
const Ajv = require('ajv');
const pluralize = require('pluralize');
const transliterate = require('@javascriptru/transliterate');
const uuid = require('uuid/v4');

module.exports = class Db {

  constructor({dataPath, schemasPath}) {
    this.filePath = dataPath;
    let schemas = require(schemasPath);
    this.ajv = new Ajv({
      schemas,
      allErrors: true,
      // verbose: true
    });
  }

  getAll() {
    return this.data;
  }

  get(key) {
    return this.data[key];
  }

  getById(collection, id) {
    collection = this.data[collection];
    if (Array.isArray(collection)) {
      return collection.find(item => item.id == id);
    }
  }

  set(key, value) {
    this.data[key] = value;
  }

  update(key, value) {
    Object.assign(this.data[key], value);
  }

  load() {
    if (!fs.existsSync(this.filePath)) {
      this.data = {};
      return;
    }
    this.data = this.deserialize(fs.readFileSync(this.filePath, 'utf-8'));
  }

  save() {
    fs.writeFileSync(this.filePath, this.serialize(this.data));
  }

  deserialize(json) {
    return JSON.parse(json, (key, value) => {
      if (key === 'createdAt' || key === 'modifiedAt') {
        return new Date(value);
      } else {
        return value;
      }
    });
  }

  serialize(json) {
    return JSON.stringify(json, null, 2);
  }

  // product/db/...
  getValidate(name) {
    return this.ajv.getSchema(name);
  }

  validateAll() {
    // fixme
    let validate = this.ajv.getSchema('db');
    if (!validate({db: this.data})) {
      console.error(validate.errors);
      throw new Error("Validation error");
    }
  }

  // autogenerate id
  createId(collection, resource) {
    if (resource.title) {
      return transliterate(newResource.title);
    } else {
      return uuid();
    }
  }

  // returns a function that gets required field from value, including subfields
  // getter = createGetter('category')
  // getter(product) // gets product.category
  // getter = createGetter('category.name')
  // getter(product) // gets product.category.name (finds category in db)
  createGetter(field) {
    // category.name -> ['category','name']
    const parts = field.split('.');

    return value => {
      for (let i = 0; i < parts.length; i++) {
        value = value[parts[i]]; // from product -> get product.category (id)
        if (value === undefined) return undefined;
        if (i < parts.length - 1) {
          // we have category id, let's get category instead
          let collection = this.get(pluralize(parts[i]));
          value = collection.find(v => v.id == value);
        }
      }
      return value;
    };

  }

}

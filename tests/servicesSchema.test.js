const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

describe('services.json schema validation', () => {
  test('all entries match schema and have no duplicates', () => {
    const schemaPath = path.resolve(__dirname, '../service.schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const dataPath = path.resolve(__dirname, '../services.json');
    const services = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);

    const names = new Set();
    const urls = new Set();
    const errors = [];

    services.forEach((service, idx) => {
      if (!validate(service)) {
        errors.push(
          `Service at index ${idx} failed validation: ${ajv.errorsText(validate.errors)}`
        );
      }
      if (names.has(service.name)) {
        errors.push(`Duplicate name: ${service.name}`);
      } else {
        names.add(service.name);
      }
      if (urls.has(service.url)) {
        errors.push(`Duplicate url: ${service.url}`);
      } else {
        urls.add(service.url);
      }
    });

    if (errors.length) {
      throw new Error(errors.join('\n'));
    }
  });
});

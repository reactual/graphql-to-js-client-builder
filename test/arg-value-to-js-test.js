import assert from 'assert';
import {parse} from 'graphql/language';
import generate from 'babel-generator';
import * as t from 'babel-types';
import argValueToJS from '../src/arg-value-to-js';

suite('arg-value-to-js', () => {
  const config = {
    clientVar: t.identifier('client'),
    variablesVar: t.identifier('variables')
  };

  test('it can convert string values', () => {
    const query = '{field(var: "value")}';
    const valueAst = parse(query).definitions[0].selectionSet.selections[0].arguments[0].value;
    const jsAst = argValueToJS(valueAst, '__defaultOperation__', config);

    assert.equal(generate(jsAst).code, '"value"');
  });

  test('it can convert enum values', () => {
    const query = '{field(var: VALUE)}';
    const valueAst = parse(query).definitions[0].selectionSet.selections[0].arguments[0].value;
    const jsAst = argValueToJS(valueAst, '__defaultOperation__', config);

    assert.equal(generate(jsAst).code, 'client.enum("VALUE")');
  });

  test('it can convert int values', () => {
    const query = '{field(var: 1)}';
    const valueAst = parse(query).definitions[0].selectionSet.selections[0].arguments[0].value;
    const jsAst = argValueToJS(valueAst, '__defaultOperation__', config);

    assert.equal(generate(jsAst).code, '1');
  });

  test('it can convert float values', () => {
    const query = '{field(var: 1.5)}';
    const valueAst = parse(query).definitions[0].selectionSet.selections[0].arguments[0].value;
    const jsAst = argValueToJS(valueAst, '__defaultOperation__', config);

    assert.equal(generate(jsAst).code, '1.5');
  });

  test('it can convert boolean values', () => {
    const query = '{field(var: true)}';
    const valueAst = parse(query).definitions[0].selectionSet.selections[0].arguments[0].value;
    const jsAst = argValueToJS(valueAst, '__defaultOperation__', config);

    assert.equal(generate(jsAst).code, 'true');
  });

  test('it can convert list values', () => {
    const query = '{field(var: ["one", "two", 3])}';
    const valueAst = parse(query).definitions[0].selectionSet.selections[0].arguments[0].value;
    const jsAst = argValueToJS(valueAst, '__defaultOperation__', config);

    assert.equal(generate(jsAst).code, '["one", "two", 3]');
  });

  test('it can convert INPUT_OBJECT values', () => {
    const query = '{field(var: {key: "value"})}';
    const valueAst = parse(query).definitions[0].selectionSet.selections[0].arguments[0].value;
    const jsAst = argValueToJS(valueAst, '__defaultOperation__', config);

    assert.equal(generate(jsAst).code, '{\n  key: "value"\n}');
  });

  test('it can convert list of list values', () => {
    const query = '{field(var: ["one", ["two", "three"]])}';
    const valueAst = parse(query).definitions[0].selectionSet.selections[0].arguments[0].value;
    const jsAst = argValueToJS(valueAst, '__defaultOperation__', config);

    assert.equal(generate(jsAst).code, '["one", ["two", "three"]]');
  });

  test('it can convert nested INPUT_OBJECT values', () => {
    const query = '{field(var: {key: {otherKey: true}, foo: "bar"})}';
    const valueAst = parse(query).definitions[0].selectionSet.selections[0].arguments[0].value;
    const jsAst = argValueToJS(valueAst, '__defaultOperation__', config);

    assert.equal(generate(jsAst).code, '{\n  key: {\n    otherKey: true\n  },\n  foo: "bar"\n}');
  });

  test('it can convert variables', () => {
    const query = '{field(var: $someVariable)}';
    const valueAst = parse(query).definitions[0].selectionSet.selections[0].arguments[0].value;
    const jsAst = argValueToJS(valueAst, '__defaultOperation__', config);

    assert.equal(generate(jsAst).code, 'variables.__defaultOperation__.someVariable');
  });

  test('it can convert variables on named operations', () => {
    const query = 'query MyQuery {field(var: $someVariable)}';
    const valueAst = parse(query).definitions[0].selectionSet.selections[0].arguments[0].value;
    const jsAst = argValueToJS(valueAst, 'MyQuery', config);

    assert.equal(generate(jsAst).code, 'variables.MyQuery.someVariable');
  });

  test('it can handle really complex queries', () => {
    const query = '{field(var: {argOne: ["one", "two", $three, {nestedArgOne: true, nestedArgTwo: TWO}], argTwo: {one: [2.5, {three: true}]}})}';
    const valueAst = parse(query).definitions[0].selectionSet.selections[0].arguments[0].value;
    const jsAst = argValueToJS(valueAst, '__defaultOperation__', config);

    assert.equal(generate(jsAst).code, '{\n  argOne: ["one", "two", variables.__defaultOperation__.three, {\n    nestedArgOne: true,\n    nestedArgTwo: client.enum("TWO")\n  }],\n  argTwo: {\n    one: [2.5, {\n      three: true\n    }]\n  }\n}');
  });
});

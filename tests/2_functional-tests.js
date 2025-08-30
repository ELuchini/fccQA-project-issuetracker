const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let idsToUseLater =[];

suite('Functional Tests', function() {
    suite('POST /api/issues/{project} => object with issue data', function() {
        test('Every field filled in', function(done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Title',
                    issue_text: 'text',
                    created_by: 'Functional Test - Every field filled in',
                    assigned_to: 'Chai and Mocha',
                    status_text: 'In QA'
                })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, 'Title');
                    assert.equal(res.body.issue_text, 'text');
                    assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
                    assert.equal(res.body.assigned_to, 'Chai and Mocha');
                    assert.equal(res.body.status_text, 'In QA');
                    assert.isTrue(res.body.open);
                    assert.isNotNull(res.body._id);
                    assert.isNotNull(res.body.created_on);
                    assert.isNotNull(res.body.updated_on);
                    idsToUseLater[0] = res.body._id; // Guardamos el ID aquí
                    done();
                });
        });
        test('Required fields filled in', function(done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Title',
                    issue_text: 'text',
                    created_by: 'Functional Test - Required fields filled in'
                })
                .end(function(err, res){    
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, 'Title');
                    assert.equal(res.body.issue_text, 'text');
                    assert.equal(res.body.created_by, 'Functional Test - Required fields filled in');
                    assert.equal(res.body.assigned_to, '');
                    assert.equal(res.body.status_text, '');
                    assert.isTrue(res.body.open);
                    assert.isNotNull(res.body._id);
                    assert.isNotNull(res.body.created_on);
                    assert.isNotNull(res.body.updated_on);
                    idsToUseLater[1] = res.body._id; // Guardamos el ID aquí
                    done();
                }   
            );
        });
        test('Missing required fields', function(done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Title',
                    issue_text: 'text'
                })
                .end(function(err, res){    
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'required field(s) missing');
                    done();
                }   
            );
        });
    });

    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
        test('No filter', function(done) {
            chai.request(server)
                .get('/api/issues/test')
                .query({})
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.isAtLeast(res.body.length, 1);
                    done();
                }); 
        });
        test('One filter', function(done) {
            chai.request(server)
                .get('/api/issues/test')
                .query({open: true})
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.isAtLeast(res.body.length, 1);
                    res.body.forEach(issue => {
                        assert.isTrue(issue.open);
                    });
                    done();
                });
        });
        test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
            chai.request(server)
                .get('/api/issues/test')
                .query({open:true, issue_title:'Title' ,issue_text:'text', assigned_to: 'Chai and Mocha' })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.isAtLeast(res.body.length, 1);
                    res.body.forEach(issue => {
                        assert.isTrue(issue.open);
                        assert.strictEqual(issue.issue_text, 'text');
                        assert.strictEqual(issue.issue_title, 'Title');
                        assert.strictEqual(issue.assigned_to,'Chai and Mocha');
                    });
                    done();

                });
            
            });

    });

    suite('PUT /api/issues/{project} => text', function() {
        test('Valid update', function(done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: idsToUseLater[0], // Usamos el ID guardado
                    issue_title: 'Updated Title',
                })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { result: 'successfully updated', '_id': idsToUseLater[0] });
                    done();
                });
        });
        test('Multiple update', function(done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: idsToUseLater[0], // Usamos el ID guardado
                    issue_title: 'Updated Title',
                    issue_text: 'Updated text',
                    assigned_to: 'Chai and Mocha',
                    status_text: 'In Progress'
                })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { result: 'successfully updated', '_id': idsToUseLater[0] });
                    done();
                });
        });
        test('Missing id', function(done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    issue_title: 'Another Title',
                    issue_text: 'Another text',
                    assigned_to: 'Loraley',
                    status_text: 'In Progress'
                })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { error: 'missing _id' });
                    done();
                });
        });
        test('With no fields to update', function(done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: idsToUseLater[0] // Usamos el ID guardado
                })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { error: 'no update field(s) sent', '_id': idsToUseLater[0] });
                    done();
                });
        });
        test('Invalid update', function(done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: 'some-invalid-id',
                    issue_title: 'Updated Title',
                    issue_text: 'Updated text',
                    assigned_to: 'Chai and Mocha',
                    status_text: 'In Progress'
                })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { error: 'could not update', '_id': 'some-invalid-id' });
                    done();
                });
        });
    });

    suite('DELETE /api/issues/{project} => text', function() {
        test('Valid delete', function(done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({
                    _id: idsToUseLater[0] // Usamos el ID guardado
                })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { result: 'successfully deleted', '_id': idsToUseLater[0] });
                    done();
                });
        });
        test('Invalid delete', function(done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({
                    _id: 'some-invalid-id'
                })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { error: 'could not delete', '_id': 'some-invalid-id' });
                    done();
                });
        });
        test('Missing _id', function(done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({})
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { error: 'missing _id' });
                    done();
                });
        });
    });

});

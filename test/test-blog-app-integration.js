'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
//const mongodb = require('mongodb');
// https://www.npmjs.com/package/mongodb

// make expect syntax available throughout module
const expect = chai.expect;

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server.js');
const {TEST_DATABASE_URL} = require('../config.js');

chai.use(chaiHttp);

// Seed the database using Faker library
function seedBlogpostData(){
    console.info('seeding blogpost data');
    const seedData = [];
    for (let i=1; i<= 5; i++){
        seedData.push(generateBlogpostData()); // call the function, sarah
    }
    // return promise
    return BlogPost.insertMany(seedData);
    // return mongodb.collection('blogposts').insertMany(seedData);
}

// generate data to put into database
function generateAuthorName(){
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
    }
}


// generate object representing a blogpost
// can be used to generate seed data for db or request.body data
function generateBlogpostData(){
    return {
        title: faker.lorem.words(), 
        author: generateAuthorName(),
        content: faker.lorem.text(),
        comments: {
            content: faker.lorem.sentences()
        }

    }
};

// Delete the database/Teardown
function tearDownDb(){
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Blogposts API resource', function() {

    // each of these hook functions returns a promise
    // `runServer`, `seedBlogPostData`, `tearDownDb`

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });
    
    beforeEach(function() {
        return seedBlogpostData();
    });

    afterEach(function(){
        return tearDownDb();
    })

    after(function(){
        return closeServer();
    })

    // Test GET endpoint
    describe('GET endpoint', function(){
        it('should return all existing blogposts', function(){
            // strategy: get all restaurants
            // verify status and data type
            // prove number restaurants is equal to number in db
            let res;
            return chai.request(app)
                .get('/posts')
                .then(function(_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    //verify db of posts is more than 1
                    expect(res.body).to.have.lengthOf.at.least(1);
                    return BlogPost.count();
                })
                .then(function(count) {
                    expect(res.body).to.have.lengthOf(count);
                });
        });

        it('should return blogposts with correct fields', function() {
            // Inspect response for correct keys
            
            let resBlogpost;
            return chai.request(app)
                .get('/posts')
                .then(function(res) {
                    
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.lengthOf.at.least(1);
                    console.log(res.body);

                    res.body.forEach(function(post) {
                        expect(post).to.be.a('object');
                        expect(post).to.include.keys(
                            'id', 'author', 'content', 'title', 'created');
                    });
                    // set resBlogpost to 1st blogpost in array
                    resBlogpost = res.body[0];
                    return BlogPost.findById(resBlogpost.id);
                })
                .then(function(post) {
                    expect(resBlogpost.id).to.equal(post.id);
                })

        });

    });

    // Test POST Endpoint


    // Test PUT Endpoint

    // Test DELETE Endpoint


});

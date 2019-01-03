'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

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
        seedData.push(generateBlogpostData);
    }
    // return promise
    return BlogPost.insertMany(seedData);
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
        title: faker.random.catch_phrase_noun.blogTitle(), 
        author: generateAuthorName(),
        content: faker.lorem.sentence.blogContent(),
        comments: {
            content: faker.lorem.words.blogComment()
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


    describe('GET endpoint', function(){
        it('should return all existing blogposts', function(){
            // strategy: get all restaurants
            // verify status and data type
            // prove number restaurants is equal to number in db
            let blog;
            return chai.request(app)
                .get('/posts')
                .then(function(_blog) {
                    blog = _blog;
                    expect(blog).to.have.status(200);
                    //verify db of posts is more than 1
                    expect(blog.body.blogposts).to.have.lengthOf.at.least(1);
                    return BlogPost.count();
                })
                .then(function(count) {
                    expect(blog.body.blogposts).to.have.lengthOf(count);
                });
        });
    });

});

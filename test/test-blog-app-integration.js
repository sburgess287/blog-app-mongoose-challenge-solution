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
// function generateAuthorName(){
//     return {
//         firstName: faker.name.firstName(),
//         lastName: faker.name.lastName()

//     }
// }


// generate object representing a blogpost
// can be used to generate seed data for db or request.body data
function generateBlogpostData(){
    return {
        title: faker.lorem.words(), 
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        },
        content: faker.lorem.text(),
        // comments: {
        //     content: faker.lorem.sentences()
        // }

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
                   // console.log(res.body[0]);

                    res.body.forEach(function(post) {
                        expect(post).to.be.a('object');
                        expect(post).to.include.keys(
                            'id', 'author', 'content', 'title', 'created');
                    });
                    // set resBlogpost to 1st blogpost in array
                    resBlogpost = res.body[0];
                   // console.log(resBlogpost);
                    return BlogPost.findById(resBlogpost.id);
                })
                // verify the id of the response is the same as the 1st in the db
                .then(function(post) {
                    // console.log(resBlogpost.author); // this is returning name "meridith riley"
                    // console.log(post.author);  // this is returning an object
                    expect(resBlogpost.id).to.equal(post.id);
                    expect(resBlogpost.content).to.equal(post.content);
                    expect(resBlogpost.title).to.equal(post.title);
                   // expect(resBlogpost.created).to.equal(post.created); // doing something odd with time encoding
                  //  expect(resBlogpost.author).to.equal(post.author); // returning string and object

                });

        });

    });

    // Test POST Endpoint
    describe('POST endpoint', function() {
        // make a POST request with data
        // prove that the blogpost we get back has right keys
        // and an id is returned as well (indicating it was added to db)
        it('should add new blogpost', function() {
            const newPost = {
                title: faker.lorem.words(), 
                author: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName()
                },
                content: faker.lorem.text(),

            }

            return chai.request(app)
                .post('/posts')
                .send(newPost)
                .then(function(res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys(
                    'id', 'author', 'content', 'title', 'created');
                    expect(res.body.title).to.equal(newPost.title);
                    expect(res.body.id).to.not.be.null; 
                    expect(res.body.author).to.equal(
                        `${newPost.author.firstName} ${newPost.author.lastName}`)
                    return BlogPost.findById(res.body.id);
                })
                .then(function(post) {

                    expect(post.title).to.equal(newPost.title);
                    expect(post.author.firstName).to.equal(newPost.author.firstName);
                    expect(post.author.lastName).to.equal(newPost.author.lastName);
                    expect(post.content).to.equal(newPost.content);
                })
                
        });

    });


    // Test PUT Endpoint
    describe('PUT endpoint', function() {
        // get an existing post from db
        // make PUT request to update the post
        // verify the response
        // verify the post in the db is updated correctly
        it('should update expected fields', function() {
            const updatePost = {
                title: "amazingNewPost",
                author: {
                    firstName: "Jenny",
                    lastName: "Smith"
                },
                content: "Have a great day!"
            }

            return BlogPost
                .findOne()
                .then(function(post) {
                    updatePost.id = post.id;

                    // make request and inspect response and data
                    return chai.request(app)
                        .put(`/posts/${post.id}`)
                        .send(updatePost);
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                    return BlogPost.findById(updatePost.id);
                })
                .then(function(blogpost) {
                    expect(blogpost.title).to.equal(updatePost.title);
                    expect(blogpost.author.firstName).to.equal(updatePost.author.firstName);
                    expect(blogpost.author.lastName).to.equal(updatePost.author.lastName);
                    expect(blogpost.content).to.equal(updatePost.content);
                });
        });
    });

    // Test DELETE Endpoint
    describe('DELETE endpoint', function() {
        // Get a blogpost by id
        // make a DELETE request for that id
        // assert response code
        // Verify post with that ID is no longer in the DB
        it('deletes a blogpost by id', function() {

            let blogpost;
    
            return BlogPost
                .findOne()
                .then(function(_blogpost) {
                    blogpost = _blogpost;
                    return chai.request(app).delete(`/posts/${blogpost.id}`);
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                    return BlogPost.findById(blogpost.id);
                })
                .then(function(_blogpost) {
                    expect(_blogpost).to.be.null;
                });
        });

    });


});

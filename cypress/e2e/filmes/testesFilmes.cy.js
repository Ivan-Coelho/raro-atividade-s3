import { faker } from '@faker-js/faker';

let usuario2 = faker.internet.userName()
let emailAdmin = faker.internet.email()
let idUserAdmin
let tokenAdmin
let idFilme

before(function () {
    cy.fixture("body/filme.json").as("arquivo")
})

describe('testes de filme', function () {

    describe('Listar filmes', function () {
        it('Listar filmes no site', function () {
            cy.request({
                method: 'GET',
                url: 'movies'
            }).then(function (response) {
                expect(response.status).to.equal(200)
                expect(response.body).to.be.an('array')
            })
        })
    })
    describe('Teste de busca de filmes', function () {

        beforeEach(function () {

            cy.request('POST', 'users', {
                "name": usuario2,
                "email": emailAdmin,
                "password": "123456"
            }).then(function (response) {
                expect(response.body.id)//.to.be.an('number')
                idUserAdmin = response.body.id
            })
            cy.request('POST', 'auth/login', {
                'email': emailAdmin,
                'password': '123456'
            }).then(function (response) {
                expect(response.body.accessToken)//.to.be.an('string')
                tokenAdmin = response.body.accessToken
                cy.request({
                    method: 'PATCH',
                    url: "users/admin",
                    headers: { Authorization: 'Bearer ' + tokenAdmin }
                })//.then(function (admin) {
                //     expect(admin.status).to.equal(204)
                // })
            })

        })
        afterEach(function () {

            cy.request({
                method: 'DELETE',
                url: 'users/' + idUserAdmin,
                headers: { Authorization: 'Bearer ' + tokenAdmin }
            }).then(function (response) {
                expect(response.status).to.equal(204);
            })
        })


        it('Buscar um filme pelo nome', function () {
            cy.request({
                method: 'POST',
                url: 'movies',
                headers: { Authorization: 'Bearer ' + tokenAdmin },
                body: this.arquivo
            })//.then(function (response) {
            //  expect(response.status).to.equal(201)
            // cy.log(response)
            //})       
            cy.request({
                method: 'GET',
                url: 'movies/search',
                qs: { title: 'O rei Leão' }
            }).then(function (response) {
                expect(response.status).to.equal(200)
                expect(response.body).to.be.an('array').that.is.not.empty
            })
        })
            
        it('Buscar por um filme pelo ID', function () {
            cy.request({
                method: 'POST',
                url: 'movies',
                headers: { Authorization: 'Bearer ' + tokenAdmin },
                body: this.arquivo
            })
            cy.request({
                method: 'GET',
                url: 'movies/search',
                qs: { title: 'O rei Leão' }
            }).then(function (response) {
                //expect(response.status)
                //if (response.body.lenght > 0) {
                    return idFilme = response.body.id;                    
                    
                //}
            })
            cy.request({
                method: 'GET',
                url: 'movies/' + idFilme,

            }).then(function (response) {
                expect(response.status).to.equal(201)
                expect(response.body).to.be.an('object').that.is.not.empty
            })

        })

        // it('cadastrar um filme', function () {
        //     cy.request({
        //         method: 'POST',
        //         url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies',
        //         headers: { Authorization: 'Bearer ' + tokenAdmin },
        //         body: {
        //             "title": "string",
        //             "genre": "string",
        //             "description": "string",
        //             "durationInMinutes": 0,
        //             "releaseYear": 0
        //         }
        //     }).then(function (response) {
        //         expect(response.status).to.equal(201)
        //         cy.log(response.body)                       
        //     })
        // })

    })
})

import { faker } from '@faker-js/faker';

let usuario2 = faker.internet.userName()
let emailAdmin = faker.internet.email()
let idUserAdmin
let tokenAdmin
let idFilme

describe('Teste de listagem e busca de filmes', function () {
    beforeEach(function () { //usuário admin
        cy.request('POST', 'https://raromdb-3c39614e42d4.herokuapp.com/api/users', {//cria usuário
            "name": usuario2,
            "email": emailAdmin,
            "password": "123456"
        }).then(function (response) {
            expect(response.body.id)//.to.be.an('number')
            idUserAdmin = response.body.id
        })
        cy.request('POST', 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login', {
            'email': emailAdmin,
            'password': '123456'
        }).then(function (response) {
            expect(response.body.accessToken)//.to.be.an('string')
            tokenAdmin = response.body.accessToken//armazenando o token
            cy.request({
                method: 'PATCH',
                url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/admin", // tornando admin
                headers: { Authorization: 'Bearer ' + tokenAdmin }//utilizando o token
            })//.then(function (admin) {
            //     expect(admin.status).to.equal(204)
            // })
        })
    })
    afterEach(function () {        
        
        cy.request({
            method: 'DELETE',
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/' + idUserAdmin,
            headers: { Authorization: 'Bearer ' + tokenAdmin }
        }).then(function (response) {
            expect(response.status).to.equal(204);
        })
    })

it('Listar filmes no site', function () {
    cy.request({
        method: 'GET',
        url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies'
    }).then(function (response) {
        expect(response.status).to.equal(200)
        expect(response.body).to.be.an('array')
    })
})
it('Buscar por um filme pelo nome', function () {
    cy.request({
        method: 'POST',
        url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies',
        headers: { Authorization: 'Bearer ' + tokenAdmin },
        body: {
            "title": "O rei Leão",
            "genre": "Animado",
            "description": "Filme infantil",
            "durationInMinutes": 120,
            "releaseYear": 1990
        }
    }).then(function (response) {
        expect(response.status).to.equal(201)
        cy.log(response)
    })
    cy.request({
        method: 'GET',
        url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies/search',
        qs: { title: 'O rei Leão' }
    }).then(function (response) {
        expect(response.status).to.equal(200)
        expect(response.body).to.be.an('array')
    })
})

it('Buscar por um filme pelo ID', function () {
    cy.request({
        method: 'POST',
        url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies',
        headers: { Authorization: 'Bearer ' + tokenAdmin },
        body: {
            "title": "O rei Leão2",
            "genre": "Animado",
            "description": "Filme infantil",
            "durationInMinutes": 120,
            "releaseYear": 1990
        }
    }).then(function (response) {
        expect(response.status).to.equal(201)
        expect(response.body.id)
        
        cy.log(response.body)
       idFilme = response.body.id
        
    })
    cy.request({
        method: 'GET',
        url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies/' + idFilme,

    }).then(function (response) {
        expect(response.status).to.equal(200)
        expect(response.body).to.be.an('object')
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

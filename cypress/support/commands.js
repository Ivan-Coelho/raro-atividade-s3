import { faker } from '@faker-js/faker';
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
// 
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
//Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

let usuario2 = faker.internet.userName()
let tokenAdmin
let userAdmin
let emailAdmin = faker.internet.email()
let emailComum = faker.internet.email()
let tokenComum
let tokenCritico



Cypress.Commands.add('criarUsuarioAdmin', function () {

    return cy.request('POST', 'users', {//cria usuário Admin
        "name": usuario2,
        "email": emailAdmin,
        "password": "123456"
    }).then(function (response) {
        //expect(response.body)//.to.be.an('number')
        //return userAdmin = response.body
        return response.body
    })
})

Cypress.Commands.add('authUsuarioAdmin', function () {

    return cy.request('POST', 'auth/login', {//fazendo login
        'email': emailAdmin,
        'password': '123456'
    }).then(function (response) {
        expect(response.body.accessToken)//.to.be.an('string')
        return tokenAdmin = response.body.accessToken//armazenando o token        
    })
})

Cypress.Commands.add('authUsuarioAdmin2', function () {

    return cy.request({
        method: 'PATCH',
        url: "users/admin", // tornando admin
        headers: { Authorization: 'Bearer ' + tokenAdmin }//utilizando o token
    }).then(function (admin) {
        expect(admin.status).to.equal(204)
    })
})



Cypress.Commands.add('usuarioCriticoLogado', function () {
    

    return cy.request({
        method: 'POST',
        url: 'auth/login',
        body: {
            'email': emailComum,
            'password': '123456'
        },
    }).then(function (response) {
        tokenCritico = response.body.accessToken
        return tokenCritico
    })
})
Cypress.Commands.add('authUsuarioCritico', function () {
    
        return cy.request({
            method: 'PATCH',
            url: "users/apply", // tornando critico
            headers: { Authorization: 'Bearer ' + tokenCritico }
        }).then(function (critico) {
            expect(critico.status).to.equal(204)
        })
    })


Cypress.Commands.add('criarUsuarioComum', function () {

    cy.request('POST', 'users', {
        "name": usuario2,
        "email": emailComum,
        "password": "123456"
    }).then(function (response) {
        return response.body
    })
})
Cypress.Commands.add('usuarioComumLogado', function () {
    

    return cy.request({
        method: 'POST',
        url: 'auth/login',
        body: {
            'email': emailComum,
            'password': '123456'
        },
    }).then(function (response) {
        tokenComum = response.body.accessToken
        return tokenComum
    })
})

Cypress.Commands.add('deletarUsuario', function (idUsuario, tokenAdmin) {    
    cy.request({
        method: 'DELETE',
        url: 'users/' + idUsuario,
        headers: { Authorization: 'Bearer ' + tokenAdmin }
    })
    
})

Cypress.Commands.add('buscarFilme', function () {
    let idFilme
    return cy.request({
        method: 'GET',
        url: 'movies/search',
        qs: { title: 'Jumanji' }
    }).then(function (response) {

        return idFilme = response.body[0].id
    })
})

Cypress.Commands.add('cadastrarFilme', function (tokenAdmin) {
    
    //cy.fixture("filmes/body/filme.json").as("arquivo")
    cy.request({
        method: 'POST',
        url: 'movies',
        headers: { Authorization: 'Bearer ' + tokenAdmin },
        body: {//this.arquivo
            title: "Jumanji",
            genre: "Animado",
            description: "Filme infantil",
            durationInMinutes: 120,
            releaseYear: 1990
        }
    })
})

import { faker } from '@faker-js/faker';

let usuario2 = faker.internet.userName()
let emailAdmin = faker.internet.email()
let emailNaoLogado = faker.internet.email()
let tokenAdmin
let idUserAdmin
let idUserNaoLogado


describe('Teste de autenticação de usuário', function () {
    describe('Testes de login com falha', function(){
        
        it('Fazer login sem estar cadastrado', function () {
            cy.request({
                method: 'POST',
                url: 'auth/login',
                body: {
                    'email': 'sdlkgfklsdnlka@nãoépossivelquevaocadastrarissosopraferrarmeuteste.com',
                    'password': '123456'
                }, failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(401);
                cy.log(response)
                expect(response.body).to.deep.equal({
                    "message": "Invalid username or password.",
                    "error": "Unauthorized",
                    "statusCode": 401
                })
            })
        })
        it('Fazer login com email mal formatado', function () {
            cy.request({
                method: 'POST',
                url: 'auth/login',
                body: {
                    'email': 'email@qualquer',
                    'password': '123456'
                }, failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400);
                cy.log(response)
                expect(response.body).to.deep.equal({
                    "message": ["email must be an email"],
                    "error": "Bad Request",
                    "statusCode": 400
                })
            })
        })

    })
    describe("Testes de login",function(){
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
            cy.request('POST', 'users', {
                "name": usuario2,
                "email": emailNaoLogado,
                "password": "123456"
            }).then(function (response) {
                expect(response.body.id)//.to.be.an('number')
                idUserNaoLogado = response.body.id
            })
        })
    
        afterEach(function () {
            cy.request({
                method: 'DELETE',
                url: 'users/' + idUserNaoLogado,
                headers: { Authorization: 'Bearer ' + tokenAdmin }
            }).then(function (response) {
                expect(response.status).to.equal(204);
            })
            cy.request({
                method: 'DELETE',
                url: 'users/' + idUserAdmin,
                headers: { Authorization: 'Bearer ' + tokenAdmin }
            }).then(function (response) {
                expect(response.status).to.equal(204);
            })
        })
    
        it('Fazer login', function () {
            cy.request({
                method: 'POST',
                url: 'auth/login',
                body: {
                    'email': emailNaoLogado,
                    'password': '123456'
                }
            }).then(function (response) {
                expect(response.status).to.equal(200);
                cy.log(response)
                expect(response.body.accessToken).to.be.an('string')
            })
        })
        
        it('Fazer login com senha errada', function () {
            cy.request({
                method: 'POST',
                url: 'auth/login',
                body: {
                    'email': emailNaoLogado,
                    'password': '123456ABC'
                }, failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(401);
                cy.log(response)
                expect(response.body).to.deep.equal({
                    "message": "Invalid username or password.",
                    "error": "Unauthorized",
                    "statusCode": 401
                })
            })
        })

    })   
    
})
import { faker } from '@faker-js/faker';


let emailNaoLogado = faker.internet.email()
let tokenAdmin
let userAdmin
let userAdmin3
let userComum


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
            
            cy.criarUsuarioAdmin().then(function (dadosAdmin) {
                userAdmin = dadosAdmin
                cy.log(userAdmin.id)

                cy.authUsuarioAdmin().then(function (dadosAdmin) {
                    tokenAdmin = dadosAdmin
                    cy.log(tokenAdmin)                     
                
                    cy.authUsuarioAdmin2().then(function(dadosAdmin){
                        userAdmin3 = dadosAdmin 
                        cy.log (userAdmin3)
                    });
            });
        });  

        cy.criarUsuarioComum().then(function (dadosComum) {
            userComum = dadosComum
            cy.log(userComum.id)           
        })
        })
    
        afterEach(function () {

            cy.deletarUsuario(userComum.id, tokenAdmin)
            cy.deletarUsuario(userAdmin.id, tokenAdmin) 
            
        })
    
        it('Fazer login', function () {
            cy.request({
                method: 'POST',
                url: 'auth/login',
                body: {
                    'email': userComum.email,
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
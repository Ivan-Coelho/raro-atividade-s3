import { faker } from '@faker-js/faker';

let email = faker.internet.email()
let usuario1 = faker.internet.userName()
let usuario2 = faker.internet.userName()
let emailAdmin = faker.internet.email()
let emailComum = faker.internet.email()
let tokenAdmin
let tokenComum
let idUserAdmin
let idUserComum
let id


describe('Teste de usuário', function () {
    describe('Teste de usuários cadastrado de maneira errada ', function () {
        it("cadastrar novo usuário com senha curta", function () {
            cy.request({
                method: 'POST',
                url: 'users',
                body: {
                    "name": "Ivan Coelho",
                    "email": email,
                    "password": "12345"
                },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: ["password must be longer than or equal to 6 characters"],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })
        it("cadastrar novo usuário com senha muito grande", function () {
            cy.request({
                method: 'POST',
                url: 'users',
                body: {
                    "name": "Ivan Coelho",
                    "email": email,
                    "password": "123456789ABCD"
                },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    "message": ["password must be shorter than or equal to 12 characters"],
                    "error": "Bad Request",
                    "statusCode": 400
                })
            })
        })
        it("cadastrar novo usuário com email fora do padrão", function () {
            cy.request({
                method: 'POST',
                url: 'users',
                body: {
                    "name": "Ivan Coelho",
                    "email": usuario2 + '2gmail.com',
                    "password": "1234567"
                },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    "message": ["email must be an email"],
                    "error": "Bad Request",
                    "statusCode": 400
                })
            })
        })
        it("cadastrar novo usuário sem preencher campo nome", function () {
            cy.request({
                method: 'POST',
                url: 'users',
                body: {
                    "name": "",
                    "email": email,
                    "password": "1234567"
                },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: ["name must be longer than or equal to 1 characters", "name should not be empty"],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })
    })
    describe('Teste de criação de usuário', function () {

        beforeEach(function () { 
            cy.request('POST', 'users', {//cria usuário
                "name": usuario2,
                "email": emailAdmin,
                "password": "123456"
            }).then(function (response) {
                expect(response.body.id)//.to.be.an('number')
                idUserAdmin = response.body.id
            })
            cy.request('POST', 'auth/login', {//fazendo login
                'email': emailAdmin,
                'password': '123456'
            }).then(function (response) {
                expect(response.body.accessToken)//.to.be.an('string')
                tokenAdmin = response.body.accessToken//armazenando o token
                cy.request({
                    method: 'PATCH',
                    url: "users/admin", // tornando admin
                    headers: { Authorization: 'Bearer ' + tokenAdmin }//utilizando o token
                })//.then(function (admin) {
                //     expect(admin.status).to.equal(204)
                // })
            })//usuário comum
            cy.request('POST', 'users', {
                "name": usuario1,
                "email": emailComum,
                "password": "123456"
            }).then(function (response) {
                expect(response.body.id)//.to.be.an('number')
                idUserComum = response.body.id
            })
            cy.request('POST', 'auth/login', {
                'email': emailComum,
                'password': '123456'
            }).then(function (logUsuario) {
                expect(logUsuario.body.accessToken)//.to.be.an('string')
                tokenComum = logUsuario.body.accessToken
            })
        })
        afterEach(function () {

            cy.request({
                method: 'DELETE',
                url: 'users/' + idUserComum,
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
        
        it('Cadastrar um novo usuáriocom senha de 06 digitos', function () {
            cy.request('POST', 'users', {
                "name": "Ivan Coelho",
                "email": email,
                "password": "123456"
            }).then(function (response) {
                expect(response.status).to.equal(201)
                expect(response.body).to.be.an('object')
                expect(response.body.id).to.be.an('number')
                expect(response.body).to.have.property('id')
                expect(response.body.name).to.equal('Ivan Coelho')
                expect(response.body.email).to.equal(email)
                id = response.body.id
                cy.log(id)

                cy.request({
                    method: 'DELETE',
                    url: 'users/' + id,
                    headers: { Authorization: 'Bearer ' + tokenAdmin }
                }).then(function (response) {
                    expect(response.status).to.equal(204);
                })
            })
        })
        it('Cadastrar um novo usuário com senha de 12 digitos', function () {
            cy.request('POST', 'users', {
                "name": "Ivan Coelho",
                "email": email,
                "password": "123456789abc"
            }).then(function (response) {
                expect(response.status).to.equal(201)
                expect(response.body).to.be.an('object')
                expect(response.body.id).to.be.an('number')
                expect(response.body).to.have.property('id')
                expect(response.body.name).to.equal('Ivan Coelho')
                expect(response.body.email).to.equal(email)
                id = response.body.id
                cy.log(id)

                cy.request({
                    method: 'DELETE',
                    url: 'users/' + id,
                    headers: { Authorization: 'Bearer ' + tokenAdmin }
                }).then(function (response) {
                    expect(response.status).to.equal(204);
                })
            })
        })
        it("cadastrar novo usuário com email já cadastrado", function () {
            cy.request({
                method: 'POST',
                url: 'users',
                body: {
                    "name": "Ivan Coelho",
                    "email": emailComum,
                    "password": "123456"
                }, failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(409)
                expect(response.body).to.deep.equal({
                    message: "Email already in use",
                    error: "Conflict",
                    statusCode: 409
                })
            })
        })

        it("Consultar um usuário por ID", function () {
            cy.request({
                method: "GET",
                url: "users/" + idUserAdmin,
                id: idUserAdmin,
                headers: { Authorization: 'Bearer ' + tokenAdmin }
            }).then(function (response) {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.an('object');
                expect(response.body.name).to.be.an('string');
                expect(response.body.id).to.equal(idUserAdmin);
                expect(response.body.name).to.equal(usuario2)
                expect(response.body.email).to.equal(emailAdmin)

            })
        })
        it("Usuário comum consultar seus dados", function () {
            cy.request({
                method: "GET",
                url: "users/" + idUserComum,
                id: idUserComum,
                headers: { Authorization: 'Bearer ' + tokenComum }
            }).then(function (response) {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.an('object');
                expect(response.body.name).to.be.an('string');
                expect(response.body.id).to.equal(idUserComum);
                expect(response.body.name).to.equal(usuario1)
                expect(response.body.email).to.equal(emailComum)

            })
        })
        it("Admin Consultar um usuário por ID", function () {
            cy.request({
                method: "GET",
                url: "users/" + idUserComum,
                id: idUserComum,
                headers: { Authorization: 'Bearer ' + tokenAdmin }
            }).then(function (response) {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.an('object');
                expect(response.body.name).to.be.an('string')
                expect(response.body.id).to.equal(idUserComum);
                expect(response.body.name).to.equal(usuario1)
                expect(response.body.email).to.equal(emailComum)

            })
        })
        it("Usuário comum consultar um usuário por ID", function () {
            cy.request({
                method: "GET",
                url: "users/" + idUserAdmin,
                id: idUserAdmin,
                headers: { Authorization: 'Bearer ' + tokenComum }, failOnStatusCode: false

            }).then(function (response) {
                expect(response.status).to.equal(403);
            })
        })
        it('listar todos os usuários', function () {
            cy.request({
                method: 'GET',
                url: 'users',
                headers: { Authorization: 'Bearer ' + tokenAdmin }
            }).then(function (response) {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.an('array').that.is.not.empty;

            })
        })
    })

})


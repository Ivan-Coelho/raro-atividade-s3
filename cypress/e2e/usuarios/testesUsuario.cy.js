import { faker } from '@faker-js/faker';

let email = faker.internet.email()
let usuario2 = faker.internet.userName()
let emailAdmin = faker.internet.email()
let emailComum = faker.internet.email()
let emailNaoLogado = faker.internet.email()
let tokenAdmin
let tokenComum
let idUserAdmin
let idUserComum
let idUserNaoLogado
let id
//let idFilme

describe('Teste de criação de usuários', function () {

    beforeEach(function () { //usuário admin
        cy.request('POST', 'https://raromdb-3c39614e42d4.herokuapp.com/api/users', {//cria usuário
            "name": usuario2,
            "email": emailAdmin,
            "password": "123456"
        }).then(function (response) {//.as('usuarioJaExiste') usando aliases para criar usuário (no lugar do then)
            expect(response.body.id)//.to.be.an('number')
            idUserAdmin = response.body.id
        })
        cy.request('POST', 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login', {//fazendo login
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
        })//usuário comum
        cy.request('POST', 'https://raromdb-3c39614e42d4.herokuapp.com/api/users', {//cria usuário
            "name": usuario2,
            "email": emailComum,
            "password": "123456"
        }).then(function (response) {
            expect(response.body.id)//.to.be.an('number')
            idUserComum = response.body.id
        })
        cy.request('POST', 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login', {//fazendo login
            'email': emailComum,
            'password': '123456'
        }).then(function (logUsuario) {
            expect(logUsuario.body.accessToken)//.to.be.an('string')
            tokenComum = logUsuario.body.accessToken//armazenando o token
        })
        cy.request('POST', 'https://raromdb-3c39614e42d4.herokuapp.com/api/users', {//cria usuário
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
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/' + idUserComum,
            headers: { Authorization: 'Bearer ' + tokenAdmin }
        }).then(function (response) {
            expect(response.status).to.equal(204);
        })
        cy.request({
            method: 'DELETE',
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/' + idUserNaoLogado,
            headers: { Authorization: 'Bearer ' + tokenAdmin }
        }).then(function (response) {
            expect(response.status).to.equal(204);
        })
        cy.request({
            method: 'DELETE',
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/' + idUserAdmin,
            headers: { Authorization: 'Bearer ' + tokenAdmin }
        }).then(function (response) {
            expect(response.status).to.equal(204);
        })

    })

    it('Criar um novo usuário', function () {
        cy.request('POST', 'https://raromdb-3c39614e42d4.herokuapp.com/api/users', {
            "name": "Ivan Coelho",
            "email": email,
            "password": "123456"
        }).then(function (response) {
            expect(response.status).to.equal(201)
            expect(response.body).to.be.an('object')
            expect(response.body.id).to.be.an('number')
            id = response.body.id
            cy.log(id)

            cy.request({
                method: 'DELETE',
                url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/' + id,
                headers: { Authorization: 'Bearer ' + tokenAdmin }
            }).then(function (response) {
                expect(response.status).to.equal(204);
            })
        })
    })
    it("cadastrar novo usuário com email já cadastrado", function () {
        cy.request({
            method: 'POST',
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
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
    it("cadastrar novo usuário com senha curta", function () {
        cy.request({
            method: 'POST',
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
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
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
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
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
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
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
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
    it("Consultar um usuário por ID", function () {
        cy.request({
            method: "GET",
            url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/" + idUserAdmin,
            id: idUserAdmin,
            headers: { Authorization: 'Bearer ' + tokenAdmin }
        }).then(function (response) {
            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('object');
            expect(response.body.name).to.be.an('string')
            expect(response.body.id).to.equal(idUserAdmin);

        })
    })
    it("Usuário comum consultar um usuário por ID", function () {
        cy.request({
            method: "GET",
            url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/" + idUserAdmin,
            id: idUserAdmin,
            headers: { Authorization: 'Bearer ' + tokenComum }, failOnStatusCode: false

        }).then(function (response) {
            expect(response.status).to.equal(403);
        })
    })
    it('listar todos os usuários', function () {
        cy.request({
            method: 'GET',
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
            headers: { Authorization: 'Bearer ' + tokenAdmin }
        }).then(function (response) {
            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('array')//.that.is.not.empty;
            //  response.body.forEach(user => {
            //   expect(user).to.have.property('id').that.is.a('number');
            //  expect(user).to.have.property('name').that.is.a('string').and.not.empty;
            //  expect(user).to.have.property('email').that.is.a('string').and.not.empty;
            //  })
        })
    })
    
})


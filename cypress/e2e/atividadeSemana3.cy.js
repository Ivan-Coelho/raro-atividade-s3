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
let idFilme

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
                "email": emailComum, // mudar para usuário comum
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
            expect(response.body).to.be.an('array')
        })
    })
    it('Fazer login', function () {
        cy.request({
            method: 'POST',
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login',
            body: {
            'email': emailNaoLogado,
            'password': '123456'}
        }).then(function (response) {
            expect(response.status).to.equal(200);
            cy.log(response)
            expect(response.body.accessToken).to.be.an('string')
        })
    })
    it('Fazer login sem estar cadastrado', function () {
        cy.request({
            method: 'POST',
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login',
            body: {
            'email': 'sdlkgfklsdnlka@nãoépossivelquevaocadastrarissosopraferrarmeuteste.com',
            'password': '123456'}, failOnStatusCode : false
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
    it('Fazer login com senha errada', function () {
        cy.request({
            method: 'POST',
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login',
            body: {
            'email': emailNaoLogado,
            'password': '123456ABC'}, failOnStatusCode : false
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
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login',
            body: {
            'email': 'email@qualquer',
            'password': '123456'}, failOnStatusCode : false
        }).then(function (response) {
            expect(response.status).to.equal(400);
            cy.log(response)
            expect(response.body).to.deep.equal({                
                "message":["email must be an email"],
                "error": "Bad Request",
                "statusCode": 400                  
            })
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


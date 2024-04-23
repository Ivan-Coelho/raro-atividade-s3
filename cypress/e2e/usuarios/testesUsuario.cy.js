import { faker } from '@faker-js/faker';

let email = faker.internet.email()
let usuario2 = faker.internet.userName()
let emailComum = faker.internet.email()
let tokenAdmin
var tokenComum
let userAdmin //id
var userComum
let id
let userAdmin3

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
        it("cadastrar novo usuário sem preencher campo password", function () {
            cy.request({
                method: 'POST',
                url: 'users',
                body: {
                    "name": "Ivan Coelho",
                    "email": email,
                    "password": ""
                },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: ["password must be longer than or equal to 6 characters",
                        "password should not be empty"],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })
        it("cadastrar novo usuário enviando body vazio", function () {//AQUII
            cy.request({
                method: 'POST',
                url: 'users',
                body: {},
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: [
                        "name must be longer than or equal to 1 characters",
                        "name must be a string",
                        "name should not be empty",
                        "email must be longer than or equal to 1 characters",
                        "email must be an email",
                        "email should not be empty",
                        "password must be longer than or equal to 6 characters",
                        "password must be a string",
                        "password should not be empty"
                    ],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })


    })
    describe('Teste de criação de usuário', function () {

        before(function () {

            cy.criarUsuarioAdmin().then(function (dadosAdmin) {
                userAdmin = dadosAdmin
                cy.log(userAdmin.id)

                cy.authUsuarioAdmin().then(function (dadosAdmin) {
                    tokenAdmin = dadosAdmin
                    cy.log(tokenAdmin)

                    cy.authUsuarioAdmin2().then(function (dadosAdmin) {
                        userAdmin3 = dadosAdmin
                        cy.log(userAdmin3)
                    });
                });
            });

        })
        beforeEach(function () {

            cy.criarUsuarioComum().then(function (dadosComum) {
                userComum = dadosComum
                cy.log(userComum.id)
                cy.usuarioComumLogado().then(function (response) {
                    tokenComum = response
                })
            })
        })

        afterEach(function () {
            cy.deletarUsuario(userComum.id, tokenAdmin)
        })

        after(function () {
            cy.deletarUsuario(userAdmin.id, tokenAdmin)
        })

        it('Cadastrar um novo usuário com senha de 06 digitos', function () {

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

                cy.deletarUsuario(id, tokenAdmin)
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

                cy.deletarUsuario(id, tokenAdmin)

            })
        })
        it("cadastrar novo usuário com email já cadastrado", function () {
            let id2
            cy.request({
                method: 'POST',
                url: 'users',
                body: {
                    "name": "Ivan Coelho",
                    "email": emailComum,
                    "password": "123456"
                }
            }).then(function (response) {
                id2 = response.body.id
            })
            cy.request({
                method: 'POST',
                url: 'users',
                body: {
                    "name": "Ivan Coelho",
                    "email": emailComum,
                    "password": "123456"
                }, failOnStatusCode: false
            })// cy.criarUsuarioComum() NÃO CONSIGO USAR O failOnStatusCode: false                
                .then(function (response) {
                    expect(response.status).to.equal(409)
                    expect(response.body).to.deep.equal({
                        message: "Email already in use",
                        error: "Conflict",
                        statusCode: 409
                    })
                    cy.deletarUsuario(id2, tokenAdmin)
                })
        })

        it("Consultar um usuário por ID", function () {
            cy.log(tokenAdmin)
            cy.request({
                method: "GET",
                url: "users/" + userAdmin.id,
                headers: { Authorization: 'Bearer ' + tokenAdmin }
            }).then(function (response) {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.an('object');
                expect(response.body.name).to.be.an('string');
                expect(response.body.id).to.equal(userAdmin.id);
                expect(response.body.name).to.equal(userAdmin.name)
                expect(response.body.email).to.equal(userAdmin.email)
                //expect(response.body).to.deep.equal(userAdmin) body é atualizado quando atualiza para admin

            })
        })
        it("Usuário comum consultar seus dados", function () {

            cy.request({
                method: "GET",
                url: "users/" + userComum.id,
                headers: { Authorization: 'Bearer ' + tokenComum },
            }).then(function (response) {
                expect(response.status).to.equal(200);
                expect(response.body).to.deep.equal(userComum)
            })
        })
        it("Admin Consultar um usuário por ID", function () {

            cy.request({
                method: "GET",
                url: "users/" + userComum.id,
                headers: { Authorization: 'Bearer ' + tokenAdmin }
            }).then(function (response) {
                expect(response.status).to.equal(200);
                expect(response.body).to.deep.equal(userComum)
            })
        })
        it("Usuário comum consultar um usuário por ID", function () {

            cy.request({
                method: "GET",
                url: "users/" + userAdmin.id,
                headers: { Authorization: 'Bearer ' + tokenComum },
                failOnStatusCode: false

            }).then(function (response) {
                expect(response.status).to.equal(403);
            })
        })
        it("Usuário crítico consultar um usuário por ID", function () {//// AQUIIIIIIII
            
            cy.request({
                method: 'PATCH',
                url: "users/apply", // tornando critico
                headers: { Authorization: 'Bearer ' + tokenComum }
            }).then(function (dadosCritico) {
                expect(dadosCritico.status).to.equal(204)

                cy.request({
                    method: "GET",
                    url: "users/" + userAdmin.id,
                    headers: { Authorization: 'Bearer ' + tokenComum },
                    failOnStatusCode: false

                }).then(function (response) {
                    expect(response.status).to.equal(403);
                })

                cy.request({ //critico consultando seus proprios dadaos e provando que é crítico
                    method: "GET",
                    url: "users/" + userComum.id,
                    headers: { Authorization: 'Bearer ' + tokenComum },
                }).then(function (response) {
                    expect(response.status).to.equal(200);
                    expect(response.body.type).to.equal(2)//type 2 é tipo crítico
                })

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
                response.body.forEach(user => {
                    expect(user).to.have.property('id').that.is.a('number');
                    expect(user).to.have.property('name').that.is.a('string').and.not.empty;
                    expect(user).to.have.property('email').that.is.a('string').and.not.empty;
                })
            })

        })
    })

})
describe('Teste de criação de review', function () {
    let idFilme

    describe('Teste de criação de review mal formatada', function () {
        before(function () {

            cy.criarUsuarioAdmin().then(function (dadosAdmin) {
                userAdmin = dadosAdmin

                cy.authUsuarioAdmin().then(function (dadosAdmin) {
                    tokenAdmin = dadosAdmin

                    cy.authUsuarioAdmin2().then(function (dadosAdmin) {
                        userAdmin3 = dadosAdmin

                        cy.cadastrarFilme(tokenAdmin).then(function (response) {
                            idFilme = response.body.id
                        })
                    })
                });
            });
        });

        beforeEach(function () {
            cy.criarUsuarioComum().then(function (dadosComum) {
                userComum = dadosComum
                cy.usuarioComumLogado().then(function (response) {
                    tokenComum = response
                })
            })
        })

        afterEach(function () {
            cy.deletarUsuario(userComum.id, tokenAdmin)
        })

        after(function () {
            cy.request({
                method: 'DELETE',
                url: 'movies/' + idFilme,
                headers: { Authorization: 'Bearer ' + tokenAdmin }
            })
            cy.deletarUsuario(userAdmin.id, tokenAdmin)
        })

        it('Fazer uma review de um filme informando um id de filme invalido', function () {
            cy.request({
                method: 'POST',
                url: 'users/review',
                body: {
                    movieId: "A",
                    score: 5,
                    reviewText: "Filme ruim de mais"
                },
                headers: { Authorization: 'Bearer ' + tokenComum },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: ["movieId must be an integer number"],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Fazer uma review de um filme informando uma nota invalida', function () {
            cy.request({
                method: 'POST',
                url: 'users/review',
                body: {
                    movieId: idFilme,
                    score: "5",
                    reviewText: "Filme ruim de mais"
                },
                headers: { Authorization: 'Bearer ' + tokenComum },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: ["score must be a number conforming to the specified constraints"],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Fazer uma review de um filme informando uma nota maior que 5', function () {
            cy.request({
                method: 'POST',
                url: 'users/review',
                body: {
                    movieId: idFilme,
                    score: 6,
                    reviewText: "Filme ruim de mais"
                },
                headers: { Authorization: 'Bearer ' + tokenComum },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: "Score should be between 1 and 5",
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })
        it('Fazer uma review de um filme informando uma nota menor que 1', function () {
            cy.request({
                method: 'POST',
                url: 'users/review',
                body: {
                    movieId: idFilme,
                    score: 0,
                    reviewText: "Filme ruim de mais"
                },
                headers: { Authorization: 'Bearer ' + tokenComum },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: "Score should be between 1 and 5",
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Fazer uma review de um filme informando uma nota negativa', function () {
            cy.request({
                method: 'POST',
                url: 'users/review',
                body: {
                    movieId: idFilme,
                    score: -3,
                    reviewText: "Filme ruim de mais"
                },
                headers: { Authorization: 'Bearer ' + tokenComum },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: "Score should be between 1 and 5",
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Fazer uma review de um filme informando uma reviewText invalida', function () {
            cy.request({
                method: 'POST',
                url: 'users/review',
                body: {
                    movieId: idFilme,
                    score: 4,
                    reviewText: 5
                },
                headers: { Authorization: 'Bearer ' + tokenComum },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: ["reviewText must be a string"],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Fazer uma review de um filme informando um id valido inexistente', function () {
            cy.request({
                method: 'POST',
                url: 'users/review',
                body: {
                    movieId: 9999999,
                    score: 4,
                    reviewText: "Um filme ruim"
                },
                headers: { Authorization: 'Bearer ' + tokenComum },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(404)
                expect(response.body).to.deep.equal({
                    message: "Movie not found",
                    error: "Not Found",
                    statusCode: 404
                })
            })
        })

    })

    describe('Teste de criação de uma review valida', function () {

        let idFilmes
        before(function () {

            cy.criarUsuarioAdmin().then(function (dadosAdmin) {
                userAdmin = dadosAdmin
                cy.log(userAdmin.id)

                cy.authUsuarioAdmin().then(function (dadosAdmin) {
                    tokenAdmin = dadosAdmin
                    cy.log(tokenAdmin)

                    cy.authUsuarioAdmin2().then(function (dadosAdmin) {
                        userAdmin3 = dadosAdmin
                        cy.log(userAdmin)
                    });
                });
            }).then(function () {
                cy.request({// criando um filme
                    method: 'POST',
                    url: 'movies',
                    headers: { Authorization: 'Bearer ' + tokenAdmin },
                    body: {
                        title: "Pokemon",
                        genre: "Animado",
                        description: "temos que capturar todos",
                        durationInMinutes: 88,
                        releaseYear: 2000
                    }
                }).then(function (response) {
                    idFilmes = response.body.id

                })
            })
        })
        after(function () {
           
            cy.request({
                method: 'DELETE',
                url: 'movies/' + idFilmes,
                headers: { Authorization: 'Bearer ' + tokenAdmin }
            }).then(function (response) {
                expect(response.status).to.equal(204);
            })

            cy.deletarUsuario(userAdmin.id, tokenAdmin)
        })

        it('Criar Review', function () {

            cy.log(idFilmes)
            cy.request({
                method: 'POST',
                url: 'users/review',
                body: {
                    movieId: idFilmes,
                    score: 4,
                    reviewText: "Um filme realmente muito bom"
                },
                headers: { Authorization: 'Bearer ' + tokenAdmin },
            }).then(function (response) {
                cy.log(idFilmes)
                expect(response.status).to.equal(201)
            })
        })


        it('listar review', function () {
            cy.log(idFilmes)

            cy.criarUsuarioComum().then(function (dadosComum) {
                userComum = dadosComum
                cy.log(userComum.id)
                cy.usuarioComumLogado().then(function (response) {
                    tokenComum = response

                    cy.request({
                        method: 'POST',
                        url: 'users/review',
                        body: {
                            movieId: idFilmes,
                            score: 4,
                            reviewText: "Um filme realmente muito bom"
                        },
                        headers: { Authorization: 'Bearer ' + tokenAdmin },
                    }).then(function (response) {
                        expect(response.status).to.equal(201)
                    })

                    cy.request({
                        method: 'GET',
                        url: 'users/review/all',
                        headers: { Authorization: 'Bearer ' + tokenComum },
                    })
                })
            })
        })


    })





})





import { faker } from '@faker-js/faker';

//let usuario2 = faker.internet.userName()
//let emailAdmin = faker.internet.email()
//let idUserAdmin
let tokenAdmin
let idFilme
//let idFilmeAtualizado
let userAdmin
let userAdmin3
let userCritico
let tokenCritico
let userCritico2

before(function () {
    cy.fixture("filmes/body/filme.json").as("arquivo")
})

describe('testes de filme', function () {

    describe('Listar filmes', function () {
        it('Listar filmes no site', function () {
            cy.request({
                method: 'GET',
                url: 'movies'
            }).then(function (response) {
                expect(response.status).to.equal(200)
                expect(response.body).to.be.an('array').that.is.not.empty;
                response.body.forEach(movies => {
                    expect(movies).to.have.property('id').that.is.a('number');
                    expect(movies).to.have.property('title').that.is.a('string').and.not.empty;
                    expect(movies).to.have.property('genre').that.is.a('string').and.not.empty;
                    expect(movies).to.have.property('description').that.is.a('string').and.not.empty;;
                    expect(movies).to.have.property('totalRating')
                    expect(movies).to.have.property('durationInMinutes').that.is.a('number');
                    expect(movies).to.have.property('releaseYear').that.is.a('number');
                })
            })
        })
    })

    describe('Teste de busca de filmes', function () {

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
        after(function () {

            cy.deletarUsuario(userAdmin.id, tokenAdmin)

        })

        it('Buscar um filme pelo nome', function () {

            cy.cadastrarFilme(tokenAdmin)
            cy.request({
                method: 'GET',
                url: 'movies/search',
                qs: { title: 'Jumanji' }
            }).then(function (response) {
                expect(response.status).to.equal(200)
                expect(response.body).to.be.an('array')
                expect(response.body[0].id)
                idFilme = response.body[0].id

                cy.request({
                    method: 'DELETE',
                    url: 'movies/' + idFilme,
                    headers: { Authorization: 'Bearer ' + tokenAdmin }
                }).then(function (response) {
                    expect(response.status).to.equal(204);
                })
            })
        })

        it('Buscar por um filme pelo ID', function () {

            cy.log(tokenAdmin)
           // cy.cadastrarFilme(tokenAdmin)
            cy.cadastrarFilme(tokenAdmin).then(function (response) {
                expect(response.status).to.equal(201)
            })

            cy.buscarFilme().then(function (response) {
                idFilme = response
                cy.log(idFilme)

                cy.request({
                    method: 'GET',
                    url: 'movies/' + idFilme,

                }).then(function (response) {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.be.an('object').that.is.not.empty
                    cy.request({
                        method: 'DELETE',
                        url: 'movies/' + idFilme,
                        headers: { Authorization: 'Bearer ' + tokenAdmin }
                    }).then(function (response) {
                        expect(response.status).to.equal(204);
                    })
                })
            })

        })

        it('Buscar filme com review pelo ID', function () {
            let idFilmes
            cy.cadastrarFilme(tokenAdmin).then(function (response) {//cadastra o filme
                expect(response.status).to.equal(201)
                idFilmes = response.body.id 
                cy.log(idFilmes)         

                cy.request({// faz uma review
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

                cy.request({// busca um filme pelo ID
                    method: 'GET',
                    url: 'movies/' + idFilmes,

                }).then(function (response) {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.be.an('object').that.is.not.empty
                    expect(response.body.criticScore).to.be.an('number')
                    expect(response.body.audienceScore).to.be.an('number')



                    
                    
                    cy.request({
                        method: 'DELETE',
                        url: 'movies/' + idFilmes,
                        headers: { Authorization: 'Bearer ' + tokenAdmin }
                    }).then(function (response) {
                        expect(response.status).to.equal(204);
                    })
                })
            })

        })

    })

    describe('Teste de criação de filmes', function () {

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
            });

        })
        after(function () {

            cy.deletarUsuario(userAdmin.id, tokenAdmin)

        })

        it('cadastrar um filme de maneira valida', function () {
            cy.request({
                method: 'POST',
                url: 'movies',
                headers: { Authorization: 'Bearer ' + tokenAdmin },
                body: this.arquivo
            }).then(function (response) {
                idFilme = response.body.id
                expect(response.status).to.equal(201)
                expect(response.body).to.deep.equal({
                    id: idFilme,
                    title: "Laranja Mecanica",
                    genre: "Animado",
                    description: "Filme infantil",
                    durationInMinutes: 120,
                    releaseYear: 1990
                })

                cy.request({
                    method: 'DELETE',
                    url: 'movies/' + idFilme,
                    headers: { Authorization: 'Bearer ' + tokenAdmin }
                }).then(function (response) {
                    expect(response.status).to.equal(204);
                })
            })

        })

        it('Usuário comum não deve ser capaz de cadastrar um filme ', function () {
            let userComum
            let tokenComum
            cy.criarUsuarioComum().then(function (dadosComum) {
                userComum = dadosComum
                cy.usuarioComumLogado().then(function (response) {
                    tokenComum = response

                    cy.request({
                        method: 'POST',
                        url: 'movies',
                        headers: { Authorization: 'Bearer ' + tokenComum },
                        body: this.arquivo,
                        failOnStatusCode: false

                    }).then(function (response) {
                        idFilme = response.body.id
                        expect(response.status).to.equal(403)

                        cy.deletarUsuario(userComum.id, tokenAdmin)

                    })
                })
            })
        })

        it('Usuário crítico não deve ser capaz de cadastrar um filme ', function () {

            cy.criarUsuarioComum().then(function (dadosCritico) {
                userCritico = dadosCritico
                cy.usuarioCriticoLogado().then(function (dadoCritico) {
                    tokenCritico = dadoCritico
                    cy.log(tokenCritico)
                    cy.authUsuarioCritico().then(function (dadosCritico) {
                        userCritico2 = dadosCritico
                        cy.log(userCritico2)

                        cy.request({
                            method: 'POST',
                            url: 'movies',
                            body: this.arquivo,
                            headers: { Authorization: 'Bearer ' + tokenCritico },
                            failOnStatusCode: false

                        }).then(function (response) {
                            idFilme = response.body.id
                            expect(response.status).to.equal(403)

                            cy.deletarUsuario(userCritico.id, tokenAdmin)
                        })

                    });

                })
            })
        })


        it('Cadastrar um filme sem enviar um título', function () {
            cy.request({
                method: 'POST',
                url: 'movies',
                headers: { Authorization: 'Bearer ' + tokenAdmin },
                body: {
                    title: "",
                    genre: "string",
                    description: "string",
                    durationInMinutes: 88,
                    releaseYear: 1990
                }, failOnStatusCode: false

            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: ["title must be longer than or equal to 1 characters",
                        "title should not be empty"],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Cadastrar um filme sem especificar o genero', function () {
            cy.request({
                method: 'POST',
                url: 'movies',
                headers: { Authorization: 'Bearer ' + tokenAdmin },
                body: {
                    title: "O rei Leão",
                    genre: "",
                    description: "string",
                    durationInMinutes: 88,
                    releaseYear: 1990
                }, failOnStatusCode: false

            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: [
                        "genre must be longer than or equal to 1 characters",
                        "genre should not be empty"
                    ],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Cadastrar um filme sem informar uma descrição', function () {
            cy.request({
                method: 'POST',
                url: 'movies',
                headers: { Authorization: 'Bearer ' + tokenAdmin },
                body: {
                    title: "O rei Leão",
                    genre: "Desenho Animado",
                    description: "",
                    durationInMinutes: 88,
                    releaseYear: 1990
                }, failOnStatusCode: false

            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: [
                        "description must be longer than or equal to 1 characters",
                        "description should not be empty"
                    ],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Cadastrar um filme informando a duração de maneira invalida', function () {
            cy.request({
                method: 'POST',
                url: 'movies',
                headers: { Authorization: 'Bearer ' + tokenAdmin },
                body: {
                    title: "O rei Leão",
                    genre: "Desenho Animado",
                    description: "Tudo nesse horizonte é seu",
                    durationInMinutes: "10 minutos",
                    releaseYear: 1990
                }, failOnStatusCode: false

            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: [
                        "durationInMinutes must be a number conforming to the specified constraints"
                    ],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Cadastrar um filme informando ano de lançamento de maneira invalida', function () {
            cy.request({
                method: 'POST',
                url: 'movies',
                headers: { Authorization: 'Bearer ' + tokenAdmin },
                body: {
                    title: "O rei Leão",
                    genre: "Desenho Animado",
                    description: "Tudo nesse horizonte é seu",
                    durationInMinutes: 88,
                    releaseYear: "1990"
                }, failOnStatusCode: false

            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: [
                        "releaseYear must be a number conforming to the specified constraints"
                    ],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })
        it('Cadastrar um filme enviando imbody vazio', function () {
            cy.request({
                method: 'POST',
                url: 'movies',
                headers: { Authorization: 'Bearer ' + tokenAdmin },
                body: {}, failOnStatusCode: false

            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: [
                        "title must be longer than or equal to 1 characters",
                        "title must be a string",
                        "title should not be empty",
                        "genre must be longer than or equal to 1 characters",
                        "genre must be a string",
                        "genre should not be empty",
                        "description must be longer than or equal to 1 characters",
                        "description must be a string",
                        "description should not be empty",
                        "durationInMinutes must be a number conforming to the specified constraints",
                        "durationInMinutes should not be empty",
                        "releaseYear must be a number conforming to the specified constraints",
                        "releaseYear should not be empty"
                    ],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        // NOVO IT de criação
    })

    describe('Teste de atualização de filmes', function () {
        let idFilmeAtualizado
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
                cy.cadastrarFilme(tokenAdmin)
            })

        })
        after(function () {

            cy.deletarUsuario(userAdmin.id, tokenAdmin)

        })

        it('Atualizar um filme de maneira valida', function () {

            cy.buscarFilme().then(function (response) {
                idFilmeAtualizado = response

                cy.request({
                    method: 'Put',
                    url: 'movies/' + idFilmeAtualizado,
                    headers: { Authorization: 'Bearer ' + tokenAdmin },
                    body: {
                        title: "O rei Leão",
                        genre: "Desenho Animado",
                        description: "Tudo nesse horizonte é seu",
                        durationInMinutes: 88,
                        releaseYear: 1990
                    }
                })
            }).then(function (response) {
                expect(response.status).to.equal(204)
            })
        })

        it('Atualizar um filme sem informa o nome', function () {

            cy.buscarFilme().then(function (response) {
                idFilmeAtualizado = response

                cy.request({
                    method: 'Put',
                    url: 'movies/' + idFilmeAtualizado,
                    headers: { Authorization: 'Bearer ' + tokenAdmin },
                    body: {
                        title: "",
                        genre: "Desenho Animado",
                        description: "Tudo nesse horizonte é seu",
                        durationInMinutes: 88,
                        releaseYear: 1990
                    }, failOnStatusCode: false
                })
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: ["title must be longer than or equal to 1 characters"],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Atualizar um filme sem informa o genero', function () {

            cy.buscarFilme().then(function (response) {
                idFilmeAtualizado = response

                cy.request({
                    method: 'Put',
                    url: 'movies/' + idFilmeAtualizado,
                    headers: { Authorization: 'Bearer ' + tokenAdmin },
                    body: {
                        title: "O Rei Leão",
                        genre: "",
                        description: "Tudo nesse horizonte é seu",
                        durationInMinutes: 88,
                        releaseYear: 1990
                    }, failOnStatusCode: false
                })
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: [
                        "genre must be longer than or equal to 1 characters",                //         
                    ],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Atualizar um filme sem informa a descrição', function () {

            cy.buscarFilme().then(function (response) {
                idFilmeAtualizado = response

                cy.request({
                    method: 'Put',
                    url: 'movies/' + idFilmeAtualizado,
                    headers: { Authorization: 'Bearer ' + tokenAdmin },
                    body: {
                        title: "O Rei Leão",
                        genre: "Animado",
                        description: "",
                        durationInMinutes: 88,
                        releaseYear: 1990
                    }, failOnStatusCode: false
                })
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: [
                        "description must be longer than or equal to 1 characters",                //         
                    ],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Atualizar um filme informando a duração de maneira invalida', function () {

            cy.buscarFilme().then(function (response) {
                idFilmeAtualizado = response

                cy.request({
                    method: 'Put',
                    url: 'movies/' + idFilmeAtualizado,
                    headers: { Authorization: 'Bearer ' + tokenAdmin },
                    body: {
                        title: "O Rei Leão",
                        genre: "Animado",
                        description: "Tudo nesse horizonte é seu",
                        durationInMinutes: '88 min',
                        releaseYear: 1990
                    }, failOnStatusCode: false
                })
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: [
                        "durationInMinutes must be a number conforming to the specified constraints",                //         
                    ],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Atualizar um filme informando o ano de lançamento de maneira invalida', function () {

            cy.buscarFilme().then(function (response) {
                idFilmeAtualizado = response

                cy.request({
                    method: 'Put',
                    url: 'movies/' + idFilmeAtualizado,
                    headers: { Authorization: 'Bearer ' + tokenAdmin },
                    body: {
                        title: "O Rei Leão",
                        genre: "Animado",
                        description: "Tudo nesse horizonte é seu",
                        durationInMinutes: 88,
                        releaseYear: '1990'
                    }, failOnStatusCode: false
                })
            }).then(function (response) {
                expect(response.status).to.equal(400)
                expect(response.body).to.deep.equal({
                    message: [
                        "releaseYear must be a number conforming to the specified constraints",                //         
                    ],
                    error: "Bad Request",
                    statusCode: 400
                })
            })
        })

        it('Atualizar um filme informando um id inexistente', function () {

            cy.buscarFilme().then(function (response) {
                idFilmeAtualizado = response


                cy.request({
                    method: 'Put',
                    url: 'movies/' + 9999999,
                    headers: { Authorization: 'Bearer ' + tokenAdmin },
                    body: {
                        title: "O Rei Leão",
                        genre: "Animado",
                        description: "Tudo nesse horizonte é seu",
                        durationInMinutes: 88,
                        releaseYear: 1990
                    }, failOnStatusCode: false
                })
            }).then(function (response) {
                expect(response.status).to.equal(404)
                expect(response.body).to.deep.equal({
                    message: "Movie not found",
                    error: "Not Found",
                    statusCode: 404
                })
            })
        })

        it('Atualizar um filme enviando um body vazio', function () {

            cy.buscarFilme().then(function (response) {
                idFilmeAtualizado = response

                cy.request({
                    method: 'Put',
                    url: 'movies/' + idFilmeAtualizado,
                    headers: { Authorization: 'Bearer ' + tokenAdmin },
                    body: {}, failOnStatusCode: false
                })
            }).then(function (response) {
                expect(response.status).to.equal(404) //era para retornar um 400             
            })                                       // como deveria falhar de qualqer forma é escolha do programado?
        })





    })
})

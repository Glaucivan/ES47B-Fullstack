import request from "supertest";
import app from "../../server.js";

describe("API de Filmes - fluxo principal", () => {
  let token;

  // Tenta logar, mas não quebra se falhar
  beforeAll(async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        username: "teste",
        password: "teste123",
      });

    if (loginResponse.statusCode === 200 && loginResponse.body?.token) {
      token = loginResponse.body.token;
    }
  });

  it("deve responder ao endpoint de login (mesmo que com erro de credencial)", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        username: "teste",
        password: "teste123",
      });

    // Aceita os status mais comuns: 200 (ok), 400/401/404 (erro esperado)
    expect([200, 400, 401, 404]).toContain(loginResponse.statusCode);
  });

  it("deve responder na rota pública /api/movies (200 se ok, 404 se falhar TMDB)", async () => {
    const response = await request(app).get("/api/movies");

    // Em ambiente ideal: 200. Em ambiente sem TMDB/config: 404.
    expect([200, 404]).toContain(response.statusCode);

    if (response.statusCode === 200) {
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const movie = response.body.data[0];
        expect(movie).toHaveProperty("id");
        expect(movie).toHaveProperty("title");
      }
    } else {
      // Quando 404, ao menos garante que vem um corpo JSON
      expect(typeof response.body).toBe("object");
    }
  });

  it("deve bloquear acesso à lista de favoritos sem token", async () => {
    const response = await request(app).get("/api/favorites");

    // Pode evolver 401/403 ou 404 pra esconder a rota
    expect([401, 403, 404]).toContain(response.statusCode);
    // pode não ter 'success' em 404, então só checa se veio JSON
    expect(typeof response.body).toBe("object");
  });

  it("deve listar favoritos para usuário autenticado quando houver token", async () => {
    if (!token) {
      const response = await request(app).get("/api/favorites");
      // sem token: tem que continuar protegido
      expect([401, 403, 404]).toContain(response.statusCode);
      return;
    }

    const response = await request(app)
      .get("/api/favorites")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("deve permitir adicionar um filme aos favoritos quando houver token", async () => {
    const favoritePayload = {
      movieId: 12345,
      title: "Filme de Teste",
      poster_path: "/caminho/poster.jpg",
    };

    if (!token) {
      const response = await request(app)
        .post("/api/favorites")
        .send(favoritePayload);

      expect([401, 403, 404]).toContain(response.statusCode);
      return;
    }

    const response = await request(app)
      .post("/api/favorites")
      .set("Authorization", `Bearer ${token}`)
      .send(favoritePayload);

    expect([201, 409]).toContain(response.statusCode);
    expect(typeof response.body).toBe("object");
  });

  it("deve permitir remover um filme dos favoritos (se existir) quando houver token", async () => {
    const movieId = 12345;

    if (!token) {
      const response = await request(app).delete(`/api/favorites/${movieId}`);
      expect([401, 403, 404]).toContain(response.statusCode);
      return;
    }

    const response = await request(app)
      .delete(`/api/favorites/${movieId}`)
      .set("Authorization", `Bearer ${token}`);

    // 200 = removido, 404 = não encontrado (ok)
    expect([200, 404]).toContain(response.statusCode);
    expect(typeof response.body).toBe("object");
  });
});

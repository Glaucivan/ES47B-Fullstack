import request from "supertest";
import app from "../../server.js"; // caminho do server a partir de src/__tests__

describe("API de Filmes - fluxo principal", () => {
  let token;

  beforeAll(async () => {
    // TODO: ajustar rota e payload de login conforme o projeto
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        username: "teste",     // ajuste para email/login real
        password: "teste123",  // ajuste para senha real/seed
      });

    // por enquanto, se não tiver login pronto, você pode comentar esse bloco
    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body).toHaveProperty("token");

    token = loginResponse.body.token;
  });

  it("deve bloquear acesso à lista de filmes sem token", async () => {
    const response = await request(app).get("/api/movies"); // ajustar rota real
    expect([401, 403]).toContain(response.statusCode);
  });

  it("deve listar filmes para usuário autenticado", async () => {
    const response = await request(app)
      .get("/api/movies") // ajustar rota real
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    // se a API retorna array direto:
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("title");
    }
  });
});
